<?php
 
require_once 'include/DB_Functions.php';
$db = new DB_Functions();
 
// json response array
$response = array("error" => FALSE);
 
if (isset($_POST['name']) && isset($_POST['email']) && isset($_POST['password']) && isset($_POST['phone'])) {
 
    // receiving the post params
    $name =  $_POST['name'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $phone = $_POST['phone'];
 
    // check if user is already existed with the same email
    if ($db->isUserExisted($email)) {
        // user already existed
        $response["error"] = TRUE;
        $response["error_msg"] = "Používateľ už existuje" . $email;
        echo json_encode($response);
    } else {
        // create a new user
        $user = $db->storeUser($name, $email, $password, $phone);
        if ($user) {
            // user stored successfully
            $response["error"] = FALSE;
            $response["uid"] = $user;
            $response["user"]["name"] = $name;
            $response["user"]["email"] = $email;
            $response["user"]["created_at"] = time();
            echo json_encode($response);
        } else {
            // user failed to store
            $response["error"] = TRUE;
            $response["error_msg"] = "Vyskytla sa chyba pri registrácií";
            echo json_encode($response);
        }
    }
} else {
    $response["error"] = TRUE;
    $response["error_msg"] = "Niektorý povinný parameter nie je vyplnený";
    echo json_encode($response);
}
?>
