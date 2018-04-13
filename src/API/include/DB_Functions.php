<?php
require __DIR__ . '/../vendor/autoload.php';
use bb\Sha3\Sha3;

class DB_Functions {

    private $conn;

    // constructor
    function __construct() {
        require_once 'DB_Connect.php';
        // connecting to database
        $db = new \Db_Connect();
        $this->conn = $db->connect();
    }

    // destructor
    function __destruct() {

    }

    /**
     * Storing new user
     * returns user details
     */
    public function storeUser($name, $email, $password, $phone) {
        $salt = uniqid(mt_rand(), true);
        $crpypted = Sha3::hash($salt . $password, 512);
        $result  = pg_query($this->conn, "INSERT INTO bees.users (name, email, id, role_id, password_hash, password_salt, phone)
          VALUES ('".$name."', '".$email."',  default, 1, '".$crpypted."', '".$salt."', '".$phone."')");
        if ($result) {
            $id_row = pg_query_params($this->conn, "SELECT * FROM bees.users WHERE email = $1" , array($email));
            $id = pg_fetch_row($id_row);
            return $id[2];
        }

        return false;
    }

    public function getUser($id) {
        $query = 'SELECT name, email, phone
              FROM bees.users
              WHERE id = $1;';
        $result = pg_prepare($this->conn, 'user', $query);
        $result = pg_execute($this->conn, 'user', [$id]);

        $return_value['error'] = false;

        if (!$result) {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }
        else {
            $user =  pg_fetch_row($result);
            $return_value['data'] = $user;
        }
        return $return_value;

    }

    /**
     * Change user personal data
     * return database update status
     */
    public function changeUserData($user_id, $name, $phone) {
        $query = 'UPDATE bees.users SET name = $1, phone = $2
                  WHERE id = $3;';

        $result = pg_prepare($this->conn, 'change user query', $query);
        $result = pg_execute($this->conn, 'change user query', [$name, $phone, $user_id]);

        $return_value['error'] = false;

        if (!$result) {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }
        return $return_value;
    }

    public function deleteUser($id) {
        $query = 'DELETE FROM bees.users WHERE id = $1';
        $result = pg_prepare($this->conn, 'delete user query', $query);
        $result = pg_execute($this->conn, 'delete user query', [$id]);

        $return_value['error'] = false;

        if (!$result) {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }
        return $return_value;
    }
 
    /**
     * Get user by email and password
     */
    public function getUserByEmailAndPassword($email, $password) {

        $user = $this->isUserExisted($email);
        if ($user) {
            $salt = $user[5];
            $newHash = Sha3::hash($salt . $password, 512);
            if (strcmp($newHash, $user[4]) === 0) {
                return $user;
            }
        }

        return false;
    }
 
    /**
     * Check user is existed or not
     */
    public function isUserExisted($email) {
        $result = pg_query_params($this->conn, 'SELECT * FROM bees.users WHERE email = $1', array($email));
        $row =  pg_fetch_row($result);

        return count($row) > 0 ? $row : false;
    }

}

?>

