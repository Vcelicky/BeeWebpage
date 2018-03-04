<?php
/*
 * session_start();
 * Starting a new session before clearing it
 * assures you all $_SESSION vars are cleared
 * correctly, but it's not strictly necessary.
 */
setcookie("PHPSESSID", "", time()-3600);
setcookie("token", "", time()-3600);
setcookie("user_name", "", time()-3600);
setcookie("user_id", "", time()-3600);
session_start();
session_destroy();
session_unset();
//header('Location: index.html');
/* Or whatever document you want to show afterwards */
?>