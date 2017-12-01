<?php

use Slim\Http\Request;
use Slim\Http\Response;
use src\Carrot_api\Api;
use src\Db_api\DbManager;
use src\Db_api\Login;
use src\middlware\UserMenuMiddleware;


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



$app->get('/bee-hives/', function (Request $request, Response $response, array $args) {
    $allPostPutVars = $request->getParams();
    $config = $this->config->getConfig();
    $dbManager = new DbManager($config);
    $dbManager->connect();

    ob_start();
    $dbManager->getUsersDevices($allPostPutVars['user_id'], $allPostPutVars['token']);
    $returnedValue = ob_get_contents();    // get contents from the buffer
    ob_end_clean();
    $devices =  json_decode($returnedValue);
    return $this->renderer->render($response, 'beehives.phtml', ['user' => $request->getAttribute('user'), 'footer' => $request->getAttribute('footer'), 'devices' => $devices]);
})->add(function($request, $response, $next) {
    $user = [
        'name' => 'anonymous user'
    ];

    $footer = '
                    
                    <div id="footer-bottom" class="row">
                        
                            <div class="copyright-text col-md-6 col-sm-6 col-xs-12">
                                <div class="copyright">
                                    © 2017, All rights reserved.
                                </div>
                            </div>
                            <div class="copyright-text col-md-6 col-sm-6 col-xs-12">
                                <div class="design">
                                    Designed by: Vcelicky TEAM
                                </div>
                            </div>
                        
                    </div>
            ';

    $request = $request->withAttribute('user', $user);
    $request = $request->withAttribute('footer', $footer);
    $response = $next($request, $response);


    return $response;
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
    include ('./../../API/register.php');
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
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();

    $login = new Login($config);
    ob_start();
    //include ('./../../API/login.php');
    $login->getLogin($allPostPutVars['email'], $allPostPutVars['password']);
    $returned_value = ob_get_contents();    // get contents from the buffer
    ob_end_clean();

    // return value form login script
    $returnn = (array) json_decode($returned_value);
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

    $dbManager->getUsersDevices($allPostPutVars['user_id'], $allPostPutVars['token']);
});

/**
 * Returns last measurement
 * Body: device_name, token
 */
$app->post('/api/measurements/actual', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();
    $carrot_api = new Api($config);
    $measurement = $carrot_api->getLastDeviceData($allPostPutVars['device_name'], $allPostPutVars['token']);
    print json_encode($measurement);
});

/**
 * Returns all measurements
 * Body: device_name, token
 */
$app->post('/api/measurements/all', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $allPostPutVars = $request->getParams();
    $carrot_api = new Api($config);
    $measurement = $carrot_api->getHistoryDeviceData($allPostPutVars['device_name'], $allPostPutVars['token']);
    print json_encode($measurement);
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
