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

    public function getActual($device_name)
    {
        $params = [
            "accept: application/json",
            "carriots.apikey: " . $this->config['carrot_db.key'],
            "content-type: application/json"

        ];
        return $this->getData($this->config['carrot_db.host'] . "/streams/?device=" . $device_name ."&max=1", $params);
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

    //Ziskanie posledneho merania pre zaradenie s nazvom  $device_name

    public function getLastDeviceData($device_name)
    {
        $devices_data = $this->getDevices();

        $devices = [];
        array_push($devices, $this->getActual($device_name));

        $metrics = [];
        array_push($metrics, $devices[0]['result'][0]['data']['Merania']);

        return $metrics;

    }

}