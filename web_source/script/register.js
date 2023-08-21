function requestRegistration(IDValue, PWValue, NicknameValue) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/user_handler.php',
			dataType: 'json',
			data: {
				command: 'signUp',
				uid: getRandomStr(6),
				id: IDValue,
				pw: PWValue,
				nickname: NicknameValue
			},
			success: (obj) => {
				console.log(obj)
				resolve(obj)
			},
			error: (err) => {
				console.log(err)
				reject(err)
			}
		})
	})
}

window.onload = function() {

	let idFlag = false
	let pwFlag = false
	let pwRFlag = false
	let nicknameFlag = false
	let duplicateID = true
	let duplicateNickname = true

	let idInputEl = document.getElementById('mainIDInput')
	let pwInputEl = document.getElementById('mainPWInput')
	let pwRInputEl = document.getElementById('mainPWRInput')
	let nicknameInputEl = document.getElementById('mainNicknameInput')
	let pwEyeEl = document.getElementById('mainPWEye')
	let pwREyeEl = document.getElementById('mainPWREye')
	let idGuideEl = document.getElementById('idGuide')
	let pwGuideEl = document.getElementById('pwGuide')
	let pwRGuideEl = document.getElementById('pwRGuide')
	let nicknameGuideEl = document.getElementById('nicknameGuide')
	let checkIDBtnEl = document.getElementById('checkIDBtn')
	let checkNicknameBtnEl = document.getElementById('checkNicknameBtn')

	idInputEl.onblur = () => {
		if (idInputEl.value.length) {
			if (checkRegex(idInputEl.value, idRegex)) {
				idGuideEl.style.color = 'green'
				idGuideEl.innerText = '형식에 맞는 아이디 입니다'
				idFlag = true
			} else {
				idGuideEl.style.color = 'red'
				idGuideEl.innerText = '아이디가 형식에 맞지 않습니다'
				idFlag = false
			}
		} else {
			idGuideEl.style.color = 'black'
			idGuideEl.innerText = '영소문자, 숫자 조합 8~16자'
			idFlag = false
		}
	}

	pwInputEl.onblur = () => {
		if (pwInputEl.value.length) {
			if (checkRegex(pwInputEl.value, pwRegex)) {
				pwGuideEl.style.color = 'green'
				pwGuideEl.innerText = '형식에 맞는 비밀번호 입니다'
				pwFlag = true
			} else {
				pwGuideEl.style.color = 'red'
				pwGuideEl.innerText = '비밀번호가 형식에 맞지 않습니다'
				pwFlag = false
			}
		} else {
			pwGuideEl.style.color = 'black'
			pwGuideEl.innerText = '영문자, 숫자, 특수문자 조합 8~16자'
			pwFlag = false
		}
	}

	pwRInputEl.onblur = () => {
		if (pwFlag) {
			if (pwInputEl.value == pwRInputEl.value) {
				pwRGuideEl.style.color = 'green'
				pwRGuideEl.innerText = '비밀번호가 일치합니다'
				pwRFlag = true
			} else {
				pwRGuideEl.style.color = 'red'
				pwRGuideEl.innerText = '비밀번호가 일치하지 않습니다'
				pwRFlag = false
			}
		} else {
			pwRGuideEl.style.color = 'black'
			pwRGuideEl.innerText = '비밀번호를 한번 더 입력해주세요'
			pwRFlag = false
		}
	}

	nicknameInputEl.onblur = () => {
		if (nicknameInputEl.value.length) {
			if (checkRegex(nicknameInputEl.value, nnRegex)) {
				nicknameGuideEl.style.color = 'green'
				nicknameGuideEl.innerText = '형식에 맞는 닉네임 입니다'
				nicknameFlag = true
			} else {
				nicknameGuideEl.style.color = 'red'
				nicknameGuideEl.innerText = '닉네임이 형식에 맞지 않습니다'
				nicknameFlag = false
			}
		} else {
			nicknameGuideEl.style.color = 'black'
			nicknameGuideEl.innerText = '특수문자 사용불가, 4~16자'
			nicknameFlag = false
		}
	}

	checkIDBtnEl.onclick = async () => {
		if (idFlag) {
			forceAlert('info', '중복확인중...', '잠시만 기다려주세요!')
			let checkIDResult = await checkID(idInputEl.value)
			console.log('checkIDResult', checkIDResult)
			if (checkIDResult.query_status == 'success') {
				if (!checkIDResult.query_data) {
					duplicateID = false
					timerAlert('success', '사용가능한 아이디', '사용가능한 아이디 입니다!')
					idGuideEl.style.color = 'green'
					idGuideEl.innerText = '사용가능한 아이디 입니다'
				} else {
					duplicateID = true
					timerAlert('error', '중복된 아이디', '다른 아이디를 사용해주세요!')
					idGuideEl.style.color = 'red'
					idGuideEl.innerText = '중복된 아이디 입니다'
				}
			} else {
				duplicateID = false
				timerAlert('error', '오류', '무슨일이지?...')
			}
		} else {
			duplicateID = false
			timerAlert('error', '오류', '아이디를 확인해주세요')
		}
	}

	checkNicknameBtnEl.onclick = async () => {
		if (nicknameFlag) {
			forceAlert('info', '중복확인중...', '잠시만 기다려주세요!')
			let checkNicknameResult = await checkNickname(nicknameInputEl.value)
			console.log('checkNicknameResult', checkNicknameResult)
			if (checkNicknameResult.query_status == 'success') {
				if (!checkNicknameResult.query_data) {
					duplicateNickname = false
					timerAlert('success', '사용가능한 닉네임', '사용가능한 닉네임 입니다!')
					nicknameGuideEl.style.color = 'green'
					nicknameGuideEl.innerText = '사용가능한 닉네임 입니다'
				} else {
					duplicateNickname = true
					timerAlert('error', '중복된 닉네임', '다른 닉네임을 사용해주세요!')
					nicknameGuideEl.style.color = 'red'
					nicknameGuideEl.innerText = '중복된 닉네임 입니다'
				}
			} else {
				duplicateNickname = false
				timerAlert('error', '오류', '무슨일이지?...')
			}
		} else {
			duplicateNickname = false
			timerAlert('error', '오류', '닉네임을 확인해주세요')
		}
	}

	document.getElementById('mainPWSpan').onclick = () => {
		if (pwInputEl.getAttribute('type') == 'password') {
			pwInputEl.setAttribute('type', 'text')
			pwEyeEl.src = '../img/icon/eye-slash.svg'
		} else {
			pwInputEl.setAttribute('type', 'password')
			pwEyeEl.src = '../img/icon/eye.svg'
		}
	}

	document.getElementById('mainPWRSpan').onclick = () => {
		if (pwRInputEl.getAttribute('type') == 'password') {
			pwRInputEl.setAttribute('type', 'text')
			pwREyeEl.src = '../img/icon/eye-slash.svg'
		} else {
			pwRInputEl.setAttribute('type', 'password')
			pwREyeEl.src = '../img/icon/eye.svg'
		}
	}

    let registerBtn = document.getElementById('registerBtn')
    registerBtn.onclick = async function() {
        let IDValue = idInputEl.value
        let PWValue = pwInputEl.value
        let CheckPWValue = pwRInputEl.value
        let NicknameValue = nicknameInputEl.value
		if (!IDValue.length || !PWValue.length || !CheckPWValue.length || !NicknameValue.length) {
			forceAlert('error', '오류', '빈칸이 있어요', true)
		} else {
			if (duplicateID) {
				forceAlert('error', '아이디 중복확인', '아이디 중복확인을 해주세요!', true)
			} else if (duplicateNickname) {
				forceAlert('error', '닉네임 중복확인', '닉네임 중복확인을 해주세요!', true)
			} else {
				if (idFlag && pwFlag && pwRFlag && nicknameFlag) {
					forceAlert('info', '회원가입 요청중...', '잠시만 기다려주세요!')
					let requestRegistrationResult = await requestRegistration(IDValue, PWValue, NicknameValue)
					console.log(requestRegistrationResult)
					if (requestRegistrationResult.query_status == 'success') {
						timerAlert('success', '회원가입 성공!', '잠시 후 메인으로 이동합니다', () => {
							location.href = "."
						})
					} else {
						timerAlert('error', '오류', '회원가입 실패')
					}
				}
			}
		}
    }
}

function checkID(idValue) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/user_handler.php',
			dataType: 'json',
			data: {
				command: 'checkID',
				id: idValue
			},
			success: (obj) => {
				console.log(obj)
				resolve(obj)
			},
			error: (err) => {
				console.log(err)
				reject(err)
			}
		})
	})
}

function checkNickname(nicknameValue) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/user_handler.php',
			dataType: 'json',
			data: {
				command: 'checkNickname',
				nickname: nicknameValue
			},
			success: (obj) => {
				console.log(obj)
				resolve(obj)
			},
			error: (err) => {
				console.log(err)
				reject(err)
			}
		})
	})
}