<?php

use Slim\Http\Request;
use Slim\Http\Response;
use src\Carrot_api\Api;
use src\Db_api\DbManager;
use Slim\Http\Body;

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

//Order
$app->get('/order', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'order.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
});

//Order_verify_data
 $app->post('/order', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'order.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
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
    $returnedValue = $dbManager->insertValue($request->getParams());
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

/**
 * Create new order
 * Body: name, email, phone, device_count, notes
 */
$app->post('/order/new', function ($request, $response, $args) {
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();
    $dbManager = new DbManager($config);
    $dbManager->connect();

    $return = $dbManager->createOrder($allPostPutVars['user_id'], $allPostPutVars['token'], $allPostPutVars['name'], $allPostPutVars['email'], $allPostPutVars['phone'], $allPostPutVars['device_count'], $allPostPutVars['notes']);
    return $response->withStatus($return);
});

//Deprecated
$app->post('/order/new2', function ($request, $response, $args) {
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();
    $dbManager = new DbManager($config);
    $dbManager->connect();
    $dbManager->createOrder2($allPostPutVars['name'], $allPostPutVars['email'], $allPostPutVars['phone'], $allPostPutVars['device_count'], $allPostPutVars['notes']);
});
