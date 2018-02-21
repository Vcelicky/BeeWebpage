<?php
class DB_Connect {
    private $conn;

    // Connecting to database
    public function connect() {
	$host = "147.175.149.151";
	$port=  "5432";
	$user = "postgres";
	$pass = "smenajlepsi";
	$db = "tp";
	
        // Connecting to mysql database
        //$this->conn = pg_connect("host=DB_HOST port=DB_PORT dbname=DB_DATABASE user=DB_USER password=DB_PASSWORD")
	//		or die ("Could not connect to server\n");
	$connect_string = "host=" . $host . " port=" . $port . " dbname=" . $db . " user=" . $user . " password=" . $pass;
	$this->conn = pg_connect("host=" . $host . " port=" . $port . " dbname=" . $db . " user=" . $user . " password=" . $pass)
	    or die ("Could not connect to server\n");


        // return database handler
        return $this->conn;
    }
}

?>
