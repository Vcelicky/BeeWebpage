<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 27.11.2017
 * Time: 19:06
 */
ob_start();
include ('./../../API/login.php');
$returned_value = ob_get_contents();    // get contents from the buffer
ob_end_clean();

echo $returned_value;