<?php
/**
 * Created by PhpStorm.
 * User: Tomas
 * Date: 11.11.2017
 * Time: 11:25
 */

namespace src\Db_api;
use \Firebase\JWT\JWT;

class DbManager
{
    private $config;
    private $conn;
    private $tokenizer;

    public function __construct($conn)
    {
        $this->config = $conn;
        $this->tokenizer = new Tokenizer($conn);
    }

    public function connect() {
        $host = $this->config['pg_db.host'];
        $port = $this->config['pg_db.port'];
        $dbName = $this->config['pg_db.dbname'];
        $user = $this->config['pg_db.user'];
        $password = $this->config['pg_db.password'];

        $this->conn = pg_connect("host=$host port=$port dbname=$dbName user=$user password=$password");
    }

    /** Returns names of users devices in Carriots format by userId parameter
     * @param $userId
     * @param $token
     */
    public function getUsersDevices($userId, $token)
    {

        if($this->tokenizer->isValidToken($token, $userId) == false){

            return 401;
        }

        $query = 'SELECT d.uf_name FROM bees.users u
                  JOIN bees.devices d ON u.id = d.user_id
                  WHERE u.id = $1';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array($userId));

        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }

        $rows = array();
        while($r =  pg_fetch_assoc($result)) {
            $rows[] = $r;
        }

        //https://stackoverflow.com/questions/22089602/create-json-array-using-php
        print json_encode(array('data'=>$rows));
        return 200;
    }

    /**
     * @param $userId
     * @param $token
     * @return int
     */
    public function getUsersDevicesInfo($userId, $token)
    {

        if($this->tokenizer->isValidToken($token, $userId) == false){
            print json_encode(array('error'=>true));
            return 401;
        }

        $query = 'SELECT d.name, d.uf_name, d.location, d.coordinates FROM bees.users u
                  JOIN bees.devices d ON u.id = d.user_id
                  WHERE u.id = $1';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array($userId));

        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }

        $rows = array();
        while($r =  pg_fetch_assoc($result)) {
            $rows[] = $r;
        }

        print json_encode(array('data'=>$rows));
        return 200;
    }

    /** Returns if $device with $device_name has relation with %user with $userId
     * @param $userId
     * @param $device_name
     * @return bool
     */
    public function isUsersDevice($userId, $device_name) {
        $query = 'SELECT u.id FROM bees.users u
                JOIN bees.devices d ON u.id = d.user_id
                WHERE d.name LIKE $1';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array($device_name."%"));

        $rows = array();
        while($r =  pg_fetch_assoc($result)) {
            $rows[] = $r;
        }

        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }
        else if (($rows[0]['id']) == $userId)
            return true;
        else {
            return false;
        }
    }

    /** Logged in user creates order for device
     * @param $name
     * @param $email
     * @param $phone
     * @param $device_count
     * @param $notes
     */
    public function createOrder2($name, $email,  $phone, $device_count, $notes) {

        $query = 'INSERT INTO bees.orders(name, email, phone, device_count, notes)
                  VALUES ($1, $2, $3, $4, $5);';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array("$name", "$email", "$phone", "$device_count", "$notes"));


        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }
    }

    //TODO Add token, userId, check
    public function createOrder($userId, $token, $name, $email,  $phone, $device_count, $notes) {
        if(!$this->tokenizer->isValidToken($token, $userId)){
            print json_encode(array('error'=>true));
            return 401;
        }


        $query = 'INSERT INTO bees.orders(name, email, phone, device_count, notes)
                  VALUES ($1, $2, $3, $4, $5);';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array("$name", "$email", "$phone", "$device_count", "$notes"));


        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }
        return 200;
    }

    function disconnect(){
        pg_close($this->conn);
    }

    /*
     * Login Functions
     */

    //TODO opravit chybu: Nepozna id a role_id
//    public function storeUser($name, $email, $password) {
//        $uuid = uniqid('', true);
//        $hash = $this->hashSSHA($password);
//        $encrypted_password = $hash["encrypted"]; // encrypted password
//        $salt = $hash["salt"]; // salt
//        //toto este treba dorobit, lebo asi sa nebude insertovat takto...
//        $stmt = $this->conn->prepare("INSERT INTO bees.users(name, email, id, role_id, encrypted_password, salt) VALUES(?, ?, ?, ?, ?, ?)");
//        $stmt->bind_param("ssssss", $name, $email, $id, $role_id, $encrypted_password, $salt);
//        $result = $stmt->execute();
//        $stmt->close();
//
//        // check for successful store
//        if ($result) {
//            $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
//            $stmt->bind_param("s", $email);
//            $stmt->execute();
//            $user = $stmt->get_result()->fetch_assoc();
//            $stmt->close();
//
//            return $user;
//        } else {
//            return false;
//        }
//    }

    /**
     * Get user by email and password
     */
    public function getUserByEmailAndPassword($email, $password) {

        $rs = pg_query_params($this->conn, "SELECT * FROM bees.users WHERE email = $1" , array($email))
        or die("Cannot execute query");
        if(!$rs){
            echo "Error while executing query\n";
        }
        if ($user = pg_fetch_row($rs)) {
            // verifying user password
            //$salt = $user['salt'];
            $encrypted_password = $user[4];
            //$hash = $this->checkhashSSHA($salt, $password);
            $hash = $password;

            // check for password equality
            if ($encrypted_password == $hash) {
                // user authentication details are correct
                return $user;
            }
        } else {
            return NULL;
        }
    }

    /**
     * Check user is existed or not
     */
    public function isUserExisted($email) {
        $stmt = $this->conn->prepare("SELECT email from bees.users WHERE email = ?");

        $stmt->bind_param("s", $email);

        $stmt->execute();

        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            // user existed
            $stmt->close();
            return true;
        } else {
            // user not existed
            $stmt->close();
            return false;
        }
    }

    /**
     * Encrypting password
     * @param password
     * returns salt and encrypted password
     */
    public function hashSSHA($password) {

        $salt = sha1(rand());
        $salt = substr($salt, 0, 10);
        $encrypted = base64_encode(sha1($password . $salt, true) . $salt);
        $hash = array("salt" => $salt, "encrypted" => $encrypted);
        return $hash;
    }
    /**
     * Decrypting password
     * @param salt, password
     * returns hash string
     */
    public function checkhashSSHA($salt, $password) {
        $hash = base64_encode(sha1($password . $salt, true) . $salt);
        return $hash;
    }

}