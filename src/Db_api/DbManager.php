<?php

namespace src\Db_api;
use \Firebase\JWT\JWT;

class DbManager
{
    protected $config;
    protected $conn;
    protected $tokenizer;

    public function __construct($conn)
    {
        $this->config = $conn;
        $this->tokenizer = new Tokenizer($conn);
    }

    public function connect() {
        $host = $this->config['pg_db.host'];
        $port = $this->config['pg_db.port'];
        $dbName = $this->config['pg_db.dbname'];
        $user = $this->config['pg_db.user'];
        $password = $this->config['pg_db.password'];

        $this->conn = pg_connect("host=$host port=$port dbname=$dbName user=$user password=$password");
    }

    /** Returns names of users devices in Carriots format by userId parameter
     * @param $userId
     * @param $token
     */
    public function getUsersDevices($userId, $token)
    {

        if($this->tokenizer->isValidToken($token, $userId) == false){

            return 401;
        }

        $query = 'SELECT d.name FROM bees.users u
                  JOIN bees.devices d ON u.id = d.user_id
                  WHERE u.id = $1';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array($userId));

        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }

        $rows = array();
        while($r =  pg_fetch_assoc($result)) {
            $rows[] = $r;
        }

        //https://stackoverflow.com/questions/22089602/create-json-array-using-php
        print json_encode(array('data'=>$rows));
        return 200;
    }

    /**
     * @param $userId
     * @param $token
     * @return int
     */
    public function getUsersDevicesInfo($userId, $token)
    {

        if($this->tokenizer->isValidToken($token, $userId) == false){
            print json_encode(array('error'=>true));
            return 401;
        }

        $query = 'SELECT d.name, d.uf_name, d.location, d.coordinates FROM bees.users u
                  JOIN bees.devices d ON u.id = d.user_id
                  WHERE u.id = $1';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array($userId));

        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }

        $rows = array();
        while($r =  pg_fetch_assoc($result)) {
            $rows[] = $r;
        }

        print json_encode(array('data'=>$rows));
        return 200;
    }

    /** Returns if $device with $device_name has relation with %user with $userId
     * @param $userId
     * @param $device_name
     * @return bool
     */
    public function isUsersDevice($userId, $device_name) {
        $query = 'SELECT u.id FROM bees.users u
                JOIN bees.devices d ON u.id = d.user_id
                WHERE d.name LIKE $1';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array($device_name."%"));

        $rows = array();
        while($r =  pg_fetch_assoc($result)) {
            $rows[] = $r;
        }

        if (!$result) {
            echo "Problem with query ";
            echo pg_last_error();
            exit();
        }
        else if (($rows[0]['id']) == $userId)
            return true;
        else {
            return false;
        }
    }

    public function createOrder($userId, $token, $name, $adress, $sms, $email, $notes) {
        $result_value = ['error' => false];
        if(!$this->tokenizer->isValidToken($token, $userId)){
            $result_value['error'] = true;
            $result_value['message'] = 'Používateľ nemá prístup';
            return $result_value;
        }
        $errName ="";
        $errAddress ="";

        if (!preg_match("/^[a-zA-Z á Á ä č Č ď Ď dž Dž é É í ĺ ľ Ľ ó Ó ó š Š ť Ť ú Ú ň Ň ý ž Ž ]*$/",$name)) {
            $errName = "Zadali ste nesprávny formát mena! (príklad: Pekný úlik)";
            $result_value['error'] = true;
            $result_value['message'] = $errName;

            return $result_value;
        }

        if (!preg_match("/^[a-zA-Z 0-9 á ä č Č ď Ď dž Dž é í ĺ ľ Ľ ó š Š ť Ť ú ň Ň ý ž Ž , ]*$/",$adress)) {
            $errAddress = "Zadali ste nesprávny formát adresy! (príklad: Lesnícka 44, Bratislava)";

            $result_value['error'] = true;
            $result_value['message'] = $errAddress;

            return $result_value;
        }


        if (!$errName && !$errAddress)
        {
            $result = 'Žiadosť o potvrdení objednávky';
            $poa = '<html><body>';
            $poa .= '<table rules="all" style="border-color: #666;" cellpadding="10">';
            $poa .= "<tr style='background: #eee;'><td><strong>Meno úľa:</strong> </td><td>" . strip_tags($name) . "</td></tr>";
            $poa .= "<tr><td><strong>Adresa úľa:</strong> </td><td>" . strip_tags($adress) . "</td></tr>";

            if ($email) {
                $poa .= "<tr><td><strong>E-mail:</strong> </td><td>" . Nastavený . "</td></tr>";
            }

            else{
                $poa .= "<tr><td><strong>E-mail:</strong> </td><td>" . Nenastavený . "</td></tr>";
            }


            if ($sms) {
                $poa .= "<tr><td><strong>SMS:</strong> </td><td>" . Nastavené . "</td></tr>";
            }

            else{
                $poa .= "<tr><td><strong>SMS:</strong> </td><td>" . Nenastavené . "</td></tr>";
            }

            $poa .= "<tr><td><strong>Odkaz:</strong> </td><td>" . strip_tags($notes) . "</td></tr>";
            $poa .= "</table>";
            $poa .= "</body></html>";
            $headers  = "MIME-Version: 1.0" . PHP_EOL;
            $headers .= "Content-Type: text/html; charset=utf-8" . PHP_EOL;
            $headers .= "From: WEB-Včeličky Team" . PHP_EOL;
            if ( Mail("fiittp20@gmail.com", $result, $poa, $headers) )
            {
                $_POST = array();
            }
            else
            {
                $result_value['error'] = true;
                $result_value['message'] = 'Pri odosielaní e-mailu nastala neočakávaná chyba, na jej odstránení sa pracuje! Ospravedlňujeme sa.';
            }

        }


        $query = "INSERT INTO bees.orders VALUES ($userId, '$name', '$adress', '$notes', '" . (($sms) ? "true" : "false") . "', '" .
            (($email) ? "true" : "false") . "', 'False');";
        $result = pg_query($this->conn, $query);
        if (!$result) {
            $result_value['error'] = true;
            $result_value['message'] = isset($result_value['message']) ? $result_value['message'] . ' ' . pg_last_error() : pg_last_error();
        }
        return $result_value;
    }

    function disconnect(){
        pg_close($this->conn);
    }

    /*
     * Login Functions
     */

    //TODO opravit chybu: Nepozna id a role_id
