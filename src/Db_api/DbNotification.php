<?php
/**
 * Created by PhpStorm.
 * User: michal
 * Date: 30.3.2018
 * Time: 1:53
 */

namespace src\Db_api;
use \Firebase\JWT\JWT;

class DbNotification
{

    protected $config;
    protected $conn;
    protected $tokenizer;

    public function __construct($conn)
    {
        $this->config = $conn;
        $this->tokenizer = new Tokenizer($conn);

        $host = $this->config['pg_db.host'];
        $port = $this->config['pg_db.port'];
        $dbName = $this->config['pg_db.dbname'];
        $user = $this->config['pg_db.user'];
        $password = $this->config['pg_db.password'];

        $this->conn = pg_connect("host=$host port=$port dbname=$dbName user=$user password=$password");
    }

    public function addNotificationMessage($item, $time, $hive_name) {
        $returned_message = [
            "title" => "",
            "body"  => ""
        ];

        $message_topic = preg_split('/_/', key($item));

        if (count($message_topic) < 2) {
            // weight message
            if (strcmp(key($item), "weight") === 0) {
                $returned_message["title"] = date("d.m G:i", $time) . ' ' . $hive_name;
                $returned_message["body"]  = "Hmotnosť úľa je " . $item["weight"]["value"] . "kg";
            }

            // battery
            if (strcmp(key($item), "battery") === 0) {
                $returned_message["title"] = date("d.m G:i", $time) . ' ' . $hive_name;
                $returned_message["body"]  = "Hodnota batérie je " . $item["battery"]["value"] . "%";
            }

            //proximity
            if (strcmp(key($item), "poloha") === 0) {
                $returned_message["title"] = date("d.m G:i", $time) . ' ' . $hive_name;
                $returned_message["body"]  = "Úl sa prevrátil";
            }
        }
        else {
            //humidity
            if (strcmp($message_topic[0], "vlhkost") === 0) {
                $returned_message["title"] = date("d.m G:i", $time) . ' ' . $hive_name;
                $returned_message["body"]  = "Hodnota vlhkosti " . $message_topic[1] . " má hodnotu " . $item[key($item)]["value"] . "%";
            }
            //temperature
            if (strcmp($message_topic[0], "teplota") === 0) {
                $returned_message["title"] = date("d.m G:i", $time) . ' ' . $hive_name;
                $returned_message["body"]  = "Hodnota teploty " . $message_topic[1] . " má hodnotu " . $item[key($item)]["value"] . "°C";
            }

        }

        return $returned_message;
    }

