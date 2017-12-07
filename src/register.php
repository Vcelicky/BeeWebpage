<?php

ob_start();
include ('./../../API/register.php');
$returned_value = ob_get_contents();    // get contents from the buffer
ob_end_clean();
// return value form login script
$return =  json_decode($returned_value);
echo $returned_value;