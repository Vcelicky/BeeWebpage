<?php


namespace src\Carrot_api;

use \Firebase\JWT\JWT;
use src\Db_api\DbManager;
use src\Db_api\Tokenizer;

class Api extends Base
{

    private $config;
    private $tokenizer;

    public function __construct($config)
    {
        $this->config = $config;
        $this->tokenizer = new Tokenizer($config);
    }


    public function getDevices()
    {
        $params = [
            "accept: application/json",
            "carriots.apikey: " . $this->config['carrot_db.key'],
            "content-type: application/json"

        ];
        return $this->getData($this->config['carrot_db.host'] . "/devices/", $params);

    }

    public function getDevice($id)
    {
        $params = [
            "accept: application/json",
            "carriots.apikey: " . $this->config['carrot_db.key'],
            "content-type: application/json"

        ];
        return $this->getData($this->config['carrot_db.host'] . "/devices/" . $id . "/streams/", $params);
    }

    public function getActual($device_name)
    {
        $params = [
            "accept: application/json",
            "carriots.apikey: " . $this->config['carrot_db.key'],
            "content-type: application/json"

        ];
        return $this->getData($this->config['carrot_db.host'] . "/streams/?device=" . $device_name . "&max=1&order=-1", $params);
    }

    public function getHistory($device_name)
    {
        $params = [
            "accept: application/json",
            "carriots.apikey: " . $this->config['carrot_db.key'],
            "content-type: application/json"

        ];
        return $this->getData($this->config['carrot_db.host'] . "/streams/?device=" . $device_name, $params);
    }


    public function getAllDeviceData()
    {
        $devices_data = $this->getDevices();
        //echo $devices_data;
        $devices = [];

        for ($i = 0; $i < $devices_data['total_documents']; $i++) {
            $id = $devices_data['result'][$i]['_ls']['id_d'];
            array_push($devices, $this->getDevice($id));
        }
        $a = 1;
        $metrics = [];
        for ($j = 0; $j < $devices[0]['total_documents']; $j++) {
            array_push($metrics, $devices[0]['result'][$j]['data']['Merania']);
        }

        return $metrics;

    }



    /** Get last measurement for device with device_name = $device_name
     * @param $device_name
     * @param $token
     */
    public function getLastDeviceData($device_name, $token)
    {

        if($this->tokenizer->isValidDeviceToken($token, $device_name) == false){
            return 401;
        }

        $devices = [];
        array_push($devices, $this->getActual($device_name));

        $metrics = [];
        array_push($metrics, $devices[0]['result'][0]['data']['Merania']);

        print json_encode(array('data'=>$devices[0]['result'][0]['data']['Merania']));
        return 200;
    }


    /** Get all measurements for device with device_name = $device_name
     * @param $device_name
     * @param $token
     */
    public function getHistoryDeviceData($device_name, $token)
    {

        if($this->tokenizer->isValidDeviceToken($token, $device_name) == false) {
            return 401;
        }

        $result = [];
        $metrics = [];
        array_push($result, $this->getHistory($device_name));

        for ($i = 0; $i < $result[0]['total_documents']; $i++) {
            array_push($metrics, $result[0]['result'][$i]['data']['Merania']);
        }

        print json_encode(array('data'=>$metrics));
        return 200;
    }
}