    public function sendFCMNotification($message, $hive_id, $hive_name, $user_id, $key) {
        $data = [
            "data" => [
                "title_text" => $message["title"],
                "text" => $message["body"],
                "hive_id" => $hive_id,
                "hive_name" => $hive_name,
                "priority" => "high"
            ],
            "to" => "/topics/" . $user_id
        ];

        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://fcm.googleapis.com/fcm/send",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => json_encode($data, true),
            CURLOPT_HTTPHEADER => array(
                "authorization: " . $key,
                "content-type: application/json"
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if (!$err) {
            return $response;
        }

        return false;
    }

    public function sendEmail($message, $hive_name, $user_email) {
        $result = 'Upozornenie prekročenia hodnoty v úle ' . $hive_name;

        $headers  = "MIME-Version: 1.0" . PHP_EOL;
        $headers .= "Content-Type: text/html; charset=utf-8" . PHP_EOL;
        $headers .= "From: WEB-Včeličky Team" . PHP_EOL;

        $message = $message['title'] . '\n' . $message['body'];
        if ( Mail("fiittp20@gmail.com ", $result, $message, $headers) )
        {
            return true;
        }

        return false;
    }

    public function addNotification($hive_id, $notifications, $time, $key) {
        $user_id = $notifications["user_id"];
        $hive_name = $notifications["hive_name"];
        $user_email = "";
        $email_send = false;
        $error = false;
        array_pop($notifications);
        array_pop($notifications);
        $query =   'INSERT INTO bees.notifications(title_text, body_text, hive_id, hive_name, user_id, time, token)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);';
        $notification_query = pg_prepare($this->conn, "notification insertion", $query);

        // check if notification is already sent
        $check_query = 'SELECT id FROM bees.notifications WHERE user_id = $1 AND time = $2;';
        $check_result = pg_prepare($this->conn, "notification check", $check_query);
        $check_result = pg_execute($this->conn, "notification check", [$user_id, date('Y-m-d G:i:s', $time)]);
        $mobile_send = (pg_fetch_row($check_result)) ? false : true;

        // check if user set email notification
        // later check sms notification

        $not_query = 'SELECT email_not, sms_not FROM bees.devices WHERE device_id = $1;';
        $not_result = pg_prepare($this->conn, 'notification sent', $not_query);
        $not_result = pg_execute($this->conn, 'notification sent', [$hive_id]);
        $result = pg_fetch_row($not_result);
        if (strcmp($result[0], 't') == 0) {
            // get user email
            $email_query = 'SELECT email FROM bees.users WHERE id = $1';
            $email_result = pg_prepare($this->conn, 'email query', $email_query);
            $email_result = pg_execute($this->conn, 'email query', [$user_id]);

            if ($email_result) {
                $user_email = pg_fetch_row($email_result)[0];
                $email_send = true;
            }
        }

        foreach ($notifications as $notification) {
            $message = $this->addNotificationMessage($notification, $time, $hive_name);
            if ($mobile_send)
                $this->sendFCMNotification($message, $hive_id, $hive_name, $user_id, $key);
            $result = pg_execute($this->conn, "notification insertion", [
                $message["title"],
                $message["body"],
                $hive_id,
                $hive_name,
                $user_id,
                date('Y-m-d G:i:s', $time),
                $time . $hive_id . $user_id . $message["title"]
            ]);

            if (!$result) {
                error_log(pg_last_error(), true);
                $error = true;
            }
            else {
                if (!$this->sendEmail($message, $hive_name, $user_email)) {
                    return false;
                }
            }
        }

        return $error;

    }
    public function checkNotification($data, $device_id) {
        $result = false;

        $query = 'SELECT  d.user_id,
                          d.uf_name,
                          d.weight_limit,
                          d.temperature_out_down_limit,
                          d.temperature_out_up_limit,
                          d.temperature_in_down_limit,
                          d.temperature_in_up_limit,
                          d.humidity_out_down_limit,
                          d.humidity_out_up_limit,
                          d.humidity_in_down_limit,
                          d.humidity_in_up_limit,
                          d.batery_limit								
                 FROM bees.devices d
                 WHERE d.device_id = $1;';

        $devices_limits = pg_prepare($this->conn, 'device limits query', $query);
        $devices_limits = pg_execute($this->conn, 'device limits query', [$device_id]);
        $limits = pg_fetch_row($devices_limits);

        if ($limits) {
            $result = [];
            $devices_limits = pg_prepare($this->conn, 'device limits query', $query);
            // first check weight and batery
            if ($data['hmotnost'] > $limits[2]) {
                array_push($result, ['weight' => ['value' => $data['hmotnost'], 'type' => '']]);
            }
            if($data['stav_baterie'] < $limits[count($limits) - 1]) {
                array_push($result, ['battery' => ['value' => $data['stav_baterie'], 'type' => '']]);
            }

            // remove checked data rows
            $data = array_reverse($data);
            array_pop($data);
            $data = array_reverse($data);
            array_pop($data);

            // check proximity
            if ($data[0] != 0) {
                array_push($result, ['poloha' => ['value' => $data['poloha'], 'type' => '']]);
            }
            $data = array_reverse($data);
            array_pop($data);
            $data = array_reverse($data);

            // check up and down limits of temperature and humidity
            $limit_item = 3;
            foreach ($data as $key => $data_item) {
                if ($data_item < $limits[$limit_item]) {
                    array_push($result, [$key => ['value' => $data_item, 'type' => 'down']]);
                }
                $limit_item++;
                if ($data_item > $limits[$limit_item]) {
                    array_push($result, [$key => ['value' => $data_item, 'type' => 'up']]);
                }
                $limit_item++;
            }

            //check if any notification was added
            if (count($result) > 0) {
                $result['user_id']   = $limits[0];
                $result['hive_name'] = $limits[1];
            }

        }
        return $result;
    }

    public function getUserNotifications($userId, $token, $limit = 10, $offset = 0) {
        if($this->tokenizer->isValidToken($token, $userId) == false){
            return [
                'error'   => true,
                'status'  => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $query = 'SELECT *,
                    ( SELECT COUNT(*) FROM bees.notifications i WHERE i.seen = false ) AS count
                  FROM bees.notifications n
                  WHERE n.user_id = $1
                  ORDER BY n.id DESC 
                  LIMIT $2
                  OFFSET $3;';

        $result_pr = pg_prepare($this->conn, 'notification user', $query);
        $result_pr = pg_execute($this->conn, 'notification user', [$userId, $limit, $offset]);
        $notifications = pg_fetch_all($result_pr);

        if ($notifications) {
            return [
                'status' => 200,
                'data' => $notifications
            ];
        }
        else {
            error_log(pg_last_error(), true);
            return [
                'status' => 500,
                'data' => pg_last_error()
            ];
        }

    }

    public function deleteNotification($user_id, $token, $id) {
        if($this->tokenizer->isValidToken($token, $user_id) == false){
            return [
                'error'   => true,
                'status'  => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $userNotification = pg_prepare($this->conn, 'user row', '
            SELECT n.user_id FROM bees.notifications n WHERE n.id = $1;
        ');
        $userNotification = pg_execute($this->conn, 'user row', [$id]);
        $row = pg_fetch_row($userNotification);
        if ($row) {
            if ($row[0] === $user_id) {
                $delete_row = pg_prepare($this->conn, 'delete row', '
                DELETE FROM bees.notifications n WHERE n.id = $1; 
                ');
                $delete_row = pg_execute($this->conn, 'delete row', [$id]);
                if ($delete_row) {
                    return [
                        'status' => 200,
                        'data' => 'Notification was successfully removed'
                    ];
                }
            }
        }

        return [
            'status' => 500,
            'data' => pg_last_error()
        ];
    }

    public function changeNotification($user_id, $token, $id) {
        if($this->tokenizer->isValidToken($token, $user_id) == false){
            return [
                'error'   => true,
                'status'  => 401,
                'message' => 'Unauthorized access'
            ];
        }

        $userNotification = pg_prepare($this->conn, 'user row', '
            SELECT n.user_id FROM bees.notifications n WHERE n.id = $1;
        ');
        $userNotification = pg_execute($this->conn, 'user row', [$id]);
        $row = pg_fetch_row($userNotification);
        if ($row) {
            if ($row[0] === $user_id) {
                $update_row = pg_prepare($this->conn, 'change row', '
                UPDATE bees.notifications SET seen = $1 WHERE id = $2; 
                ');
                $update_row = pg_execute($this->conn, 'change row', [true, $id]);
                if ($update_row) {
                    return [
                        'status' => 200,
                        'data' => 'Notification was successfully changed'
                    ];
                }
            }
        }

        return [
            'status' => 500,
            'data' => pg_last_error()
        ];
    }
}