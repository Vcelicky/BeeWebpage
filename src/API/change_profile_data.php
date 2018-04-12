<?php
require_once 'include/DB_Functions.php';
use \Firebase\JWT\JWT;

if ((strlen($_POST['user_name']) > 0) && (strlen($_POST['user_phone']) > 0)) {
    $db = new DB_Functions();
    $result = ['error' => false];
    $user_current_data = $db->getUser($_COOKIE['user_id']);

    // check if user set new password
    if ((strlen($_POST['user_pass']) > 0) && (strcmp($_POST['user_email'], $user_current_data['data'][1]) != 0)) {
        if (!$db->isUserExisted($_POST['user_email'])) {
            $delete_status = $db->deleteUser($_COOKIE['user_idd']);
            if (!$delete_status['error']) {
                $result = $db->storeUser($_POST['user_name'], $_POST['user_email'], $_POST['user_pass'], $_POST['user_phone']);
                $_SESSION['user_name'] = $_POST['user_name'];
                $_SESSION['user_email'] = $_POST['user_name'];
                $_SESSION['user_phone'] = $_POST['user_phone'];
            }
        }
    }
    else {
        // update  user personal data
        $result = $db->changeUserData($_COOKIE['user_id'], $_POST['user_name'], $_POST['user_phone']);
        $_SESSION['user_name'] = $_POST['user_name'];
        $_SESSION['user_email'] = $_POST['user_name'];
        $_SESSION['user_phone'] = $_POST['user_phone'];
    }

    echo json_encode($result, true);

}