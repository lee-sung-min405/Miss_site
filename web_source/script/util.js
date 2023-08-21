function checkRegex(str, reg) { return str.match(reg); }

let idRegex = /^(?=.*[a-z])(?=.*[0-9]).{8,15}$/; // 영소문자 숫자조합 8~16글자
let pwRegex = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,15}$/; // 영대소문자, 숫자, 특수문자 최소 하나이상
let nnRegex = /^[a-zA-Zㄱ-힣0-9]{1,15}$/; // 영대소문자, 숫자, 한글 조합 4~16글자

function loadHTML(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                let allText = rawFile.responseText;
                document.write(allText);
            }
        }
    }
    rawFile.send(null);
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
    options = {
		// path: '/',
        // 필요한 경우, 옵션 기본값을 설정할 수도 있습니다.
        ...options
	};

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) updatedCookie += "=" + optionValue;
    }
    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    if (getCookie(name) != undefined) {
        setCookie(name, 'delete', {'max-age' : -1})
        // console.log(getCookie(name))
        return true
    } else {
        return false
    }
}

function cleaningCookie() {
	deleteCookie('uid')
	deleteCookie('nickname')
	deleteCookie('userHash')
	deleteCookie('role')
}

function isLogin() {
    let tUID = getCookie('userHash')
	return (tUID != undefined)
}

function logout() {
	if (isLogin()) {
		cleaningCookie()
		return true
	} else {
		return false
	}
}

function extendSession() {
	if (isLogin()) {
		setCookie('uid', getCookie('uid'), {'max-age' : 600});
        setCookie('nickname', getCookie('nickname'), {'max-age' : 600});
		setCookie('userHash', getCookie('userHash'), {'max-age' : 600});
		setCookie('role', getCookie('role'), {'max-age' : 600});
		return true
	} else {
		return false
	}
}

function getRandomStr(num) {
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const strlen = str.length
    let res = ''
    for (let i = 0; i < num; ++i) res +=
        str.charAt(Math.floor(Math.random() * strlen))
    return res
}

function getDate() {
	let nowDate = new Date()
	let nowYear = nowDate.getFullYear()
	let nowMonth = nowDate.getMonth() + 1
	let nowDay = nowDate.getDate()
	let nowHour = nowDate.getHours()
	let nowMinute = nowDate.getMinutes()
	let nowSeconds = nowDate.getSeconds()
	let result = `${nowYear}.${nowMonth < 10 ? '0' : ''}${nowMonth}.${nowDay < 10 ? '0' : ''}${nowDay} ${nowHour < 10 ? '0' : ''}${nowHour}:${nowMinute < 10 ? '0' : ''}${nowMinute}:${nowSeconds < 10 ? '0' : ''}${nowSeconds}`
	return result
}

function questionAlert(title, html, confirmFunc) {
	Swal.fire({
		icon: 'question',
		title: title,
		html: html,
		showCancelButton: true,
		reverseButtons: true,
		confirmButtonColor: '#4caf50',
		cancelButtonText: '취소',
		confirmButtonText: '확인'
	}).then(async (result) => {
		if (result.isConfirmed) {
			confirmFunc()
		}
	})
}

function forceAlert(icon, title, text, confirm = false) {
	Swal.fire({
		icon: icon,
		title: title,
		text: text,
		showDenyButton: false,
		showCancelButton: false,
		showConfirmButton: confirm,
		allowOutsideClick: false
	})
}

function timerAlert(icon, title, text, closeFunc = () => {}) {
	if (title.length) {
		Swal.fire({
			icon: icon,
			title: title,
			text: text,
			showConfirmButton: false,
			timer: 1500,
			willClose: closeFunc
		})
	} else {
		Swal.fire({
			icon: icon,
			text: text,
			showConfirmButton: false,
			timer: 1500,
			willClose: closeFunc
		})
	}	
}