<?php
/**
 * Created by PhpStorm.
 * User: Tomas
 * Date: 13.11.2017
 * Time: 23:05
 */

namespace src\Db_api;

use \Firebase\JWT\JWT;

class Login {

    private $config;

    public function __construct($conn)
    {
    $this->config = $conn;

    }

    public function getLogin($email, $password)
    {
        $db = new DbManager($this->config);
        $db->connect();

        $response = array("error" => FALSE);

        $post_body = file_get_contents('php://input');
        $post_json = json_decode($post_body, true);

            // receiving the post params
//            $email = $post_json['email'];
//            $password = $post_json['password'];

            // get the user by email and password

            $user = $db->getUserByEmailAndPassword($email, $password);

            if ($user != false) {
                // use is found
                $response["error"] = FALSE;
                $response["id"] = $user[2];
                $response["role_id"] = $user[3];
                $response["user"]["name"] = $user[0];
                $response["user"]["email"] = $user[1];

                $token = array();
                $token['id'] = $response["id"];

                $response["token"] = JWT::encode($token, 'klobaska');
                echo json_encode($response);
            } else {
                // user is not found with the credentials
                $response["error"] = TRUE;
                $response["error_msg"] = "Login credentials are wrong. Please try again!";
                echo json_encode($response);
            }
    }
}
