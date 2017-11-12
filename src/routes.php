<?php

use Slim\Http\Request;
use Slim\Http\Response;
use src\Carrot_api\Api;

$app->get('/', function (Request $request, Response $response, array $args) {

    // Sample log message
    //$this->logger->info("Slim-Skeleton '/' route");
    $config = $this->config->getConfig();
    $carrot_api = new Api($config);
    $metrics = $carrot_api->getAllDeviceData();
    return $this->renderer->render($response, 'index.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
});

$app->get('/register', function (Request $request, Response $response, array $args) {
    return $this->renderer->render($response, 'register_form.phtml', ['menu' => $request->getAttribute('menu'), 'footer' => $request->getAttribute('footer')]);
});