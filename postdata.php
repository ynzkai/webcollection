<?php
  //header('Content-Type: application/json');

  include('database.php');

  $mysqli = new mysqli($database["localhost"],
	                   $database["user"],
	                   $database["password"],
	                   $database["database"]);

  if($mysqli->connect_errno) {
    printf("Connect failed: %s\n", $mysqli->connect_error);
    exit();
  }

  $sql = "";
  if($_POST['flag'] == "DEL") {
    $sql = "DELETE FROM links WHERE id=" . $_POST['id'];
  } elseif($_POST['flag'] == "EDIT") {
    $sql = "UPDATE links SET cid=%d, name='%s', link='%s' WHERE id=%d";
	$sql = sprintf($sql, $_POST['cid'], $_POST['name'], $_POST['link'], $_POST['id']);
  } elseif($_POST['flag'] == "ADD") {
    $sql = "INSERT INTO links (cid, name, link) values(%d, '%s', '%s')";
	$sql = sprintf($sql, $_POST['cid'], $_POST['name'], $_POST['link']);
  }

  $result = $mysqli->query($sql);

  $links = array();
  $result = $mysqli->query("SELECT * FROM links order by id desc");
  if($result) {
	while($row = $result->fetch_assoc()) {
	  array_push($links, $row);
	}
	$result->close();
  }

  echo json_encode($links);

