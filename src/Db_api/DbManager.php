<?php
/**
 * Created by PhpStorm.
 * User: Tomas
 * Date: 11.11.2017
 * Time: 11:25
 */

namespace src\Db_api;

class DbManager
{
    private $config;
    private $conn;

    public function __construct($conn)
    {
        $this->config = $conn;
    }

    public function connect(){
        $host = $this->config['pg_db.host'];
        $port = $this->config['pg_db.port'];
        $dbName = $this->config['pg_db.dbname'];
        $user = $this->config['pg_db.user'];
        $password = $this->config['pg_db.password'];

        $this->conn = pg_connect("host=$host port=$port dbname=$dbName user=$user password=$password");
    }

    //TODO Temporary function
    //Returns all users
    public function getUsers(){
        $result = pg_query($this->conn, "SELECT * FROM bees.users");

        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }

        return $result;
    }

    //Returns names of users devices in Carriots format by userId parameter
    public function getUsersDevices($userId){
        $result = pg_query($this->conn, "SELECT d.name FROM bees.users u
                                                         JOIN bees.devices d ON u.id = d.user_id
                                                         WHERE u.id =3");
        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }

        return $result;
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