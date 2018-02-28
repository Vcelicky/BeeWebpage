<?php
/**
 * Created by PhpStorm.
 * User: Tomas
 * Date: 6.12.2017
 * Time: 20:44
 */

namespace src\Db_api;

use \Firebase\JWT\JWT;


class Tokenizer
{
    private $config;

    public function __construct($conn)
    {
        $this->config = $conn;
    }

    /**
     * @return mixed
     */
    public function createToken($responseId, $time)
    {
        $token = array();
        $token['id'] = $responseId;
        $token['time'] = $time;
        $token['random'] = $this->generateRandomString();
        return JWT::encode($token, $this->config['program.token']);
    }

    /** The main token verification method
     * @param $token
     * @param $userId
     */
    public function isValidToken($token, $userId){
        //Validate token
        try {
            $decoded = JWT::decode($token, $this->config['program.token'], array('HS256'));
            if ($decoded->id != $userId) {
                header('HTTP/1.0 401 Unauthorized');
                return false;
            }
            if($decoded->time < time() + 60*60){
                header('HTTP/1.0 401 Unauthorized');
                return false;
            }
        } catch (\Exception $e) {
            header('HTTP/1.0 401 Unauthorized');
            return false;
        }
        return true;
    }

    /** Verifies token for device
     * @param $device_name Name of device
     * @param $token Users token
     * @return bool TRUE if valid, FALSE if invalid token
     */
    public function isValidDeviceToken($token, $device_name) {

        try {
            $decoded = JWT::decode($token, $this->config['program.token'], array('HS256'));

            $db = new DbManager($this->config);
            $db->connect();

            //Validate user
            if (!$db->isUsersDevice($decoded->id, $device_name)) {
                header('HTTP/1.0 401 Unauthorized');
                return false;
            }
            if($decoded->time < time() + 60*60){
                header('HTTP/1.0 401 Unauthorized');
                return false;
            }

        } catch (\Exception $e) {

            header('HTTP/1.0 401 Unauthorized');
            return false;
        }

        return true;
    }

    function generateRandomString($length = 10) {
        return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
    }

}