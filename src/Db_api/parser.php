<?php
/**
 * Created by PhpStorm.
 * User: michal
 * Date: 23.2.2018
 * Time: 8:50
 */

namespace src\Db_api;

class parser
{
	public static function getData($data) {

        if(strlen($data)==11)
        {
            $data="0" . $data;
        }

        if(strlen($data)==10)
        {
            $val="00" . $data;
        }

        if(strlen($data)==9)
        {
            $data="000" . $data;
        }

        if(strlen($data)==12)
        {
            $parsing = str_split($data, 1);
            $parsing1 = str_split($data, 2);
            $poloha=$parsing[0];
            $poloha_dec=hexdec($poloha);
            $poloha_bin=decbin($poloha_dec);
            $poloha_upr=substr($poloha_bin, -1);

            $hmotnost=$parsing[1] . $parsing[2];
            $hmotnost_dec=hexdec($hmotnost);
            $hmotnost_bin=decbin($hmotnost_dec);

            if(strlen($hmotnost_bin)==0)
            {
                $hmotnost_bin="00000000" . $hmotnost_bin;
            }

            if(strlen($hmotnost_bin)==1)
            {
                $hmotnost_bin="0000000" . $hmotnost_bin;
            }

            if(strlen($hmotnost_bin)==2)
            {
                $hmotnost_bin="000000" . $hmotnost_bin;
            }

            if(strlen($hmotnost_bin)==3)
            {
                $hmotnost_bin="00000" . $hmotnost_bin;
            }

            if(strlen($hmotnost_bin)==4)
            {
                $hmotnost_bin="0000" . $hmotnost_bin;
            }
            if(strlen($hmotnost_bin)==5)
            {
                $hmotnost_bin="000" . $hmotnost_bin;
            }

            if(strlen($hmotnost_bin)==6)
            {
                $hmotnost_bin="00" . $hmotnost_bin;
            }

            if(strlen($hmotnost_bin)==7)
            {
                $hmotnost_bin="0" . $hmotnost_bin;
            }


            if(strlen($hmotnost_bin)==8)
            {
                $hmotnost_bin=substr($hmotnost_bin, 0, -1);
            }
            $hmotnost_opr=bindec($hmotnost_bin);

            $teplota_von=hexdec($parsing1[5]);
            $teplota_dnu=hexdec($parsing1[4]);

            $vlhkost_von=hexdec($parsing1[3]);
            $vlhkost_von_bin=decbin($vlhkost_von);
            if(strlen($vlhkost_von_bin)==8)
            {
                $vlhkost_von_bin=substr($vlhkost_von_bin, 1);
            }
            $vlhkost_von_opr=bindec($vlhkost_von_bin);

            $bateria_prve=$parsing[2];
            $bateria_prve_dec=hexdec($bateria_prve);
            $bateria_prve_bin=decbin($bateria_prve_dec);
            if(strlen($bateria_prve_bin)==3)
            {
                $bateria_prve_bin="0" . $bateria_prve_bin;
            }
            if(strlen($bateria_prve_bin)==2)
            {
                $bateria_prve_bin="00" . $bateria_prve_bin;
            }
            if(strlen($bateria_prve_bin)==1)
            {
                $bateria_prve_bin="000" . $bateria_prve_bin;
            }
            if(strlen($bateria_prve_bin)==4)
            {
                $bateria_c1=substr($bateria_prve_bin, -1);
            }
            $bateria_druhe=$parsing[3];
            $bateria_druhe_dec=hexdec($bateria_druhe);
            $bateria_druhe_bin=decbin($bateria_druhe_dec);
            if(strlen($bateria_druhe_bin)==3)
            {
                $bateria_druhe_bin="0" . $bateria_druhe_bin;
            }

            if(strlen($bateria_druhe_bin)==2)
            {
                $bateria_druhe_bin="00" . $bateria_druhe_bin;
            }

            if(strlen($bateria_druhe_bin)==1)
            {
                $bateria_druhe_bin="000" . $bateria_druhe_bin;
            }
            $bateria_tretie=$parsing[4];
            $bateria_tretie_dec=hexdec($bateria_tretie);
            $bateria_tretie_bin=decbin($bateria_tretie_dec);
            if(strlen($bateria_tretie_bin)==3)
            {
                $bateria_tretie_bin="0" . $bateria_tretie_bin;
            }

            if(strlen($bateria_tretie_bin)==2)
            {
                $bateria_tretie_bin="00" . $bateria_tretie_bin;
            }

            if(strlen($bateria_tretie_bin)==1)
            {
                $bateria_tretie_bin="000" . $bateria_tretie_bin;
            }
            $bateria_c3=substr($bateria_tretie_bin, 0, 2);
            $bateria_final_bin=$bateria_c1 . $bateria_druhe_bin . $bateria_c3;
            $bateria_final_dec=bindec($bateria_final_bin);

            $vlhkost_dnu_prve=$parsing[4];
            $vlhkost_dnu_prve_dec=hexdec($vlhkost_dnu_prve);
            $vlhkost_dnu_prve_bin=decbin($vlhkost_dnu_prve_dec);
            if(strlen($vlhkost_dnu_prve_bin)==3)
            {
                $vlhkost_dnu_prve_bin="0" . $vlhkost_dnu_prve_bin;
            }

            if(strlen($vlhkost_dnu_prve_bin)==2)
            {
                $vlhkost_dnu_prve_bin="00" . $vlhkost_dnu_prve_bin;
            }

            if(strlen($vlhkost_dnu_prve_bin)==1)
            {
                $vlhkost_dnu_prve_bin="000" . $vlhkost_dnu_prve_bin;
            }
            $vlhkost_dnu_c1=substr($vlhkost_dnu_prve_bin, -2);
            $vlhkost_dnu_druhe=$parsing[5];
            $vlhkost_dnu_druhe_dec=hexdec($vlhkost_dnu_druhe);
            $vlhkost_dnu_druhe_bin=decbin($vlhkost_dnu_druhe_dec);
            if(strlen($vlhkost_dnu_druhe_bin)==3)
            {
                $vlhkost_dnu_druhe_bin="0" . $vlhkost_dnu_druhe_bin;
            }

            if(strlen($vlhkost_dnu_druhe_bin)==2)
            {
                $vlhkost_dnu_druhe_bin="00" . $vlhkost_dnu_druhe_bin;
            }

            if(strlen($vlhkost_dnu_druhe_bin)==1)
            {
                $vlhkost_dnu_druhe_bin="000" . $vlhkost_dnu_druhe_bin;
            }
            $vlhkost_dnu_tretie=$parsing[6];
            $vlhkost_dnu_tretie_dec=hexdec($vlhkost_dnu_tretie);
            $vlhkost_dnu_tretie_bin=decbin($vlhkost_dnu_tretie_dec);
            $vlhkost_dnu_c3=0;
            if(strlen($vlhkost_dnu_tretie_bin)==4)
            {
                $vlhkost_dnu_c3=substr($vlhkost_dnu_tretie_bin, 0, 1);
            }
            $vlhkost_dnu_final_bin=$vlhkost_dnu_c1 . $vlhkost_dnu_druhe_bin . $vlhkost_dnu_c3;
            $vlhkost_dnu_final_dec=bindec($vlhkost_dnu_final_bin);
        $parsed_data = [
            "hmotnost" => $hmotnost_opr,
            "poloha" => $poloha_upr,
            "teplota_von" => $teplota_von,
            "teplota_dnu" => $teplota_dnu,
            "vlhkost_von" => $vlhkost_von_opr,
            "vlhkost_dnu" => $vlhkost_dnu_final_dec,
            "stav_baterie" => $bateria_final_dec
        ];

        return $parsed_data;
    }}

}
