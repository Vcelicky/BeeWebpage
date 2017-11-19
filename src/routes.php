<?php

use Slim\Http\Request;
use Slim\Http\Response;

$app->get('/', function (Request $request, Response $response, array $args) {

    return $this->renderer->render($response, 'index.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
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
