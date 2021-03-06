<?php
/**
 * Created by PhpStorm.
 * User: toma7
 * Date: 17.3.2018
 * Time: 16:00
 */

namespace src\Db_api;


class DbManagerAdmin extends DbManager
{
    public function getAdminUsers()
    {
        $return_value['error'] = false;

        $query = 'SELECT DISTINCT u.id, u.name, u.email, count(d.user_id) as hive_count
                    FROM bees.users u
                    LEFT JOIN bees.devices d ON u.id = d.user_id
                    GROUP BY (u.id, u.name, u.email)
                    HAVING u.role_id=1
                    ORDER BY hive_count DESC';

        $result = pg_prepare($this->conn, "my_query", $query);
        $result = pg_execute($this->conn, "my_query", array());

        if (!$result) {
            $return_value['error'] = true;
            $return_value['message'] = 'sql error';
            return $return_value;
        }

        $rows = array();
        while($r =  pg_fetch_assoc($result)) {
            $rows[] = $r;
        }

        $return_value['data'] = $rows;
        return $return_value;
    }

    public function getAdminUserDevices($userId) {

        $result = pg_prepare($this->conn, 'devices select', '
        SELECT * FROM bees.devices d
        WHERE d.user_id = $1;');
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

    public function deleteDevice($deviceId) {

        $result = pg_prepare($this->conn, 'devices select', '
        DELETE FROM bees.devices d
        WHERE d.device_id = $1;');
        $result = pg_execute($this->conn, 'devices select', [$deviceId]);
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

    public function getAdminActualUserMeasurements($deviceId) {

        $result = pg_prepare($this->conn, 'user data select', '
        SELECT m.time, m.temperature_in, m.weight, m.proximity, m.temperature_out, m.humidity_in,
         m.humidity_out, m.batery FROM bees.devices d
                  JOIN bees.measurements m ON d.device_id = m.device_name
                  WHERE m.device_name = $1
                  ORDER BY m.time DESC
                  LIMIT 1;');
        $result = pg_execute($this->conn, 'user data select', [$deviceId]);
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

    public function getAdminUserMeasurements($deviceId, $from, $to) {

        $result = pg_prepare($this->conn, 'user data select', '
        SELECT m.time, m.temperature_in, m.weight, m.proximity, m.temperature_out, m.humidity_in,
         m.humidity_out, m.batery FROM bees.devices d
                  JOIN bees.measurements m ON d.device_id = m.device_name
                  WHERE m.device_name = $1 AND m.time BETWEEN $2 AND $3
                  ORDER BY m.time DESC;');
        $result = pg_execute($this->conn, 'user data select', [$deviceId, $from, $to]);
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

    public function getAdminDeviceInfo($deviceId)
    {
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
}