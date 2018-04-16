<?php

use Slim\Http\Request;
use Slim\Http\Response;
use src\Db_api\DbManager;
use src\Db_api\DbNotification;
include (__DIR__ . '/API/include/DB_Functions.php');

$app->get('/', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'index.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
});

$app->get('/api', function (Request $request, Response $response, array $args) {

//    session_start();
    $_SESSION['sid'] = session_id();
    echo $_SESSION['sid'];

    $config = $this->config->getConfig();
    $carrot_api = new Api($config);
    $metrics = $carrot_api->getAllDeviceData();
    // Nazorna ukazka zobrazenia udajov zariadeni

    for ($i = 0; $i < count($metrics); $i++) {
        echo "<h3> Zaznam" . $i . "</h3><br>";
        for ($j = 0; $j < count($metrics[$i]); $j++) {
            echo "<p> cas:" . $metrics[$i][$j]['cas'] . "/<p>";
            echo "<p> hodnota:" . $metrics[$i][$j]['hodnota'] . "/<p>";
            echo "<p> typ:" . $metrics[$i][$j]['typ'] . "/<p>";
            echo "<br>";
        }
    }
});

$app->get('/register', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'register_form.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
});


//Contact
$app->get('/contact', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'contact.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
});

//Contact_verify_data
 $app->post('/contact', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'contact.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
});

//create_order

$app->get('/create_order', function (Request $request, Response $response, array $args) {
	
     if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
            return $this->renderer->render($response, 'order.phtml');
       }

    }

    else
        return $response->withStatus(401);
});

$app->post('/create_order', function (Request $request, Response $response, array $args) {
	
     if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
            return $this->renderer->render($response, 'order.phtml');
       }

    }

    else
        return $response->withStatus(401);
});

$app->post('/order_management', function (Request $request, Response $response, array $args) {
	
     if (isset($_SESSION['id'])){       
            return $this->renderer->render($response, 'order_show.phtml');
    }

    else
        return $response->withStatus(401);
});

$app->get('/order_management', function (Request $request, Response $response, array $args) {
	
     if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 2)
            return $this->renderer->render($response, 'order_show.phtml');
       }

    }

    else
        return $response->withStatus(401);
});

$app->post('/portal', function (Request $request, Response $response, array $args) {
	
     if (isset($_SESSION['id'])){ 
            return $this->renderer->render($response, 'portal_admin.phtml');
    }

    else
        return $response->withStatus(401);
});

//Products
$app->get('/products', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'products.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
});

//Portal
$app->get('/portal', function (Request $request, Response $response, array $args) {
    if (isset($_SESSION['id'])){
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
            return $this->renderer->render($response, 'portal.phtml');
        else if ($_SESSION['role_id'] == 2){
            return $this->renderer->render($response, 'portal_admin.phtml');
        }}

    }

    else
        return $response->withStatus(401);
});

//Portal - Hive
$app->get('/portal/{id}', function (Request $request, Response $response, array $args) {

    if (isset($_SESSION['id']))
        if(isset($_SESSION['role_id'])){
            if($_SESSION['role_id'] == 1)
                return $this->renderer->render($response, 'portal_hive.phtml');
            else if ($_SESSION['role_id'] == 2){
                return $this->renderer->render($response, 'portalAdmin_hive.phtml');
            }}
    else
        return $response->withStatus(401);
});

/*
 * register user
 * body arguments: name, email, password
*/
$app->post('/register/user', function (Request $request, Response $response, array $args) {
    ob_start();
    include (__DIR__ . '/API/register.php');
    $returned_value = ob_get_contents();    // get contents from the buffer
    ob_end_clean();

    echo $returned_value;
});

$app->post('/logout', function (Request $request, Response $response, array $args) {
    ob_start();
    include (__DIR__ . '/logout.php');
    $returned_value = ob_get_contents();    // get contents from the buffer
    ob_end_clean();
});

