<?php
require __DIR__ . '/../vendor/autoload.php';

use bb\Sha3\Sha3;

class DB_Functions {

    private $conn;

    // constructor
    function __construct() {
        require_once 'DB_Connect.php';
        // connecting to database
        $db = new Db_Connect();
        $this->conn = $db->connect();
    }

    // destructor
    function __destruct() {

    }

    /**
     * Storing new user
     * returns user details
     */
    public function storeUser($name, $email, $password) {
        $salt = uniqid(mt_rand(), true);
        $crpypted = Sha3::hash($salt . $password, 512);
        $result  = pg_query($this->conn, "INSERT INTO bees.users (name, email, id, role_id, password_hash, password_salt) VALUES ('".$name."', '".$email."',  default, 1, '".$crpypted."', '".$salt."')");
        if ($result) {
            $id_row = pg_query_params($this->conn, "SELECT * FROM bees.users WHERE email = $1" , array($email));
            $id = pg_fetch_row($id_row);
            return $id[2];
        }

        return false;
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

