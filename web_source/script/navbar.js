let loginModalEl
let pwChangeModalEl
let oldPWFlag = false
let newPWFlag = false
let newPWRFlag = false

function loginCheck() {
	let profileBtn = document.getElementById('header_profile')
	let pwChangeBtn = document.getElementById('header_pwchange_btn')
    let headerUsernameEl = document.getElementById('header_username')
    let headerUserroleEl = document.getElementById('header_userrole')
    let headerLogoutBtnEl = document.getElementById('header_logout_btn')
    if (isLogin()) {
        headerLogoutBtnEl.style.display = 'block'
        profileBtn.style.cursor = 'default'
        profileBtn.onclick = ''
		pwChangeBtn.style.cursor = 'pointer'
		// pwChangeBtn.src = '../img/key.svg'
		pwChangeBtn.onclick = function(e) {
			resetPWChangeModal()
			pwChangeModalEl.show()
		}
        headerUsernameEl.innerText = getCookie('nickname')
		headerUserroleEl.innerText = getCookie('role') == 'user' ? '사용자' : '관리자'
        headerUserroleEl.style.display = 'block'
        return true
    }
    else {
		cleaningCookie()
        headerLogoutBtnEl.style.display = 'none'
        profileBtn.style.cursor = 'pointer'
        profileBtn.onclick = function(e) { loginModalEl.show() }
		pwChangeBtn.onclick = ''
		// pwChangeBtn.src = '../img/person-circle.svg'
		headerUsernameEl.innerText = '로그인'
        headerUserroleEl.style.display = 'none'
        return false
    }
}

function postLoginFunction() {}

function postLogoutFunction() {}

