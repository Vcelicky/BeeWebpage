<?php
use Slim\Http\Request;
use Slim\Http\Response;
use src\Db_api\DbManagerAdmin;

/**
 * Admin API routes
 * Protected with Session role_id 2
 */

$app->post('/admin/users', function (Request $request, Response $response, array $args) {


    if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
                return $response->withStatus(401);
            /*
             * Admin is logged in
             */
            else if ($_SESSION['role_id'] == 2){
                $config = $this->config->getConfig();
                $dbManager = new DbManagerAdmin($config);
                $dbManager->connect();
                $users = $dbManager->getAdminUsers();
                if ($users['error']) {
                    return $response->withJson($users, 500);
                } else {
                    return $response->withJson($users, 200);
                }
            }}
    }
    else{
        return $response->withStatus(401);
    }


});

$app->post('/admin/devices', function (Request $request, Response $response, array $args) {

    if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
                return $response->withStatus(401);
            /*
             * Admin is logged in
             */
            else if ($_SESSION['role_id'] == 2){
                $config = $this->config->getConfig();
                $body = json_decode($request->getBody()->getContents());
                $dbManager = new DbManagerAdmin($config);
                $dbManager->connect();
                $devices = $dbManager->getAdminUserDevices($body->user_id);
                if ($devices['error']) {
                    return $response->withJson($devices, 500);
                }
                else {
                    return $response->withJson($devices, 200);
                }
            }}
    }
    else{
        return $response->withStatus(401);
    }
});

$app->delete('/admin/device', function (Request $request, Response $response, array $args) {

    if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
                return $response->withStatus(401);
            /*
             * Admin is logged in
             */
            else if ($_SESSION['role_id'] == 2){
                $config = $this->config->getConfig();
                $body = json_decode($request->getBody()->getContents());
                $dbManager = new DbManagerAdmin($config);
                $dbManager->connect();
                $devices = $dbManager->deleteDevice($body->device_id);
                if ($devices['error']) {
                    return $response->withJson($devices, 500);
                }
                else {
                    return $response->withJson($devices, 200);
                }
            }}
    }
    else{
        return $response->withStatus(401);
    }
});

$app->post('/admin/device', function (Request $request, Response $response, array $args) {

    if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
                return $response->withStatus(401);
            /*
             * Admin is logged in
             */
            else if ($_SESSION['role_id'] == 2){
                $config = $this->config->getConfig();
                $body = json_decode($request->getBody()->getContents());
                $dbManager = new DbManagerAdmin($config);
                $dbManager->connect();
                $devices = $dbManager->getAdminDeviceInfo($body->device_id);
                if ($devices['error']) {
                    return $response->withJson($devices, 500);
                }
                else {
                    return $response->withJson($devices, 200);
                }
            }}
    }
    else{
        return $response->withStatus(401);
    }
});

$app->post('/admin/measurements/actual', function (Request $request, Response $response, array $args) {

    if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
                return $response->withStatus(401);
            /*
             * Admin is logged in
             */
            else if ($_SESSION['role_id'] == 2){
                $config = $this->config->getConfig();
                $dbManager = new DbManagerAdmin($config);
                $body = json_decode($request->getBody()->getContents());
                $dbManager->connect();
                $devices = $dbManager->getAdminActualUserMeasurements($body->device_id);
                if ($devices['error']) {
                    return $response->withJson($devices, 500);
                } else {
                    return $response->withJson($devices, 200);
                }
            }}
    }
    else{
        return $response->withStatus(401);
    }
});

$app->post('/admin/measurements', function (Request $request, Response $response, array $args) {


    if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
                return $response->withStatus(401);
            /*
             * Admin is logged in
             */
            else if ($_SESSION['role_id'] == 2){
                $config = $this->config->getConfig();
                $dbManager = new DbManagerAdmin($config);
                $body = json_decode($request->getBody()->getContents());
                $dbManager->connect();
                $devices = $dbManager->getAdminUserMeasurements($body->device_id , $body->from, $body->to);
                if ($devices['error']) {
                    return $response->withJson($devices, 500);
                }
                else {
                    return $response->withJson($devices, 200);
                }
            }}
    }
    else{
        return $response->withStatus(401);
    }
});