/*
 * save sigfox data to database
 * params: sigfox data
*/
$app->post('/sigfox', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $dbManager->connect();
    $returnedValue = $dbManager->insertValue($request->getParams(), $config["firebase_cloud_messaging.key"]);
    if ($returnedValue['error']) {
        return $response->withJson($returnedValue, 500);
    }
    else {
        return $response->withJson($returnedValue, 200);
    }
});

$app->post('/devices', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $body = json_decode($request->getBody()->getContents());
    $dbManager = new DbManager($config);
    $dbManager->connect();
    $devices = $dbManager->getAllDevices($body->token, $body->user_id);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    }
    else {
        return $response->withJson($devices, 200);
    }
});

$app->post('/user/devices', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $body = json_decode($request->getBody()->getContents());
    $dbManager = new DbManager($config);
    $dbManager->connect();
    $devices = $dbManager->getUserDevices($body->token, $body->user_id);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    }
    else {
        return $response->withJson($devices, 200);
    }
});

$app->post('/user/device/notifications', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices_notifications = $dbManager->getDeviceNotifications($body->user_id, $body->token, $body->device_id);
    if ($devices_notifications['error']) {
        return $response->withJson($devices_notifications, 500);
    }
    else {
        return $response->withJson($devices_notifications, 200);
    }
});

$app->post('/user/device/notifications/set', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices_notifications = $dbManager->setDeviceNotifications($body->user_id, $body->token, $body->device_id, $body->type, $body->value);
    if ($devices_notifications['error']) {
        return $response->withJson($devices_notifications, 500);
    }
    else {
        return $response->withJson($devices_notifications, 200);
    }
});

$app->post('/user/measurements2', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices = $dbManager->getUserMeasurementsByAmount($body->token, $body->user_id, $body->device_id , $body->from, $body->to);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    }
    else {
        return $response->withJson($devices, 200);
    }
});

$app->post('/user/measurements', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices = $dbManager->getUserMeasurements($body->token, $body->user_id, $body->device_id , $body->from, $body->to);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    }
    else {
        return $response->withJson($devices, 200);
    }
});

$app->post('/user/measurements/actual', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices = $dbManager->getActualUserMeasurements($body->token, $body->user_id, $body->device_id);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    } else {
        return $response->withJson($devices, 200);
    }
});

/**
 * Sets limits of device
 */
$app->put('/user/device/limits', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices = $dbManager->setLimitValues($body->token, $body->user_id, $body->device_id, $body->it_u, $body->it_d, $body->ot_u, $body->ot_d, $body->ih_u, $body->ih_d, $body->oh_u, $body->oh_d, $body->w, $body->b);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    } else {
        return $response->withJson($devices, 200);
    }
});

/**
 * Resets limits od device
 */
$app->put('/user/device/limits/reset', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices = $dbManager->resetLimitValues($body->token, $body->user_id, $body->device_id);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    } else {
        return $response->withJson($devices, 200);
    }
});

/**
 * Updates device name
 */
$app->put('/user/device/name', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices = $dbManager->updateDeviceName($body->token, $body->user_id, $body->id, $body->value);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    } else {
        return $response->withJson($devices, 200);
    }
});

/**
 * Updates device location
 */
$app->put('/user/device/location', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices = $dbManager->updateDeviceLocation($body->token, $body->user_id,$body->id, $body->value);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    } else {
        return $response->withJson($devices, 200);
    }
});

/**
 * Returns all device parameters
 */
$app->post('/user/device', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $body = json_decode($request->getBody()->getContents());
    $dbManager->connect();
    $devices = $dbManager->getDeviceInfo($body->token, $body->user_id, $body->device_id);
    if ($devices['error']) {
        return $response->withJson($devices, 500);
    } else {
        return $response->withJson($devices, 200);
    }
});

/*
 * login user
 * body arguments: email, password
*/
$app->post('/login/user', function (Request $request, Response $response, array $args) {
    ob_start();
    include (__DIR__ . '/API/login.php');
    $returned_value = ob_get_contents();    // get contents from the buffer
    ob_end_clean();

    echo $returned_value;
});

/**
 * Returns users devices
 * Body: user_id, token
 */
