<?php
	include_once('./vendor/autoload.php');
	use Firebase\JWT\JWT;
	use Firebase\JWT\Key;
	$command = $_POST['command'];
	$result = array();
	if ($command == 'create') {
		/*
		공지사항 생성
			사용변수
			jwt
			noticeID
			category
			title
			content
			date

			jwt_status
			valid : 유효한 토큰
			invalid : 유효하지 않은 토큰
			no_token : 전달된 토큰 없음

			query_status
			success : 공지사항 생성 성공
			user_invalid : 유효하지 않은 사용자 정보 (권한부족 등등)
			fail : 오류
		*/
		include_once('./util/jwt_key.php');
		$args_token = $_POST['jwt'];
		$args_noticeID = $_POST['noticeID'];
		$args_category = $_POST['category'];
		$args_title = $_POST['title'];
		$args_content = $_POST['content'];
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
			if ($decoded_array['role'] == 1) {
				include_once('./util/db_info.php');
				$conn = mysqli_connect($db_host, $db_user, $db_passwd);
				if ($conn) {
					$result['db_status'] = 'connected';
					mysqli_select_db($conn, 'miss');
					$sql = "INSERT INTO notice_data VALUES('${args_noticeID}', '${args_title}', '${args_content}', '${args_date}', '${args_category}', 0)";
					$result['query_string'] = $sql;
					$result['query_status'] = 'fail';
					try {
						$queryResult = mysqli_query($conn, $sql);
						if ($queryResult) {
							$result['query_status'] = 'success';
						}
					} catch (Exception $e) {
						$result['query_error'] = $e->getMessage();
					}
				} else {
					$result['db_status'] = 'disconnected';
				}
			} else {
				$result['query_status'] = 'user_invalid';
			}
		}
	} else if ($command == 'read') {
		/*
		공지사항 조회
			사용변수
			noticeID (있으면 단일조회, 없으면 전체조회)

			query_status
			success : 공지사항 조회 성공
			fail : 오류

			query_data
			공지사항 데이터 (단일 또는 전체)
		*/
		$args_noticeID = $_POST['noticeID'];
		include_once('./util/db_info.php');
		$conn = mysqli_connect($db_host, $db_user, $db_passwd);
		if ($conn) {
			$result['db_status'] = 'connected';
			mysqli_select_db($conn, 'miss');
			if ($args_noticeID) {
				$sql = "SELECT * FROM notice_data WHERE noticeID='${args_noticeID}'";
			} else {
				$sql = "SELECT * FROM notice_data ORDER BY date DESC";
			}
			$result['query_string'][0] = $sql;
			$result['query_status'] = 'fail';
			try {
				$queryResult = mysqli_query($conn, $sql);
				if ($queryResult) {
					if ($args_noticeID) {
						if (mysqli_num_rows($queryResult)) {
							$row = mysqli_fetch_array($queryResult, MYSQLI_ASSOC);
							$cnt = $row['view'] + 1;
							$sql = "UPDATE notice_data SET view='${cnt}' WHERE noticeID='{$row['noticeID']}'";
							$result['query_string'][1] = $sql;
							mysqli_query($conn, $sql);
							$sql = "SELECT * FROM notice_data WHERE noticeID='${args_noticeID}'";
							$queryResult = mysqli_query($conn, $sql);
							if ($queryResult) {
								if (mysqli_num_rows($queryResult)) {
									$result['query_status'] = 'success';
									$result['query_data'] = mysqli_fetch_array($queryResult, MYSQLI_ASSOC);
								}
							}
						}
					} else {
						$result['query_status'] = 'success';
						$result['query_data'] = array();
						while ($row = mysqli_fetch_array($queryResult, MYSQLI_ASSOC)) {
							$result['query_data'][] = $row;
						}
					}
				}
			} catch (Exception $e) {
				$result['query_error'] = $e->getMessage();
			}
		} else {
			$result['db_status'] = 'disconnected';
		}
	} else if ($command == 'update') {
		/*
		공지사항 수정
			사용변수
			jwt
			noticeID
			content

			jwt_status
			valid : 유효한 토큰
			invalid : 유효하지 않은 토큰
			no_token : 전달된 토큰 없음

			query_status
			success : 공지사항 수정 성공
			user_invalid : 유효하지 않은 사용자 정보 (권한부족 등등)
			fail : 오류
		*/
		include_once('./util/jwt_key.php');
		$args_token = $_POST['jwt'];
		$args_noticeID = $_POST['noticeID'];
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
			if ($decoded_array['role'] == 1) {
				include_once('./util/db_info.php');
				$conn = mysqli_connect($db_host, $db_user, $db_passwd);
				if ($conn) {
					$result['db_status'] = 'connected';
					mysqli_select_db($conn, 'miss');
					$sql = "UPDATE notice_data SET content='${args_content}' WHERE noticeID='${args_noticeID}'";
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
			} else {
				$result['query_status'] = 'user_invalid';
			}
		}
	} else if ($command == 'delete') {
		/*
		공지사항 삭제
			사용변수
			jwt
			noticeID

			jwt_status
			valid : 유효한 토큰
			invalid : 유효하지 않은 토큰
			no_token : 전달된 토큰 없음

			query_status
			success : 공지사항 삭제 성공
			user_invalid : 유효하지 않은 사용자 정보 (권한부족 등등)
			fail : 오류
		*/
		include_once('./util/jwt_key.php');
		$args_token = $_POST['jwt'];
		$args_noticeID = $_POST['noticeID'];
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
			if ($decoded_array['role'] == 1) {
				include_once('./util/db_info.php');
				$conn = mysqli_connect($db_host, $db_user, $db_passwd);
				if ($conn) {
					$result['db_status'] = 'connected';
					mysqli_select_db($conn, 'miss');
					$sql = "DELETE FROM notice_data WHERE noticeID='${args_noticeID}'";
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
			} else {
				$result['query_status'] = 'user_invalid';
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