<?php

use Slim\Http\Request;
use Slim\Http\Response;
use src\Carrot_api\Api;
use src\Db_api\DbManager;

$app->get('/', function (Request $request, Response $response, array $args) {

    // Sample log message
    //$this->logger->info("Slim-Skeleton '/' route");
    $config = $this->config->getConfig();
    $carrot_api = new Api($config);
    $metrics = $carrot_api->getAllDeviceData();
    // Nazorna ukazka zobrazenia udajov zariadeni

//    for($i = 0; $i < count($metrics); $i++){
//        echo "<h3> Zaznam" . $i .  "</h3><br>";
//        for ($j = 0; $j < count($metrics[$i]); $j++){
//            echo "<p> cas:" . $metrics[$i][$j]['cas'] . "/<p>";
//            echo "<p> hodnota:" . $metrics[$i][$j]['hodnota'] . "/<p>";
//            echo "<p> typ:" . $metrics[$i][$j]['typ'] . "/<p>";
//            echo "<br>";
//        }
//    }

    // Render index view
    return $this->renderer->render($response, 'index.phtml', ['menu' => $request->getAttribute('menu')]);
});

$app->get('/api', function (Request $request, Response $response, array $args) {


    $config = $this->config->getConfig();
    $carrot_api = new Api($config);
    $metrics = $carrot_api->getAllDeviceData();
    // Nazorna ukazka zobrazenia udajov zariadeni

    for($i = 0; $i < count($metrics); $i++){
        echo "<h3> Zaznam" . $i .  "</h3><br>";
        for ($j = 0; $j < count($metrics[$i]); $j++){
            echo "<p> cas:" . $metrics[$i][$j]['cas'] . "/<p>";
            echo "<p> hodnota:" . $metrics[$i][$j]['hodnota'] . "/<p>";
            echo "<p> typ:" . $metrics[$i][$j]['typ'] . "/<p>";
            echo "<br>";
        }
    }

});

$app->get('/db/devices/{device_id}', function (Request $request, Response $response, array $args) {


    $config = $this->config->getConfig();

    $dbManager = new DbManager($config);
    $dbManager->connect();

    $devices = $dbManager->getUsersDevices($args['device_id']);

    // Nazorna ukazka zobrazenia udajov zariadeni
    $rows = array();
    while($r =  pg_fetch_assoc($devices)) {
        $rows[] = $r;
    }
    print json_encode($rows);

});

$app->get('/api/measurements/{device_id}', function (Request $request, Response $response, array $args) {
    $config = $this->config->getConfig();
    $carrot_api = new Api($config);
    $metrics = $carrot_api->getLastDeviceData($args['device_id']);

    print json_encode($metrics);

//    for($i = 0; $i < count($metrics); $i++){
//        echo "<h3> Zaznam" . $i .  "</h3><br>";
//        for ($j = 0; $j < count($metrics[$i]); $j++){
//            echo "<p> cas:" . $metrics[$i][$j]['cas'] . "/<p>";
//            echo "<p> hodnota:" . $metrics[$i][$j]['hodnota'] . "/<p>";
//            echo "<p> typ:" . $metrics[$i][$j]['typ'] . "/<p>";
//            echo "<br>";
//        }
//    }

});

