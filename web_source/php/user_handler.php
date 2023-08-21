<?php
	include_once('./vendor/autoload.php');
	use Firebase\JWT\JWT;
	use Firebase\JWT\Key;
	$command = $_POST['command'];
	$result = array();
	if ($command == 'signIn') {
		/*
		로그인
			사용변수
			id
			pw

			상태반환값
			success : 로그인 성공
			login_fail : 가입되어있지 않거나 비밀번호 불일치
			fail : 이외 오류
		*/
		include_once('./util/jwt_key.php');
		$args_ID = $_POST['id'];
		$args_PW = $_POST['pw'];
		include_once('./util/db_info.php');
		$conn = mysqli_connect($db_host, $db_user, $db_passwd);
		if ($conn) {
			$result['db_status'] = 'connected';
			mysqli_select_db($conn, 'miss');
			$sql = "SELECT * FROM user_info WHERE id LIKE '${args_ID}'";
			$result['query_string'] = $sql;
			$result['query_status'] = 'fail';
			try {
				$queryResult = mysqli_query($conn, $sql);
				$rowCnt = mysqli_num_rows($queryResult);
				$result['query_status'] = 'login_fail';
				if ($rowCnt) {
					//	0		1		2		3			4
					//	UID		ID		PW		NICKNAME	ROLE
					$row = mysqli_fetch_row($queryResult);
					if (password_verify($args_PW, $row[2])) {
						$result['query_status'] = 'success';
						$result['query_data'] = array(
							'uid' => $row[0],
							'nickname' => $row[3],
							'role' => $row[4]
						);
						$result['query_data']['userHash'] = JWT::encode($result['query_data'], $secret_key, 'HS256');
					}
				}
			} catch (Exception $e) {
				$result['query_error'] = $e->getMessage();
			}
		} else {
			$result['db_status'] = 'disconnected';
		}
	} else if ($command == 'signUp') {
		/*
		회원가입
			사용변수
			uid
			id
			pw
			nickname

			상태반환값
			success : 회원가입 성공
			fail : 오류
		*/
		$args_UID = $_POST['uid'];
		$args_ID = $_POST['id'];
		$args_PW = $_POST['pw'];
		$args_Nickname = $_POST['nickname'];
		include_once('./util/db_info.php');
		$conn = mysqli_connect($db_host, $db_user, $db_passwd);
		if ($conn) {
			$result['db_status'] = 'connected';
			mysqli_select_db($conn, 'miss');
			$pw_hash = password_hash($args_PW, PASSWORD_DEFAULT);
			$sql = "INSERT INTO user_info VALUES('${args_UID}', '${args_ID}', '${pw_hash}', '${args_Nickname}', 0)";
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
	} else if ($command == 'deleteUser') {
		/*
		회원탈퇴
			사용변수
			jwt

			jwt_status
			valid : 유효한 토큰
			invalid : 유효하지 않은 토큰
			no_token : 전달된 토큰 없음

			query_status
			success : 회원탈퇴 성공
			fail : 오류
		*/
		include_once('./util/jwt_key.php');
		$args_token = $_POST['jwt'];
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
				$sql = "DELETE FROM user_info WHERE uid='{$decoded_array['uid']}'";
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
		}
	} else if ($command == 'updatePW') {
		/*
		비밀번호 변경
			사용변수
			jwt
			oldPW
			newPW

			jwt_status
			valid : 유효한 토큰
			invalid : 유효하지 않은 토큰
			no_token : 전달된 토큰 없음

			query_status
			success : 비밀번호 변경 성공
			inconsistent_password : 기존비밀번호 불일치
			fail : 오류
		*/
		include_once('./util/jwt_key.php');
		$args_token = $_POST['jwt'];
		$args_oldID = $_POST['oldPW'];
		$args_newID = $_POST['newPW'];
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
				$sql = "SELECT pw FROM user_info WHERE uid='{$decoded_array['uid']}'";
				$result['query_string'][0] = $sql;
				$result['query_status'] = 'fail';
				try {
					$queryResult = mysqli_query($conn, $sql);
					$rowCnt = mysqli_num_rows($queryResult);
					if ($rowCnt) {
						$row = mysqli_fetch_row($queryResult);
						if (password_verify($args_oldID, $row[0])) {
							$pw_hash = password_hash($args_newID, PASSWORD_DEFAULT);
							$sql = "UPDATE user_info SET pw='${pw_hash}' WHERE uid='{$decoded_array['uid']}'";
							$result['query_string'][1] = $sql;
							$updateResult = mysqli_query($conn, $sql);
							if (mysqli_affected_rows($conn)) {
								$result['query_status'] = 'success';
							}
						} else {
							$result['query_status'] = 'inconsistent_password';
						}
					}
				} catch (Exception $e) {
					$result['query_error'] = $e->getMessage();
				}
			} else {
				$result['db_status'] = 'disconnected';
			}
		}
	} else if ($command == 'checkID') {
		/*
		아이디 중복확인
			사용변수
			id

			query_status
			success : 중복확인 성공
			fail : 오류

			query_data
			0 : 검색된 아이디 없음, 사용 가능
			1 : 검색된 아이디 존재, 사용 불가능
		*/
		$args_ID = $_POST['id'];
		include_once('./util/db_info.php');
		$conn = mysqli_connect($db_host, $db_user, $db_passwd);
		if ($conn) {
			$result['db_status'] = 'connected';
			mysqli_select_db($conn, 'miss');
			$sql = "SELECT EXISTS(SELECT 1 FROM user_info WHERE id='${args_ID}') AS result";
			$result['query_string'] = $sql;
			$result['query_status'] = 'fail';
			try {
				$queryResult = mysqli_query($conn, $sql);
				if ($queryResult) {
					$row = mysqli_fetch_row($queryResult);
					$result['query_status'] = 'success';
					if ($row[0] == "1") $result['query_data'] = 1;
					else $result['query_data'] = 0;
				}
			} catch (Exception $e) {
				$result['query_error'] = $e->getMessage();
			}
		} else {
			$result['db_status'] = 'disconnected';
		}
	} else if ($command == 'checkNickname') {
		/*
		닉네임 중복확인
			사용변수
			nicknameValue

			query_status
			success : 중복확인 성공
			fail : 오류

			query_data
			0 : 검색된 닉네임 없음, 사용 가능
			1 : 검색된 닉네임 존재, 사용 불가능
		*/
		$args_Nickname = $_POST['nickname'];
		include_once('./util/db_info.php');
		$conn = mysqli_connect($db_host, $db_user, $db_passwd);
		if ($conn) {
			$result['db_status'] = 'connected';
			mysqli_select_db($conn, 'miss');
			$sql = "SELECT EXISTS(SELECT 1 FROM user_info WHERE nickname='${args_Nickname}') AS result";
			$result['query_string'] = $sql;
			$result['query_status'] = 'fail';
			try {
				$queryResult = mysqli_query($conn, $sql);
				if ($queryResult) {
					$row = mysqli_fetch_row($queryResult);
					$result['query_status'] = 'success';
					if ($row[0] == "1") $result['query_data'] = 1;
					else $result['query_data'] = 0;
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