//    public function storeUser($name, $email, $password) {
//        $uuid = uniqid('', true);
//        $hash = $this->hashSSHA($password);
//        $encrypted_password = $hash["encrypted"]; // encrypted password
//        $salt = $hash["salt"]; // salt
//        //toto este treba dorobit, lebo asi sa nebude insertovat takto...
//        $stmt = $this->conn->prepare("INSERT INTO bees.users(name, email, id, role_id, encrypted_password, salt) VALUES(?, ?, ?, ?, ?, ?)");
//        $stmt->bind_param("ssssss", $name, $email, $id, $role_id, $encrypted_password, $salt);
//        $result = $stmt->execute();
//        $stmt->close();
//
//        // check for successful store
//        if ($result) {
//            $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
//            $stmt->bind_param("s", $email);
//            $stmt->execute();
//            $user = $stmt->get_result()->fetch_assoc();
//            $stmt->close();
//
//            return $user;
//        } else {
//            return false;
//        }
//    }

    /**
     * Get user by email and password
     */
    public function getUserByEmailAndPassword($email, $password) {

        $rs = pg_query_params($this->conn, "SELECT * FROM bees.users WHERE email = $1" , array($email))
        or die("Cannot execute query");
        if(!$rs){
            echo "Error while executing query\n";
        }
        if ($user = pg_fetch_row($rs)) {
            // verifying user password
            //$salt = $user['salt'];
            $encrypted_password = $user[4];
            //$hash = $this->checkhashSSHA($salt, $password);
            $hash = $password;

            // check for password equality
            if ($encrypted_password == $hash) {
                // user authentication details are correct
                return $user;
            }
        } else {
            return NULL;
        }
    }

    /**
     * Check user is existed or not
     */
    public function isUserExisted($email) {
        $stmt = $this->conn->prepare("SELECT email from bees.users WHERE email = ?");

        $stmt->bind_param("s", $email);

        $stmt->execute();

        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            // user existed
            $stmt->close();
            return true;
        } else {
            // user not existed
            $stmt->close();
            return false;
        }
    }

    /**
     * Encrypting password
     * @param password
     * returns salt and encrypted password
     */
    public function hashSSHA($password) {

        $salt = sha1(rand());
        $salt = substr($salt, 0, 10);
        $encrypted = base64_encode(sha1($password . $salt, true) . $salt);
        $hash = array("salt" => $salt, "encrypted" => $encrypted);
        return $hash;
    }
    /**
     * Decrypting password
     * @param salt, password
     * returns hash string
     */
    public function checkhashSSHA($salt, $password) {
        $hash = base64_encode(sha1($password . $salt, true) . $salt);
        return $hash;
    }

    public function insertValue($raw_data, $fcm_key)
    {
        $data = parser::getData($raw_data['data']['value']);
        // check notifications
        $notification = new DbNotification($this->config);
        $notifications = $notification->checkNotification($data,  $raw_data['id']);
        if ($notifications) {
            $notification->addNotification($raw_data['id'], $notifications, $raw_data['time'], $fcm_key);
        }

        $query = 'INSERT INTO bees.measurements(time, temperature_in, weight, proximity, temperature_out,
                  humidity_in, humidity_out, device_name, batery)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", [
            date('Y-m-d G:i:s', $raw_data['time']),
            $data['teplota_dnu'],
            $data['hmotnost'],
            $data['poloha'],
            $data['teplota_von'],
            $data['vlhkost_dnu'],
            $data['vlhkost_von'],
            $raw_data['id'],
            $data['stav_baterie']
        ]);
        $result_data = "";
        if (!$result) {
            $result_data = pg_last_error();
            return $result_data;
        }

        $result_data = "query was successfully executed";
        return $result_data;
    }

    public function getAllDevices($token, $userId) {
        if($this->tokenizer->isValidToken($token, $userId) == false){
            return [
                'error'   => true,
                'status'  => 401,
                'message' => 'Unauthorized access'
            ];
        }
        $result = pg_query($this->conn, '
        SELECT * FROM bees.devices
        ORDER BY user_id');
        $return_value['error'] = false;
        if ($result) {
            $rows = array();
            while($r =  pg_fetch_assoc($result)) {
                $rows[] = $r;
            }
            $return_value['data'] = $rows;
        }
        else {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }

        return $return_value;
    }

    public function getUserDevices($token, $userId) {
        if($this->tokenizer->isValidToken($token, $userId) == false){
           return [
               'error'   => true,
               'status'  => 401,
               'message' => 'Unauthorized access'
           ];
        }

        $result = pg_prepare($this->conn, 'devices select', '
        SELECT * FROM bees.devices d
        WHERE d.user_id = $1
        ORDER BY d.uf_name;');
        $result = pg_execute($this->conn, 'devices select', [$userId]);
        $return_value['error'] = false;
        if ($result) {
            $rows = array();
            while($r =  pg_fetch_assoc($result)) {
                $rows[] = $r;
            }
            $return_value['data'] = $rows;
        }
        else {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }

        return $return_value;

    }

    public function getActualUserMeasurements($token, $userId, $deviceId) {
        if($this->tokenizer->isValidToken($token, $userId) == false){
            return [
                'error'   => true,
                'status'  => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $result = pg_prepare($this->conn, 'user data select', '
        SELECT m.time, m.temperature_in, m.weight, m.proximity, m.temperature_out, m.humidity_in,
         m.humidity_out, m.batery, d.temperature_in_up_limit, d.weight_limit, d.temperature_out_up_limit, d.humidity_in_up_limit, d.humidity_out_up_limit, 
            d.batery_limit, d.temperature_in_down_limit, d.temperature_out_down_limit,d.humidity_in_down_limit,d.humidity_out_down_limit FROM bees.devices d
                  JOIN bees.measurements m ON d.device_id = m.device_name
                  WHERE d.user_id = $1 AND m.device_name = $2
                  ORDER BY m.time DESC
                  LIMIT 1;');
        $result = pg_execute($this->conn, 'user data select', [$userId, $deviceId]);
        $return_value['error'] = false;
        if ($result) {
            $rows = [];
            while($r =  pg_fetch_assoc($result)) {
                array_push($rows, [
                    0 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['temperature_in'],
                        'typ' => 'IT'
                    ],
                    1 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['temperature_out'],
                        'typ' => 'OT'
                    ],
                    2 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['humidity_in'],
                        'typ' => 'IH'
                    ],
                    3 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['humidity_out'],
                        'typ' => 'OH'
                    ],
                    4 => [
                        'cas' => $r['time'],
                        'hodnota' => strcmp($r['proximity'], "t") === 0 ? 'true' : 'false',
                        'typ' => 'P'
                    ],
                    5 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['weight'],
                        'typ' => 'W'
                    ],
                    6 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['batery'],
                        'typ' => 'B'
                    ],
                    7 => [
                        'temperature_in_up_limit' => $r['temperature_in_up_limit'],
                        'weight_limit' => $r['weight_limit'],
                        'temperature_out_up_limit' => $r['temperature_out_up_limit'],
                        'humidity_in_up_limit' => $r['humidity_in_up_limit'],
                        'humidity_out_up_limit' => $r['humidity_out_up_limit'],
                        'batery_limit' => $r['batery_limit'],
                        'temperature_in_down_limit' => $r['temperature_in_down_limit'],
                        'temperature_out_down_limit' => $r['temperature_out_down_limit'],
                        'humidity_in_down_limit' => $r['humidity_in_down_limit'],
                        'humidity_out_down_limit' => $r['humidity_out_down_limit']
                    ]

                ]);
            }
            $return_value['data'] = $rows;
        }
        else {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }

        return $return_value;
    }

    public function getUserMeasurementsByAmount($token, $userId, $deviceId, $from, $to) {
        /*if((isset($_SESSION['role_id']) && ($_SESSION['role_id'] === 1)) && ($this->tokenizer->isValidToken($token, $userId) == false)){
            return [
                'error'   => true,
                'status'  => 401,
                'message' => 'Unauthorized access'
            ];
        }*/

        $result = pg_prepare($this->conn, 'user data select', '
        SELECT m.time, m.temperature_in, m.weight, m.proximity, m.temperature_out, m.humidity_in,
         m.humidity_out, m.batery FROM bees.devices d
                  JOIN bees.measurements m ON d.device_id = m.device_name
                  WHERE d.user_id = $1 AND m.device_name = $2
                  ORDER BY m.time DESC
                  LIMIT $4
                  OFFSET $3;');
        $result = pg_execute($this->conn, 'user data select', [$userId, $deviceId, $from, $to]);
        $return_value['error'] = false;
        if ($result) {
            $rows = [];
            while($r =  pg_fetch_assoc($result)) {
                array_push($rows, [
                    0 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['temperature_in'],
                        'typ' => 'IT'
                    ],
                    1 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['temperature_out'],
                        'typ' => 'OT'
                    ],
                    2 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['humidity_in'],
                        'typ' => 'IH'
                    ],
                    3 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['humidity_out'],
                        'typ' => 'OH'
                    ],
                    4 => [
                        'cas' => $r['time'],
                        'hodnota' => strcmp($r['proximity'], "t") === 0 ? 'true' : 'false',
                        'typ' => 'P'
                    ],
                    5 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['weight'],
                        'typ' => 'W'
                    ],
                    6 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['batery'],
                        'typ' => 'B'
                    ]
                ]);
            }
            $return_value['data'] = $rows;
        }
        else {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }

        return $return_value;
    }

    public function getUserMeasurements($token, $userId, $deviceId, $from, $to) {
        if((isset($_SESSION['role_id']) && ($_SESSION['role_id'] === 1)) && ($this->tokenizer->isValidToken($token, $userId) == false)){
           return [
               'error'   => true,
               'status'  => 401,
               'message' => 'Unauthorized access'
           ];
        }

        $result = pg_prepare($this->conn, 'user data select', '
        SELECT m.time, m.temperature_in, m.weight, m.proximity, m.temperature_out, m.humidity_in,
         m.humidity_out, m.batery FROM bees.devices d
                  JOIN bees.measurements m ON d.device_id = m.device_name
                  WHERE d.user_id = $1 AND m.device_name = $2 AND m.time BETWEEN $3 AND $4
                  ORDER BY m.time DESC;');
        $result = pg_execute($this->conn, 'user data select', [$userId, $deviceId, $from, $to]);
        $return_value['error'] = false;
        if ($result) {
            $rows = [];
            while($r =  pg_fetch_assoc($result)) {
                array_push($rows, [
                    0 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['temperature_in'],
                        'typ' => 'IT'
                    ],
                    1 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['temperature_out'],
                        'typ' => 'OT'
                    ],
                    2 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['humidity_in'],
                        'typ' => 'IH'
                    ],
                    3 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['humidity_out'],
                        'typ' => 'OH'
                    ],
                    4 => [
                        'cas' => $r['time'],
                        'hodnota' => strcmp($r['proximity'], "t") === 0 ? 'true' : 'false',
                        'typ' => 'P'
                    ],
                    5 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['weight'],
                        'typ' => 'W'
                    ],
                    6 => [
                        'cas' => $r['time'],
                        'hodnota' => $r['batery'],
                        'typ' => 'B'
                    ]
                ]);
            }
            $return_value['data'] = $rows;
        }
        else {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }

        return $return_value;
    }

    public function setLimitValues($token, $userId, $deviceId, $it_u, $it_d, $ot_u, $ot_d, $ih_u, $ih_d, $oh_u, $oh_d, $w, $b)
    {
        if ($this->tokenizer->isValidToken($token, $userId) == false) {
            return [
                'error' => true,
                'status' => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $result = pg_prepare($this->conn, 'user data select', '
        UPDATE bees.devices
        SET temperature_in_up_limit=$2, temperature_in_down_limit=$3, weight_limit=$4, temperature_out_up_limit = $5,  
        temperature_out_down_limit=$6, humidity_in_up_limit= $7, humidity_in_down_limit=$8, humidity_out_up_limit=$9, humidity_out_down_limit=$10, batery_limit=$11
        WHERE bees.devices.device_id=$1;');
        $result = pg_execute($this->conn, 'user data select', [$deviceId, $it_u, $it_d, $w, $ot_u, $ot_d, $ih_u, $ih_d ,$oh_u, $oh_d, $b]);
        $return_value['error'] = false;

        if (!$result) {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }
        return $return_value;
    }

    public function resetLimitValues($token, $userId, $deviceId)
    {
        if ($this->tokenizer->isValidToken($token, $userId) == false) {
            return [
                'error' => true,
                'status' => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $result = pg_prepare($this->conn, 'user data select', '
        UPDATE bees.devices
        SET temperature_in_up_limit=DEFAULT, temperature_in_down_limit=DEFAULT, weight_limit=DEFAULT, temperature_out_up_limit =DEFAULT,  temperature_out_down_limit =DEFAULT, 
        humidity_in_up_limit=DEFAULT, humidity_in_down_limit=DEFAULT, humidity_out_up_limit=DEFAULT, humidity_out_down_limit=DEFAULT, batery_limit=DEFAULT
        WHERE bees.devices.device_id=$1;');
        $result = pg_execute($this->conn, 'user data select', [$deviceId]);
        $return_value['error'] = false;

        if (!$result) {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }
        return $return_value;
    }

    public function updateDeviceName($token, $userId, $deviceId, $name)
    {
        if ($this->tokenizer->isValidToken($token, $userId) == false) {
            return [
                'error' => true,
                'status' => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $result = pg_prepare($this->conn, 'user data select', '
        UPDATE bees.devices
        SET uf_name = $2
        WHERE bees.devices.device_id=$1;');
        $result = pg_execute($this->conn, 'user data select', [$deviceId, $name]);
        $return_value['error'] = false;

        if (!$result) {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }
        return $return_value;
    }

    public function updateDeviceLocation($token, $userId, $deviceId, $location)
    {
        if ($this->tokenizer->isValidToken($token, $userId) == false) {
            return [
                'error' => true,
                'status' => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $result = pg_prepare($this->conn, 'user data select', '
        UPDATE bees.devices
        SET location = $2
        WHERE bees.devices.device_id=$1;');
        $result = pg_execute($this->conn, 'user data select', [$deviceId, $location]);
        $return_value['error'] = false;

        if (!$result) {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }
        return $return_value;
    }

    public function getDeviceInfo($token, $userId, $deviceId)
    {
        if($this->tokenizer->isValidToken($token, $userId) == false){
            return [
                'error'   => true,
                'status'  => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $result = pg_prepare($this->conn, 'devices select', '
        SELECT d.uf_name, d.location, d.coordinates, d.temperature_in_up_limit, d.temperature_in_down_limit, d.weight_limit, d.temperature_out_up_limit, 
        d.temperature_out_down_limit, d.humidity_in_up_limit, d.humidity_in_down_limit, d.humidity_out_up_limit, d.humidity_out_down_limit, d.batery_limit FROM bees.devices d
        WHERE d.device_id = $1');
        $result = pg_execute($this->conn, 'devices select', [$deviceId]);
        $return_value['error'] = false;
        if ($result) {
            $rows = array();
            while($r =  pg_fetch_assoc($result)) {
                $rows = $r;
            }
            $return_value['data'] = $rows;
        }
        else {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
        }

        return $return_value;
    }

    public function getDeviceNotifications($userId, $token, $device) {
        if ($this->tokenizer->isValidToken($token, $userId) == false) {
            return [
                'error' => true,
                'status' => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $query = 'SELECT sms_not, email_not
                  FROM bees.devices
                  WHERE device_id = $1;';
        $result = pg_prepare($this->conn, 'device not', $query);
        $result = pg_execute($this->conn, 'device not', [$device]);
        $result_response = ['error' => false];

        if ($result) {
            $rows = array();
            while($r =  pg_fetch_assoc($result)) {
                $rows = $r;
            }
            $result_response['data'] = $rows;
        }
        else {
            $result_response['error'] = true;
            $result_response['message'] = 'sql error';
        }

        return $result_response;
    }

    public function setDeviceNotifications($userId, $token, $device, $type, $value) {
        if ($this->tokenizer->isValidToken($token, $userId) == false) {
            return [
                'error' => true,
                'status' => 401,
                'message' => 'Unauthorized access'
            ];
        }
        $query = (strcmp($type, 'sms') == 0) ?
            'UPDATE bees.devices
                  SET sms_not = $1
                  WHERE device_id = $2;' :
            'UPDATE bees.devices
                  SET email_not = $1
                  WHERE device_id = $2;';
                  
        $result = pg_prepare($this->conn, 'device not set', $query);
        $result = pg_execute($this->conn, 'device not set', [
            $value ? 'true' : 'false',
            $device]
        );
        $result_response = ['error' => false];

        if (!$result) {
            $result_response['error'] = true;
            $result_response['message'] = pg_last_error();
        }

        return $result_response;
    }


}