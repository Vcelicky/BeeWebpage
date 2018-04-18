<?php
require_once 'include/DB_Functions.php';
use \Firebase\JWT\JWT;

if ((strlen($_POST['user_name']) > 0) && (strlen($_POST['user_phone']) > 0)) {
    $db = new DB_Functions();
    $result = ['error' => false];
    $user_current_data = $db->getUser($_COOKIE['user_id']);

    $l = $_POST['user_pass'];
    // check if user set new password
    if (strlen($_POST['user_pass']) > 0) {
        if ((strcmp(($user_current_data['data'][1]), $_POST['user_email']) != 0 ) && ($db->isUserExisted($_POST['user_email']))) {
            $result['error'] = true;
            $result['message'] = "Používateľ s daným e-mailom už existuje";
        }
        else {
            $result = $db->changeUserData($_COOKIE['user_id'], $_POST['user_name'], $_POST['user_phone'], $_POST['user_email'],$_POST['user_pass']);
        }
    }
    else {
        // check if email is changed
        if (strcmp($_POST['user_email'], $user_current_data['data'][1]) != 0) {
            $result['error'] = true;
            $result['message'] = "Pri zmene e-mailu treba zadať nové heslo";
        }
        else {
            // update  user personal data
            $result = $db->changeUserData($_COOKIE['user_id'], $_POST['user_name'], $_POST['user_phone'],
                $user_current_data['data'][1], NULL ,$user_current_data['data'][3], $user_current_data['data'][4]
            );
        }
    }

    echo json_encode($result, true);

}