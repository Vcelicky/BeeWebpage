<?php


namespace src\Carrot_api;

use \Firebase\JWT\JWT;
use src\Db_api\DbManager;

class Api extends Base
{

    private $config;

    public function __construct($config)
    {
        $this->config = $config;

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
        return $this->getData($this->config['carrot_db.host'] . "/streams/?device=" . $device_name . "&max=1", $params);
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
     * @return array of data if valid token |null if invalid token
     */
    public function getLastDeviceData($device_name, $token)
    {


        if($this->isValidDeviceToken($device_name, $token) == false){
            return null;
        }

        $devices = [];
        array_push($devices, $this->getActual($device_name));

        $metrics = [];
        array_push($metrics, $devices[0]['result'][0]['data']['Merania']);

        return $metrics;
    }


    /** Get all measurements for device with device_name = $device_name
     * @param $device_name
     * @param $token
     * @return array of data if valid token |null if invalid token
     */
    public function getHistoryDeviceData($device_name, $token)
    {

        if($this->isValidDeviceToken($device_name, $token) == false){
            return null;
        }

        $result = [];
        $metrics = [];
        array_push($result, $this->getHistory($device_name));

        for ($i = 0; $i < $result[0]['total_documents']; $i++) {
            array_push($metrics, $result[0]['result'][$i]['data']['Merania']);
        }

        return $metrics;
    }


    /** Verifies token for device
     * @param $device_name Name of device
     * @param $token Users token
     * @return bool TRUE if valid, FALSE if invalid token
     */
    public function isValidDeviceToken($device_name, $token){

        try {
            $decoded = JWT::decode($token, $this->config['program.token'], array('HS256'));

            $db = new DbManager($this->config);
            $db->connect();

            //Validate user
            if (!$db->isUsersDevice($decoded->id, $device_name)) {
                header('HTTP/1.0 401 Unauthorized');
                return false;
            }

        } catch (\Exception $e) {

            header('HTTP/1.0 401 Unauthorized');
            return false;
        }

        return true;
    }

}