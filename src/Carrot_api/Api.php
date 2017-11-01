<?php


namespace src\Carrot_api;

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
        return $this->getData($this->config['carrot_db.host'] . "/devices/" . $id ."/streams/", $params);
    }

    public function getAllDeviceData()
    {
        $devices_data = $this->getDevices();
        //echo $devices_data;
        $devices = [];

        for($i = 0; $i< $devices_data['total_documents']; $i++) {
            $id = $devices_data['result'][$i]['_ls']['id_d'];
            array_push($devices, $this->getDevice($id));
        }
        $a = 1;
        $metrics = [];
        for($j = 0; $j< $devices[0]['total_documents']; $j++){
            array_push($metrics, $devices[0]['result'][$j]['data']['Merania']);
        }

        return $metrics;

    }

}