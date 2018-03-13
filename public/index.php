<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
if (PHP_SAPI == 'cli-server') {
    // To help the built-in PHP dev server, check if the request was actually for
    // something which should probably be served as a static file
    $url  = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

require __DIR__ . '/../vendor/autoload.php';

session_start();

// Instantiate the app
$settings = require __DIR__ . '/../src/settings.php';
$app = new \Slim\App($settings);

// Fetch DI Container
$container = $app->getContainer();

// Register provider

$container['config'] = function () {
    //Create the configuration
    return new \DavidePastore\Slim\Config\Config('./../config.json');
};


$container['notFoundHandler'] = function ($container) {
    return function ($request, $response) use ($container) {
        $notFoundPage = file_get_contents(__DIR__ . '/../templates/page404.html');

        return $container['response']
            ->withStatus(404)
            ->withHeader('Content-Type', 'text/html')
            ->write($notFoundPage);

    };
};

//$container['notFoundHandler'] = function ($container) {
//    return function ($request, $response) use ($container) {
//       return $container['response']->withStatus(404);
////        return $c['view']->render($response,__DIR__ . '/../templates/index.phtml')->withStatus(404);
//    };
//};

// Register middleware for all routes
// If you are implementing per-route checks you must not add this
$app->add($container->get('config'));

// Set up dependencies
require __DIR__ . '/../src/dependencies.php';

// Register middleware
require __DIR__ . '/../src/middleware.php';

// Register routes
require __DIR__ . '/../src/routes.php';

// Run app
$app->run();
