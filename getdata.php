<?php
  header('Content-Type: application/json');

  include('database.php');

  $mysqli = new mysqli($database["localhost"],
	                   $database["user"],
	                   $database["password"],
	                   $database["database"]);

  if($mysqli->connect_errno) {
    printf("Connect failed: %s\n", $mysqli->connect_error);
    exit();
  }

  $links = array();
  $categories = array();
  $result = $mysqli->query("SELECT * FROM links order by id desc");
  if($result) {
	while($row = $result->fetch_assoc()) {
	  array_push($links, $row);
	}
	$result->close();
  }
  $result = $mysqli->query("SELECT * FROM categories");
  if($result) {
	while($row = $result->fetch_assoc()) {
	  array_push($categories, $row);
	}
	$result->close();
  }

  $data["links"] = $links;
  $data["categories"] = $categories;
  
  echo json_encode($data);
