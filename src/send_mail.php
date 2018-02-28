<?php
$ma = "";
$subject = 'KONTAKT Včeličky Team';
$result = 'Kontaktný formulár';
$text = $_POST["message"];
$ma = $_POST["mail"];
$prem=0;

$poa = '<html><body>';
$poa .= '<table rules="all" style="border-color: #666;" cellpadding="10">';
$poa .= "<tr style='background: #eee;'><td><strong>Meno:</strong> </td><td>" . strip_tags($_POST['name']) . "</td></tr>";
$poa .= "<tr><td><strong>E-mail:</strong> </td><td>" . strip_tags($_POST['mail']) . "</td></tr>";
$poa .= "<tr><td><strong>Telefón:</strong> </td><td>" . strip_tags($_POST['phone']) . "</td></tr>";
$poa .= "<tr><td><strong>Odkaz:</strong> </td><td>" . strip_tags($_POST['message']) . "</td></tr>";
$poa .= "</table>";
$poa .= "</body></html>";




$headers  = "MIME-Version: 1.0" . PHP_EOL;
$headers .= "Content-Type: text/html; charset=utf-8" . PHP_EOL;
$headers .= "From: WEB-Včeličky Team" . PHP_EOL;


if ($_SERVER["REQUEST_METHOD"] == "POST") {
	
	if (empty($_POST["mail"])) {
    $emailErr = "Email is required";
  } 
}

if ( Mail("fiittp20@gmail.com  ", $result, $poa, $headers) )
{
	echo '<script language="javascript">';
	echo 'alert("Mail bol úspešne odoslaný")';
	echo '</script>';
	
}
else 
{
	echo '<script language="javascript">';
	echo 'alert("Mail sa nepodarilo odoslať")';
	echo '</script>';
}


?>