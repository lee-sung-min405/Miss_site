<?php
	include_once('./vendor/autoload.php');
	use Firebase\JWT\JWT;
	use Firebase\JWT\Key;
	$command = $_POST['command'];
	$result = array();
	if ($command == 'create') {
		/*
		한줄평 생성
			사용변수
			jwt
			name
			content
			postID
			date

			jwt_status
			valid : 유효한 토큰
			invalid : 유효하지 않은 토큰
			no_token : 전달된 토큰 없음

			query_status
			success : 한줄평 생성 성공
			fail : 오류
		*/
		include_once('./util/jwt_key.php');
		$args_token = $_POST['jwt'];
		$args_movieName = $_POST['name'];
		$args_content = $_POST['content'];
		$args_postID = $_POST['postID'];
		$args_date = $_POST['date'];
		if ($args_token) {
			try {
				$decoded = JWT::decode($args_token, new Key($secret_key, 'HS256'));
				$decoded_array = (array)$decoded;
				$result['jwt_status'] = 'valid';
			} catch (Exception $e) {
				$result['jwt_status'] = 'invalid';
				$result['jwt_error'] = $e->getMessage();
			}
		} else {
			$result['jwt_status'] = 'no_token';
		}
		if ($result['jwt_status'] == 'valid') {
			include_once('./util/db_info.php');
			$conn = mysqli_connect($db_host, $db_user, $db_passwd);
			if ($conn) {
				$result['db_status'] = 'connected';
				mysqli_select_db($conn, 'miss');
				$sql = "INSERT INTO post_data VALUES('${args_postID}', '{$decoded_array['uid']}', '${args_movieName}', '${args_content}', '${args_date}')";
				$result['query_string'] = $sql;
				$result['query_status'] = 'fail';
				try {
					$queryResult = mysqli_query($conn, $sql);
					if ($queryResult) {
						if (mysqli_affected_rows($conn)) {
							$result['query_status'] = 'success';
						}
					}
				} catch (Exception $e) {
					$result['query_error'] = $e->getMessage();
				}
			} else {
				$result['db_status'] = 'disconnected';
			}
		}
	} else if ($command == 'read') {
		/*
		한줄평 조회
			사용변수
			name

			query_status
			success : 한줄평 조회 성공
			fail : 오류

			query_data
			한줄평 데이터
		*/
		$args_name = $_POST['name'];
		include_once('./util/db_info.php');
		$conn = mysqli_connect($db_host, $db_user, $db_passwd);
		if ($conn) {
			$result['db_status'] = 'connected';
			mysqli_select_db($conn, 'miss');
			$sql = "SELECT post_data.`postID`, post_data.`user`, user_info.`nickname`, post_data.`movie`, post_data.`contents`, post_data.`date` FROM post_data JOIN user_info ON post_data.user = user_info.uid WHERE movie = '${args_name}' ORDER BY date DESC";
			$result['query_string'] = $sql;
			$result['query_status'] = 'fail';
			try {
				$queryResult = mysqli_query($conn, $sql);
				if ($queryResult) {
					$result['query_data'] = array();
					while ($row = mysqli_fetch_array($queryResult, MYSQLI_ASSOC)) {
						$result['query_data'][] = $row;
					}
					$result['query_status'] = 'success';
				}
			} catch (Exception $e) {
				$result['query_error'] = $e->getMessage();
			}
		} else {
			$result['db_status'] = 'disconnected';
		}
	} else if ($command == 'update') {
		/*
		한줄평 수정
			사용변수
			jwt
			postID
			content

			jwt_status
			valid : 유효한 토큰
			invalid : 유효하지 않은 토큰
			no_token : 전달된 토큰 없음

			query_status
			success : 한줄평 수정 성공
			user_invalid : 유효하지 않은 사용자 정보 (권한부족 등등)
			fail : 오류
		*/
		include_once('./util/jwt_key.php');
		$args_token = $_POST['jwt'];
		$args_postID = $_POST['postID'];
		$args_content = $_POST['content'];
		if ($args_token) {
			try {
				$decoded = JWT::decode($args_token, new Key($secret_key, 'HS256'));
				$decoded_array = (array)$decoded;
				$result['jwt_status'] = 'valid';
			} catch (Exception $e) {
				$result['jwt_status'] = 'invalid';
				$result['jwt_error'] = $e->getMessage();
			}
		} else {
			$result['jwt_status'] = 'no_token';
		}
		if ($result['jwt_status'] == 'valid') {
			include_once('./util/db_info.php');
			$conn = mysqli_connect($db_host, $db_user, $db_passwd);
			if ($conn) {
				$result['db_status'] = 'connected';
				mysqli_select_db($conn, 'miss');
				$sql = "UPDATE post_data SET contents='${args_content}' WHERE postID='${args_postID}' AND user='{$decoded_array['uid']}'";
				$result['query_string'] = $sql;
				$result['query_status'] = 'fail';
				try {
					$queryResult = mysqli_query($conn, $sql);
					if ($queryResult) {
						if (mysqli_affected_rows($conn)) {
							$result['query_status'] = 'success';
						} else {
							$result['query_status'] = 'user_invalid';
						}
					}
				} catch (Exception $e) {
					$result['query_error'] = $e->getMessage();
				}
			} else {
				$result['db_status'] = 'disconnected';
			}
		}
	} else if ($command == 'delete') {
		/*
		한줄평 삭제
			사용변수
			jwt
			postID

			jwt_status
			valid : 유효한 토큰
			invalid : 유효하지 않은 토큰
			no_token : 전달된 토큰 없음

			query_status
			success : 한줄평 삭제 성공
			user_invalid : 유효하지 않은 사용자 정보 (권한부족 등등)
			fail : 오류
		*/
		include_once('./util/jwt_key.php');
		$args_token = $_POST['jwt'];
		$args_postID = $_POST['postID'];
		if ($args_token) {
			try {
				$decoded = JWT::decode($args_token, new Key($secret_key, 'HS256'));
				$decoded_array = (array)$decoded;
				$result['jwt_status'] = 'valid';
			} catch (Exception $e) {
				$result['jwt_status'] = 'invalid';
				$result['jwt_error'] = $e->getMessage();
			}
		} else {
			$result['jwt_status'] = 'no_token';
		}
		if ($result['jwt_status'] == 'valid') {
			include_once('./util/db_info.php');
			$conn = mysqli_connect($db_host, $db_user, $db_passwd);
			if ($conn) {
				$result['db_status'] = 'connected';
				mysqli_select_db($conn, 'miss');
				if ($decoded_array['role'] == 1) {
					$sql = "DELETE FROM post_data WHERE postID='${args_postID}'";
				} else {
					$sql = "DELETE FROM post_data WHERE postID='${args_postID}' AND user='{$decoded_array['uid']}'";
				}
				$result['query_string'] = $sql;
				$result['query_status'] = 'fail';
				try {
					$queryResult = mysqli_query($conn, $sql);
					if ($queryResult) {
						if (mysqli_affected_rows($conn)) {
							$result['query_status'] = 'success';
						} else {
							$result['query_status'] = 'user_invalid';
						}
					}
				} catch (Exception $e) {
					$result['query_error'] = $e->getMessage();
				}
			} else {
				$result['db_status'] = 'disconnected';
			}
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