$app->post('/db/devices', function (Request $request, Response $response, array $args) {

    //This is how you get the Session Variable
//    $session_id = $_SESSION['id'];

    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();

    $dbManager = new DbManager($config);
    $dbManager->connect();

    $return = $dbManager->getUsersDevices($allPostPutVars['user_id'], $allPostPutVars['token']);
    return $response->withStatus($return);

});

/**
 * Returns users devices with additional informations
 * Body: user_id, token
 */
$app->post('/db/devices/info', function (Request $request, Response $response, array $args) {

    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();

    $dbManager = new DbManager($config);
    $dbManager->connect();

    $return = $dbManager->getUsersDevicesInfo($allPostPutVars['user_id'], $allPostPutVars['token']);
    return $response->withStatus($return);

});

/**
 * Returns last measurement
 * Body: device_name, token
 */
$app->post('/api/measurements/actual', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();
    $carrot_api = new Api($config);
    $return = $carrot_api->getLastDeviceData($allPostPutVars['device_name'], $allPostPutVars['token']);
    return $response->withStatus($return);

});

/**
 * Returns all measurements
 * Body: device_name, token
 */
$app->post('/api/measurements/all', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();
    $carrot_api = new Api($config);
    $return = $carrot_api->getHistoryDeviceData($allPostPutVars['device_name'], $allPostPutVars['token']);
    return $response->withStatus($return);

});

$app->get('/profile', function (Request $request, Response $response, array $args) {
    if (isset($_SESSION['id']))
        if(isset($_SESSION['role_id'])){
            $api_db =  new DB_Functions();
            $user = $api_db->getUser($_SESSION['id']);
            if($_SESSION['role_id'] == 1)
                return $this->renderer->render($response, 'user_profile.phtml',
                    [
                        'name' => $user['data'][0],
                        'email' => $user['data'][1],
                        'phone' => $user['data'][2]
                    ]
                );
            else if ($_SESSION['role_id'] == 2){
                return $this->renderer->render($response, 'admin_profile.phtml',
                    [
                        'name' => $user['data'][0],
                        'email' => $user['data'][1],
                        'phone' => $user['data'][2]
                    ]
                );
            }}
        else
            return $response->withStatus(401);
});

/**
 * Create new order
 * Body: name, email, phone, device_count, notes
 */
$app->post('/order/new', function ($request, $response, $args) {
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();
    $dbManager = new DbManager($config);
    $dbManager->connect();

    $return = $dbManager->createOrder($allPostPutVars['id'], $allPostPutVars['token'], $allPostPutVars['hive_name'], $allPostPutVars['hive_address'], $allPostPutVars['SMS'], $allPostPutVars['E-mail'], $allPostPutVars['notes']);
    if ($return['error']) {
        return $response->withJson($return, 500);
    }
    else {
        return $response->withJson($return, 200);
    }
});

$app->get('/notifications', function (Request $request, Response $response, array $args) {
    if (isset($_SESSION['id'])) {
        if (isset($_SESSION['role_id'])) {
            if ($_SESSION['role_id'] == 1)
                return $this->renderer->render($response, 'notifications_history.phtml');
        }
    }

    else
        return $response->withStatus(401);
});

$app->post('/user/notifications', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $body = json_decode($request->getBody()->getContents());
    $not = new DbNotification($config);
    $notifications = $not->getUserNotifications($body->user_id, $body->token, $body->limit, $body->offset);

    return $response->withJson($notifications['data'], $notifications['status']);
});

$app->delete('/user/notification/delete', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $body = json_decode($request->getBody()->getContents());
    $not = new DbNotification($config);
    $notifications = $not->deleteNotification($body->user_id, $body->token, $body->id);

    return $response->withJson($notifications['data'], $notifications['status']);
});

$app->post('/user/notification/seen', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $body = json_decode($request->getBody()->getContents());
    $not = new DbNotification($config);
    $notifications = $not->changeNotification($body->user_id, $body->token, $body->id);

    return $response->withJson($notifications['data'], $notifications['status']);
});