function requestLogin(idValue, pwValue) {
	return new Promise((resolve, reject) => {
		$.ajax({
            type: "POST",
            url: './php/user_handler.php',
            dataType: 'json',
            data: {
				command: 'signIn',
				id: idValue,
				pw: pwValue
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

function initNavbar(black) {
	let navbarRootEl = document.getElementById('navbarRoot')
	if (black) navbarRootEl.style.background = "black"
	loginModalEl = new bootstrap.Modal('#loginModal', {keyboard : false})
	pwChangeModalEl = new bootstrap.Modal('#pwChangeModal', {keyboard: false})

	// 로그아웃 버튼 눌렀을 때
    document.getElementById('header_logout_btn').onclick = (e) => {
        e.stopPropagation()
		questionAlert('로그아웃', '로그아웃 하시겠습니까?', () => {
			logout()
        	loginCheck()
			postLogoutFunction()
		})
    }

	// 로그인되어있으면 세션(쿠키) 연장
	if (loginCheck()) extendSession()

	// 로그인모달의 로그인 버튼을 눌렀을 때
	const loginAction = async () => {
		forceAlert('info', '로그인중...', '잠시만 기다려주세요!')
		let idValue = mainIDInputEl.value
		let pwValue = mainPWInputEl.value
		let requestLoginResult = await requestLogin(idValue, pwValue)
		if (requestLoginResult.query_status == 'success') {
			document.cookie = `uid=${requestLoginResult.query_data.uid}; max-age=600`
			document.cookie = `nickname=${requestLoginResult.query_data.nickname}; max-age=600`
			document.cookie = `userHash=${requestLoginResult.query_data.userHash}; max-age=600`
			document.cookie = `role=${requestLoginResult.query_data.role == '000' ? 'user' : 'admin'}; max-age=600`
			loginModalEl.hide()
			loginCheck()
			postLoginFunction()
			Swal.close()
		} else if (requestLoginResult.query_status == 'login_fail') {
			timerAlert('error', '오류', '가입되어있지 않거나, 정보가 일치하지 않습니다')
		} else {
			timerAlert('error', '오류', '알 수 없는 오류입니다')
		}
	}
    document.getElementById('loginBtn').onclick = loginAction

	// 비밀번호 변경 모달의 비밀번호 표시 버튼
	let mainIDInputEl = document.getElementById('mainIDInput')
	let mainPWInputEl = document.getElementById('mainPWInput')
	let oldPWInputEl = document.getElementById('oldPWInput')
	let newPWInputEl = document.getElementById('newPWInput')
	let newPWRInputEl = document.getElementById('newPWRInput')
	let oldPWEyeEl = document.getElementById('oldPWEye')
	let newPWEyeEl = document.getElementById('newPWEye')
	let newPWREyeEl = document.getElementById('newPWREye')
	let oldPWGuideEl = document.getElementById('oldPWGuide')
	let newPWGuideEl = document.getElementById('newPWGuide')
	let newPWRGuideEl = document.getElementById('newPWRGuide')

	mainPWInputEl.onkeydown = (e) => {
		if (e.code == 'Enter') {
			e.preventDefault();
			loginAction()
		}
	}
	
	oldPWInputEl.onblur = () => {
		if (oldPWInputEl.value.length) {
			if (checkRegex(oldPWInputEl.value, pwRegex)) {
				oldPWGuideEl.style.color = 'green'
				oldPWGuideEl.innerText = '형식에 맞는 비밀번호입니다.'
				oldPWFlag = true
			} else {
				oldPWGuideEl.style.color = 'red'
				oldPWGuideEl.innerText = '비밀번호가 형식에 맞지 않습니다'
				oldPWFlag = false
			}
		} else {
			oldPWGuideEl.style.color = 'black'
			oldPWGuideEl.innerText = '영대소문자, 숫자, 특수문자 최소 하나이상 8~16글자'
			oldPWFlag = false
		}
	}
	newPWInputEl.onblur = () => {
		if (newPWInputEl.value.length) {
			if (checkRegex(newPWInputEl.value, pwRegex)) {
				if (oldPWInputEl.value != newPWInputEl.value) {
					newPWGuideEl.style.color = 'green'
					newPWGuideEl.innerText = '사용가능한 비밀번호입니다'
					newPWFlag = true
				} else {
					newPWGuideEl.style.color = 'red'
					newPWGuideEl.innerText = '기존 비밀번호는 사용할 수 없습니다'
					newPWFlag = false
				}
			} else {
				newPWGuideEl.style.color = 'red'
				newPWGuideEl.innerText = '비밀번호가 형식에 맞지 않습니다'
				newPWFlag = false
			}
		} else {
			newPWGuideEl.style.color = 'black'
			newPWGuideEl.innerText = '영대소문자, 숫자, 특수문자 최소 하나이상 8~16글자'
			newPWFlag = false
		}
	}
	newPWRInputEl.onblur = () => {
		if (newPWFlag) {
			if (newPWInputEl.value == newPWRInputEl.value) {
				newPWRGuideEl.style.color = 'green'
				newPWRGuideEl.innerText = '비밀번호가 일치합니다'
				newPWRFlag = true
			} else {
				newPWRGuideEl.style.color = 'red'
				newPWRGuideEl.innerText = '비밀번호가 일치하지 않습니다'
				newPWRFlag = false
			}
		} else {
			newPWRGuideEl.style.color = 'black'
			newPWRGuideEl.innerText = '새로운 비밀번호를 한번 더 입력해주세요'
			newPWRFlag = false
		}
	}
	document.getElementById('mainPWSpan').onclick = () => {
		if (mainPWInputEl.getAttribute('type') == 'password') {
			mainPWInputEl.setAttribute('type', 'text')
			mainPWEye.src = '../img/icon/eye-slash.svg'
		} else {
			mainPWInputEl.setAttribute('type', 'password')
			mainPWEye.src = '../img/icon/eye.svg'
		}
	}
	document.getElementById('oldPWSpan').onclick = () => {
		if (oldPWInputEl.getAttribute('type') == 'password') {
			oldPWInputEl.setAttribute('type', 'text')
			oldPWEyeEl.src = '../img/icon/eye-slash.svg'
		} else {
			oldPWInputEl.setAttribute('type', 'password')
			oldPWEyeEl.src = '../img/icon/eye.svg'
		}
	}
	document.getElementById('newPWSpan').onclick = () => {
		if (newPWInputEl.getAttribute('type') == 'password') {
			newPWInputEl.setAttribute('type', 'text')
			newPWEyeEl.src = '../img/icon/eye-slash.svg'
		} else {
			newPWInputEl.setAttribute('type', 'password')
			newPWEyeEl.src = '../img/icon/eye.svg'
		}
	}
	document.getElementById('newPWRSpan').onclick = () => {
		if (newPWRInputEl.getAttribute('type') == 'password') {
			newPWRInputEl.setAttribute('type', 'text')
			newPWREyeEl.src = '../img/icon/eye-slash.svg'
		} else {
			newPWRInputEl.setAttribute('type', 'password')
			newPWREyeEl.src = '../img/icon/eye.svg'
		}
	}
	document.getElementById('pwChangeConfirmBtn').onclick = () => {
		if (!oldPWInputEl.value.length || !newPWInputEl.value.length || !newPWRInputEl.value.length) {
			forceAlert('error', '오류', '빈칸이 있어요', true)
		} else {
			if (oldPWFlag && newPWFlag && newPWRFlag) {
				questionAlert('비밀번호 변경', '정말로 변경할까요?', async () => {
					forceAlert('info', '변경중...', '잠시만 기다려주세요!')
					let requestPWChangeResult = await requestPWChange(oldPWInputEl.value, newPWInputEl.value)
					if (requestPWChangeResult.jwt_status == 'valid') {
						// 로그인 정보가 유효할 때
						if (requestPWChangeResult.query_status == 'success') {
							pwChangeModalEl.hide()
							timerAlert('success', '등록완료', '정상적으로 등록되었어요')
						} else if (requestPWChangeResult.query_status == 'inconsistent_password') {
							timerAlert('error', '오류', '기존 비밀번호가 일치하지 않습니다')
						} else {
							timerAlert('error', '오류', '무슨일이지?...')
						}
					} else {
						timerAlert('error', '오류', '사용자 정보가 유효하지 않습니다')
					}
				})
			}
		}
	}

	// 회원탈퇴
	document.getElementById('outMemberBtn').onclick = () => {
		questionAlert('회원탈퇴', '정말 탈퇴하실건가요?...<br>사용자 정보와 작성하신 모든 한줄평이 사라집니다', async () => {
			forceAlert('info', '처리중...', '잠시만 기다려주세요!')
			let requestOutMemberResult = await requestOutMember()
			if (requestOutMemberResult.jwt_status == 'valid') {
				if (requestOutMemberResult.query_status == 'success') {
					logout()
        			loginCheck()
					pwChangeModalEl.hide()
					timerAlert('success', '탈퇴완료', '다시 돌아오길 기다리겠습니다!', () => {
						postLogoutFunction()
					})
				} else {
					timerAlert('error', '오류', '무슨일이지?...')
				}
			}
		})
	}
}

function requestPWChange(oldPW, newPW) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/user_handler.php',
			dataType: 'json',
			data: {
				command: 'updatePW',
				jwt: getCookie('userHash'),
				oldPW: oldPW,
				newPW: newPW
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

function requestOutMember() {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/user_handler.php',
			dataType: 'json',
			data: {
				command: 'deleteUser',
				jwt: getCookie('userHash')
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

function resetPWChangeModal() {
	let pwChangeModalInput = document.querySelectorAll('#pwChangeModal div.modal-body input')
	let pwChangeModalImg = document.querySelectorAll('#pwChangeModal div.modal-body img')
	let pwChangeModalP = document.querySelectorAll('#pwChangeModal div.modal-body p')
	oldPWFlag = false
	newPWFlag = false
	newPWRFlag = false
	for (let i = 0; i < 3; ++i) {
		pwChangeModalInput[i].setAttribute('type', 'password')
		pwChangeModalInput[i].value = ''
		pwChangeModalImg[i].src = '../img/icon/eye.svg'
		pwChangeModalP[i].style.color = 'black'
		if (i == 2) {
			pwChangeModalP[i].innerText = '새로운 비밀번호를 한번 더 입력해주세요'
		} else {
			pwChangeModalP[i].innerText = '영대소문자, 숫자, 특수문자 최소 하나이상 8~16글자'
		}
	}
}