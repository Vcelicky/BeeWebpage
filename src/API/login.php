<?php
require_once 'include/DB_Functions.php';
use \Firebase\JWT\JWT;

$db = new DB_Functions();

// json response array
$response = array("error" => FALSE);


if (isset($_POST['email']) && isset($_POST['password']) && (strlen($_POST['email']) != 0) && (strlen($_POST['password']) != 0)) {

    // receiving the post params
    $email = $_POST['email'];
    $password = $_POST['password'];

    // get the user by email and password
    $user = $db->getUserByEmailAndPassword($email, $password);

    if ($user != false) {
        $_SESSION['id']=  $user[2];
        $_SESSION['role_id']=  $user[3];
        $_SESSION['user_name'] = $user[0];
        $_SESSION['user_email'] = $user[1];
        $_SESSION['user_phone'] = $user[6];
        // use is found
        $response["error"] = FALSE;
        $response["id"] = $user[2];
        $response["role_id"] = $user[3];
        $response["user"]["name"] = $user[0];
        $response["user"]["email"] = $user[1];
        $response["user"]["phone"] = $user[6];
        $response["expires"] = time() + (24 * 60 * 60) + 60*60; // Unix Timestamp format

        $token = array();
        $token['id'] = $response["id"];
        $token['time'] = $response["expires"];
        $response["token"] = JWT::encode($token, 'klobaska');


        echo json_encode($response);
    } else {
        // user is not found with the credentials
        $response["error"] = TRUE;
        $response["error_msg"] = "Zadali ste nesprávne meno alebo heslo";
        echo json_encode($response);
    }
} else {
    // required post params is missing
    $response["error"] = TRUE;
    $response["error_msg"] = "Zadajte prosím všetky parametre";
    echo json_encode($response);
}
?>
