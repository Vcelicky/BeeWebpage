<?php

use Slim\Http\Request;
use Slim\Http\Response;
use src\Carrot_api\Api;
use src\Db_api\DbManager;
use src\Db_api\Login;


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


$app->post('/register/user', function (Request $request, Response $response, array $args) {
    $allPostPutVars = $request->getParams();
    $params = [
        'name' => $allPostPutVars['signupName'],
        'email' => $allPostPutVars['signupEmail'],
        'password' => $allPostPutVars['signupPassword']
    ];
    $_POST = $params;
    ob_start();
    include ('./../../android_login_api/register.php');
    $returned_value = ob_get_contents();    // get contents from the buffer
    ob_end_clean();
    // return value form login script
    $return = (array) json_decode($returned_value);

    return $this->response->withStatus(301)->withHeader('Location', '/');
});

$app->post('/login/user', function (Request $request, Response $response, array $args) {
    $allPostPutVars = $request->getParams();
    $params = [
        'email' => $allPostPutVars['email'],
        'password' => $allPostPutVars['password']
    ];
    $_POST = $params;
    ob_start();
    include ('./../../android_login_api/login.php');
    $returned_value = ob_get_contents();    // get contents from the buffer
    ob_end_clean();
    // return value form login script
    $return = (array) json_decode($returned_value);
    return $this->response->withStatus(301)->withHeader('Location', '/');
});

/**
 * Returns users devices
 * Body: user_id, token
 */
$app->post('/db/devices', function (Request $request, Response $response, array $args) {

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


//TODO Temporary function, returns Token
/**
 * Login user
 * Body: email, password
 */
$app->post('/login2/user', function ($request, $response, $args) {
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();

    $login = new Login($config);
    $login->getLogin($allPostPutVars['email'], $allPostPutVars['password']);
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
