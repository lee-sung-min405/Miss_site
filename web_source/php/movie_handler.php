<?php
	include_once('./vendor/autoload.php');
	use Firebase\JWT\JWT;
	use Firebase\JWT\Key;
	$command = $_POST['command'];
	$result = array();
	if ($command == 'getMovieInfo') {
		$args_name = $_POST['name'];
		include_once('./util/db_info.php');
		$conn = mysqli_connect($db_host, $db_user, $db_passwd);
		if ($conn) {
			$result['db_status'] = 'connected';
			mysqli_select_db($conn, 'miss');
			if ($args_name) {
				$sql = "SELECT * FROM movie_data WHERE name='${args_name}';";
			} else {
				$sql = "SELECT * FROM movie_data;";
			}
			$result['query_string'] = $sql;
			$result['query_status'] = 'fail';
			try {
				$queryResult = mysqli_query($conn, $sql);
				if ($queryResult) {
					$result['query_data'] = array();
					if (mysqli_num_rows($queryResult)) {
						while ($row = mysqli_fetch_array($queryResult, MYSQLI_ASSOC)) {
							$result['query_data'][] = $row;
						}
					}
					$result['query_status'] = 'success';
				}
			} catch (Exception $e) {
				$result['query_error'] = $e->getMessage();
			}
		} else {
			$result['db_status'] = 'disconnected';
		}
	} else if ($command == 'getSchedule') {
		include_once('./util/db_info.php');
		$conn = mysqli_connect($db_host, $db_user, $db_passwd);
		if ($conn) {
			$result['db_status'] = 'connected';
			mysqli_select_db($conn, 'miss');
			$sql = $_POST['query'];
			$result['query_string'] = $sql;
			$result['query_status'] = 'fail';
			try {
				$queryResult = mysqli_query($conn, $sql);
				if ($queryResult) {
					$result['query_data'] = array();
					if (mysqli_num_rows($queryResult)) {
						while ($row = mysqli_fetch_array($queryResult, MYSQLI_ASSOC)) {
							$result['query_data'][] = $row;
						}
					}
					$result['query_status'] = 'success';
				}
			} catch (Exception $e) {
				$result['query_error'] = $e->getMessage();
			}
		} else {
			$result['db_status'] = 'disconnected';
		}
	} else {
		/*
		이외의 커맨드
			따로 처리하지 않음
		*/
		$result['query_status'] = 'unknown_command';
	}
	echo json_encode($result);
?>