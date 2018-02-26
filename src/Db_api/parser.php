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
			$data="00" . $data;
	}

	if(strlen($data)==9)
	{
			$data="000" . $data;
	}

	if(strlen($data)==8)
	{
			$data="0000" . $data;
	}

	if(strlen($data)==12)
	{
        $parsing = str_split($data, 2);
        $parsing1 = str_split($data, 1);

        $poloha=$parsing1[0];
        $poloha=hexdec($poloha);
        $poloha_bin=decbin($poloha);
        $poloha_upravene=substr($poloha_bin, -4, 1); 	//ok

        if(strlen($poloha_bin)==3)
        {
            $poloha_upravene=0;
        }

        $hmotnost_prve=$parsing1[1];
        $hmotnost_prve=hexdec($hmotnost_prve);
        $hmotnost_prve_bin=decbin($hmotnost_prve);
        $hmotnost_druhe=$parsing1[2];
        $hmotnost_druhe=hexdec($hmotnost_druhe);
        $hmotnost_druhe_bin=decbin($hmotnost_druhe);
        $hmotnost_druhe_bin1=substr($hmotnost_druhe_bin, 0, -1);
        $hmotnost_bin=$hmotnost_prve_bin . '' . $hmotnost_druhe_bin1;
        $hmotnost=bindec($hmotnost_bin);								//ok

        $teplota_vonku=$parsing[5];
        $teplota_vonku=hexdec($teplota_vonku); //ok
        $teplota_dnu=$parsing[4];
        $teplota_dnu=hexdec($teplota_dnu);     //ok

        $vlhkost_vonku=$parsing[3];
        $vlhkost_vonku=hexdec($vlhkost_vonku);
        $vlhkost_vonku_bin=decbin($vlhkost_vonku) . "\n";

        if(strlen($vlhkost_vonku_bin)==7)
        {
            $vlhkost_vonku_bin="0" . $vlhkost_vonku_bin;
        }

        $bez_prv=substr($vlhkost_vonku_bin, 1);
        $vlhkost_vonku_upravene=bindec($bez_prv);	//ok


        $c1=substr($hmotnost_druhe_bin, -1, 1);		//vypise posledne cislo
        $c2=hexdec($parsing1[3]);
        $c2_bin=decbin($c2);

        if(strlen($c2_bin)==3)
        {
            $c2_bin="0" . $c2_bin;
        }


        $c3=hexdec($parsing1[4]);
        $c3_bin=decbin($c3);
        $c3_oprava=substr($c3_bin, 0, 2);

        if(strlen($c3_oprava)==1)
        {
            $c3_oprava="0" . $c3_oprava;
        }

        $stav_baterie_bin=$c1 . $c2_bin . $c3_oprava;
        $stav_baterie=bindec($stav_baterie_bin);			//ok

        $d1=$parsing1[4];
        $d1=hexdec($d1);
        $d1_bin=decbin($d1);
        $d1_orez=substr($d1_bin, 0, 2);
        $d2=hexdec($parsing1[5]);
        $d2_bin=decbin($d2);
        $d3=hexdec($parsing1[6]);
        $d3_bin=decbin($d3);
        $d3_op=substr($d3_bin, -4, 1);
        $vlhkost_dnu_bin=$d1_orez . $d2_bin . $d3_op;
        $vlhkost_dnu=bindec($vlhkost_dnu_bin);
        $parsed_data = [
            "hmotnost" => $hmotnost,
            "poloha" => $poloha_upravene,
            "teplota_von" => $teplota_vonku,
            "teplota_dnu" => $teplota_dnu,
            "vlhkost_von" => $vlhkost_vonku_upravene,
            "vlhkost_dnu" => $vlhkost_dnu,
            "stav_baterie" => $stav_baterie
        ];

        return $parsed_data;
    }}

}
