let dateArray = []
let dateIdx
let dotwStr = ['일', '월', '화', '수', '목', '금', '토']
let args = new Map()
let scheduleData
let cinema_location = [
	{
		name: 'cgv',
		group: 'cgvLocationGroup',
		cineLocation: ['동래', '부산명지', '서면', '서면삼정타워', '서면상상마당', '센텀시티', '아시아드', '정관', '하단아트몰링', '해운대', '화명']
	},
	{
		name: 'lotte',
		group: 'lotteLocationGroup',
		cineLocation: ['광복', '대영', '동래', '동부산아울렛', '부산명지', '부산본점', '서면(전포동)', '센텀시티', '오투(부산대)', '프리미엄해운대']
	},
	{
		name: 'megabox',
		group: 'megaboxLocationGroup',
		cineLocation: ['덕천', '부산극장', '부산대', '사상', '정관', '해운대(장산)']
	}
]

function initDate() {
	let preMonth
	let dsMonthRoot = document.querySelector('#date-selector > tbody > tr:nth-child(1)')
	let dsDayRoot = document.querySelector('#date-selector > tbody > tr:nth-child(2)')
	let dsDOTWRoot = document.querySelector('#date-selector > tbody > tr:nth-child(3)')
	for (let i = 0; i < 5; ++i) {
		let nowDate = new Date()
		nowDate.setDate(nowDate.getDate() + i)
		let nowYear = nowDate.getFullYear()
		let nowMonth = nowDate.getMonth() + 1
		let nowDay = nowDate.getDate()
		let nowDayOfTheWeek = nowDate.getDay()
		console.log(nowYear, nowMonth, nowDay, nowDayOfTheWeek)
		dateArray.push(`${nowYear}.${nowMonth < 10 ? '0':''}${nowMonth}.${nowDay < 10 ? '0':''}${nowDay}`)
		let monthEl = document.createElement('td')
		let dayEl = document.createElement('td')
		let dayDivEl = document.createElement('div')
		let dotwEl = document.createElement('td')
		dayDivEl.innerHTML = `${nowDay}`
		dayDivEl.onclick = function() {
			setCurrentDate(i)
			getCurrentDate() // 로그용임 이거
		}
		dotwEl.innerHTML = `${dotwStr[nowDayOfTheWeek]}`
		if (nowDayOfTheWeek == 6) {
			dayEl.classList.add('sat')
			dotwEl.classList.add('sat')
		} else if (nowDayOfTheWeek == 0) {
			dayEl.classList.add('sun')
			dotwEl.classList.add('sun')
		}
		if (!i) {
			dateIdx = 0
			preMonth = nowMonth
			dayDivEl.classList.add('sel')
			monthEl.innerHTML = `${nowMonth}월`
		} else if (nowMonth != preMonth) {
			preMonth = nowMonth
			monthEl.innerHTML = `${nowMonth}월`
		}
		dayEl.appendChild(dayDivEl)
		dsMonthRoot.appendChild(monthEl)
		dsDayRoot.appendChild(dayEl)
		dsDOTWRoot.appendChild(dotwEl)
	}
	let scheduleDateEl = document.getElementById('scheduleDate')
	scheduleDateEl.innerText = dateArray[dateIdx]
}

function controlPostInput() {
	let postInputEl = document.getElementById('post_input')
	let postEditInputEl = document.getElementById('inputContent')
	let postBtnEl = document.getElementById('post_btn')
	let postLimitEl = document.getElementById('post_limit')
	postInputEl.value = ''
	if (isLogin()) {
		// 로그인 되어 있으면
		postLimitEl.style.display = 'block'
		let postLengthEl = document.getElementById('post_length')
		let postReturnEl = document.getElementById('post_return')
		let postEditLengthEl = document.getElementById('post_edit_length')
		let postEditReturnEl = document.getElementById('post_edit_return')
		postLengthEl.innerText = '0'
		postReturnEl.innerText = '0'
		postInputEl.oninput = () => {
			let nowLength = postInputEl.value.length
			let nowReturn = postInputEl.value.split('\n').length - 1
			if (nowLength > 50) {
				postLengthEl.style.color = 'red'
			} else {
				postLengthEl.style.color = 'green'
			}
			if (nowReturn > 2) {
				postReturnEl.style.color = 'red'
			} else {
				postReturnEl.style.color = 'green'
			}
			postLengthEl.innerText = nowLength
			postReturnEl.innerText = nowReturn
		}
		postEditInputEl.oninput = () => {
			let nowLength = postEditInputEl.value.length
			let nowReturn = postEditInputEl.value.split('\n').length - 1
			if (nowLength > 50) {
				postEditLengthEl.style.color = 'red'
			} else {
				postEditLengthEl.style.color = 'green'
			}
			if (nowReturn > 2) {
				postEditReturnEl.style.color = 'red'
			} else {
				postEditReturnEl.style.color = 'green'
			}
			postEditLengthEl.innerText = nowLength
			postEditReturnEl.innerText = nowReturn
		}
		postInputEl.placeholder = '한줄평을 작성해볼까요?'
		postInputEl.disabled = false
		postBtnEl.disabled = false
		postBtnEl.onclick = async () => {
			// 쿠키가 만료되어 로그인상태가 풀렸지만
			// 버튼은 활성화 된 상태라...
			if (isLogin()) {
				if (postInputEl.value.length && postInputEl.value.length <= 50 && postInputEl.value.split('\n').length - 1 <= 2) {
					// 내용이 있을때
					questionAlert('이대로 등록할까요?', postInputEl.value.replaceAll('\n', '<br>'), async () => {
						forceAlert('info', '등록중...', '잠시만 기다려주세요!')
						let uploadPostDataResult = await uploadPostData(postInputEl.value)
						console.log(uploadPostDataResult)
						if (uploadPostDataResult.jwt_status == 'valid') {
							// 로그인 정보가 유효할 때
							if (uploadPostDataResult.query_status == 'success') {
								postInputEl.value = ''
								postLengthEl.innerText = '0'
								postReturnEl.innerText = '0'
								let getPostDataResult = await getPostData()
								if (getPostDataResult.query_status == 'success') {
									displayPostData(getPostDataResult.query_data)
								}
								timerAlert('success', '등록완료', '정상적으로 등록되었어요')
							} else {
								timerAlert('error', '오류', '무슨일이지?...')
							}
						} else {
							// 로그인 정보가 유효하지 않을 때
							timerAlert('error', '오류', '사용자 정보가 유효하지 않습니다')
						}
					})
				} else {
					// 내용이 없을 때
					timerAlert('error', '오류', '내용을 확인해주세요')
				}
			} else {
				timerAlert('error', '세션 만료', '다시 로그인해주세요')
				loginCheck()
				controlPostInput()
				// forceAlert('info', '한줄평 조회중...', '잠시만 기다려주세요!')
				let getPostDataResult = await getPostData()
				if (getPostDataResult.query_status == 'success') {
					displayPostData(getPostDataResult.query_data)
				}
				// Swal.close()
			}
		}
	} else {
		postLimitEl.style.display = 'none'
		postInputEl.placeholder = '먼저 로그인해주세요'
		postInputEl.disabled = true
		postBtnEl.disabled = true
	}
}

function setCurrentDate(num) {
	let dsDayDiv = document.querySelectorAll('#date-selector > tbody > tr:nth-child(2) > td > div')
	let scheduleDateEl = document.getElementById('scheduleDate')
	for (let i = 0; i < 5; ++i) dsDayDiv[i].classList.remove('sel')
	dsDayDiv[num].classList.add('sel')
	dateIdx = num
	scheduleDateEl.innerText = dateArray[dateIdx]
	displaySchedule()
}

function getScheduleData(query) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/movie_handler.php',
			dataType: 'json',
			data : {
				command: 'getSchedule',
				query: query
			},
			success: (obj) => {
				console.log(obj)
				resolve(obj)
			},
			error: (err) => {
				console.log(err)
				resolve(err)
			}
		})
	})
}

function getCurrentDate() {
	console.log(dateArray[dateIdx])
}

function getMovieData() {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/movie_handler.php',
			dataType: 'json',
			data: {
				command: 'getMovieInfo',
				name: args.get('name')
			},
			success: (obj) => {
				console.log(obj)
				resolve(obj)
			},
			error: (err) => {
				reject(err)
			}
		})
	})
}

function getPostData() {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/post_handler.php',
			dataType: 'json',
			data: {
				command: 'read',
				name: args.get('name')
			},
			success: (obj) => {
				console.log(obj)
				resolve(obj)
			},
			error: (err) => {
				reject(err)
			}
		})
	})
}

function displaySchedule(num = 0) {
	console.log(num)
	if (scheduleData) {
		console.log('update schedule')
		let scheduleListRootEl = document.getElementById('scheduleListRoot')
		let schedulePaginationEl = document.getElementById('schedulePagination')
		let schedulePaginationUlEl = document.getElementById('schedulePaginationUl')
		let filterData = scheduleData.filter(data => data.date == dateArray[dateIdx])
		if (filterData.length) {
			let startIdx = (!num ? 0 : (num - 1) * 20)
			let endIdx = (startIdx + 20 > filterData.length ? filterData.length : startIdx + 20)
			// 데이터 있을 때
			if (!num && filterData.length > 20) {
				schedulePaginationEl.style.display = 'block'
				schedulePaginationUlEl.innerHTML = ''
				let liCnt = Math.floor(filterData.length / 20) + (filterData.length % 20 != 0 ? 1 : 0)
				console.log(liCnt)
				for (let i = 0; i < liCnt; ++i) {
					let liEl = document.createElement('li')
					let aEl = document.createElement('a')
					aEl.classList.add('page-link')
					if (!i) liEl.classList.add('active')
					aEl.innerText = i + 1
					aEl.style.cursor = 'pointer'
					aEl.onclick = () => {
						displaySchedule(i + 1)
					}
					liEl.classList.add('page-item')
					liEl.appendChild(aEl)
					schedulePaginationUlEl.appendChild(liEl)
				}
				startIdx = 0
				endIdx = 20
			} else if (!num) {
				schedulePaginationEl.style.display = 'none'
			}
			if (num) {
				let liGroup = schedulePaginationUlEl.getElementsByTagName('li')
				for (let i = 0; i < liGroup.length; ++i) {
					liGroup[i].classList.remove('active')
					if (i == num - 1) liGroup[i].classList.add('active')
				}
			}
			scheduleListRootEl.innerHTML = ''
            for (let i = startIdx; i < endIdx; ++i) {
                let textColor
                let trEl = document.createElement('tr')
                let timetdEl = document.createElement('td')
                let compnaytdEl = document.createElement('td')
                let locationtdEl = document.createElement('td')
                let movietypetdEl = document.createElement('td')
                let theatertdEl = document.createElement('td')
                let chairtdEl = document.createElement('td')
				let linkEl = document.createElement('td')
				let linkBtnEl = document.createElement('button')
                timetdEl.innerHTML =`${filterData[i].morning == "1" ? '☀️ ' : ''}${filterData[i].time}`
                compnaytdEl.innerHTML = `<img src="./img/cinema_logo/logo_${filterData[i].cinema_name}.png">`
                locationtdEl.innerHTML = filterData[i].cinema_location
                movietypetdEl.innerHTML = filterData[i].movie_type
                theatertdEl.innerHTML = filterData[i].theater_name
                let parseRemain = parseInt(filterData[i].remain_chair)
                let parseAll = parseInt(filterData[i].all_chair)
                let chairPercent = parseRemain / parseAll * 100
                if (chairPercent >= 70) {
                    chairtdEl.classList.add('table-success')
                    textColor = 'green'
                }
                else if (chairPercent >= 50) {
                    chairtdEl.classList.add('table-warning')
                    textColor = 'orange'
                }
                else {
					chairtdEl.classList.add('table-danger')
                    textColor = 'red'
				}
				chairtdEl.innerHTML = `<span style="color: ${textColor}">${parseRemain}</span> / ${parseAll}`
				linkBtnEl.classList.add('btn', 'btn-primary')
				linkBtnEl.style.width = '100%'
				linkBtnEl.innerText = '예매'
				if (filterData[i].cinema_name == 'cgv') {
					linkBtnEl.onclick = () => window.open('http://www.cgv.co.kr/ticket')
				} else if (filterData[i].cinema_name == 'lotte') {
					linkBtnEl.onclick = () => window.open('https://www.lottecinema.co.kr/NLCHS/Ticketing')
				} else if (filterData[i].cinema_name == 'megabox') {
					linkBtnEl.onclick = () => window.open('https://www.megabox.co.kr/booking')
				}
				linkEl.appendChild(linkBtnEl)
                trEl.appendChild(timetdEl)
                trEl.appendChild(compnaytdEl)
                trEl.appendChild(locationtdEl)
                trEl.appendChild(movietypetdEl)
                trEl.appendChild(theatertdEl)
                trEl.appendChild(chairtdEl)
				trEl.appendChild(linkEl)
                scheduleListRootEl.appendChild(trEl)
            }
        } else {
			// 데이터 없을 때
			schedulePaginationEl.style.display = 'none'
			scheduleListRootEl.innerHTML = `<tr class="disableHover"><td colspan="7" style="font-size: 14pt; font-weight: bold; padding: 50px 0;">검색된 항목이 없습니다</td></tr>`
		}
	}
}

function displayMovieData(movieData) {
	let infoPosterEl = document.getElementById('info_poster')
	let infoPosterBgEl = document.getElementById('info_poster_bg')
	let infoTitleEl = document.getElementById('info_title')
	let infoDateEl = document.getElementById('info_date')
	let infoAudiEl = document.getElementById('info_audi')
	let infoSalesEl = document.getElementById('info_sales')
	let infoUpdateDateEl = document.getElementById('info_updateDate')
	let infoTaglineEl = document.getElementById('info_tagline')
	let infoOverviewEl = document.getElementById('info_overview')
	let scheduleTitle = document.getElementById('scheduleTitle')
	infoPosterEl.src = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${movieData.poster_path}`
	infoPosterBgEl.src = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${movieData.poster_path}`
	infoTitleEl.innerText = movieData.name
	scheduleTitle.innerText = movieData.name
	infoDateEl.innerText = `${movieData.release_date} 개봉`
	infoAudiEl.innerText = `${parseInt(movieData.audiAcc).toLocaleString('ko-KR')}명`
	infoSalesEl.innerText = `${parseInt(movieData.salesAcc).toLocaleString('ko-KR')}원`
	infoUpdateDateEl.innerText = movieData.update
	infoTaglineEl.innerText = movieData.tagline
	infoOverviewEl.innerText = movieData.overview
}

function displayPostData(postData) {
	let postListRootEl = document.getElementById('postListRoot')
	if (postData.length) {
		console.log('post_data', postData)
		let myUID = getCookie('uid')
		postListRootEl.innerHTML = ''
		for (let i = 0; i < postData.length; ++i) {
			let div1 = document.createElement('div')
			div1.classList.add('col', 'custom-post')

			let div2 = document.createElement('div')
			div2.classList.add('card', 'h-100')
			
			let divBodyEl = document.createElement('div')
			divBodyEl.classList.add('card-body')
			
			let divNicknameEl = document.createElement('div')
			divNicknameEl.classList.add('d-flex', 'card-title')
			
			let imgNicknameEl = document.createElement('img')
			let h5NicknameEl = document.createElement('h5')
			h5NicknameEl.innerText = postData[i].nickname

			divNicknameEl.appendChild(imgNicknameEl)
			divNicknameEl.appendChild(h5NicknameEl)
			divBodyEl.appendChild(divNicknameEl)
			
			let pContentsEl = document.createElement('p')
			pContentsEl.classList.add('card-text')
			pContentsEl.innerText = postData[i].contents
			
			divBodyEl.appendChild(pContentsEl)
			
			let divFooterEl = document.createElement('div')
			divFooterEl.classList.add('card-footer')
			
			let smallDateEl = document.createElement('small')
			smallDateEl.classList.add('text-muted')
			smallDateEl.innerText = postData[i].date
			
			divFooterEl.appendChild(smallDateEl)

			if (isLogin() && (getCookie('role') == 'admin' || postData[i].user == myUID)) {
				// 로그인되어있고, 관리자 또는 내글일때~
				let divToolEl = document.createElement('div')
				let imgTrashEl = document.createElement('img')
				if (postData[i].user == myUID) {
					h5NicknameEl.classList.add('my-post')
					let imgEditEl = document.createElement('img')
					imgEditEl.onclick = function() {
						let postEditModalEl = new bootstrap.Modal('#postEditModal', {keyboard : false})
						console.log(postData[i].postID)
						let inputContentEl = document.getElementById('inputContent')
						inputContentEl.value = postData[i].contents
						const displayLimit = () => {
							let postEditLengthEl = document.getElementById('post_edit_length')
							let postEditReturnEl = document.getElementById('post_edit_return')
							let nowLength = postData[i].contents.length
							let nowReturn = postData[i].contents.split('\n').length - 1
							if (nowLength > 50) {
								postEditLengthEl.style.color = 'red'
							} else {
								postEditLengthEl.style.color = 'green'
							}
							if (nowReturn > 2) {
								postEditReturnEl.style.color = 'red'
							} else {
								postEditReturnEl.style.color = 'green'
							}
							postEditLengthEl.innerText = nowLength
							postEditReturnEl.innerText = nowReturn
						}
						displayLimit()
						let editCancelBtnEl = document.getElementById('editCancelBtn')
						let editResetBtnEl = document.getElementById('editResetBtn')
						let editConfirmBtnEl = document.getElementById('editConfirmBtn')
						editCancelBtnEl.onclick = () => postEditModalEl.hide()
						editResetBtnEl.onclick = () => {
							inputContentEl.value = postData[i].contents
							displayLimit()
						}
						editConfirmBtnEl.onclick = function() {
							if (inputContentEl.value.length && inputContentEl.value.length <= 50 && inputContentEl.value.split('\n').length - 1 <= 2) {
								if (inputContentEl.value != postData[i].contents) {
									// 내용이 달라졌을때 수정함
									questionAlert('이렇게 수정할까요?', inputContentEl.value.replaceAll('\n', '<br>'), async () => {
										forceAlert('info', '수정중...', '잠시만 기다려주세요!')
										let editPostDataResult = await editPostData(postData[i].postID, inputContentEl.value)
										if (editPostDataResult.query_status == 'success') {
											let getPostDataResult = await getPostData()
											if (getPostDataResult.query_status == 'success') {
												displayPostData(getPostDataResult.query_data)
											}
											postEditModalEl.hide()
											timerAlert('success', '수정완료', '정상적으로 수정되었어요')
											inputContentEl.value = ''
										} else if (editPostDataResult.query_status == 'user_invalid') {
											timerAlert('error', '오류', '사용자 정보가 유효하지 않습니다')
										} else {
											timerAlert('error', '오류', '무슨일이지?...')
										}
									})
								} else {
									// 같을경우 경고창띄우고 안함
									inputContentEl.focus()
									timerAlert('error', '오류', '변경사항이 없어요')
								}
							} else {
								inputContentEl.focus()
								timerAlert('error', '오류', '내용을 확인해주세요')
							}
						}
						postEditModalEl.show()
					}
					divToolEl.appendChild(imgEditEl)
				}
				imgTrashEl.onclick = function() {
					questionAlert('정말 삭제할까요?', '삭제하면 되돌릴 수 없어요', async () => {
						forceAlert('info', '삭제중...', '잠시만 기다려주세요!')
						let deletePostDataResult = await deletePostData(postData[i].postID)
						if (deletePostDataResult.query_status == 'success') {
							let getPostDataResult = await getPostData()
							if (getPostDataResult.query_status == 'success') {
								displayPostData(getPostDataResult.query_data)
							}
							timerAlert('success', '삭제완료', '정상적으로 삭제되었어요')
						} else if (deletePostDataResult.query_status == 'user_invalid') {
							timerAlert('error', '오류', '사용자 정보가 유효하지 않습니다')
						} else {
							timerAlert('error', '오류', '무슨일이지?...')
						}
					})
				}
				divToolEl.appendChild(imgTrashEl)
				divFooterEl.appendChild(divToolEl)
			}
			
			div2.appendChild(divBodyEl)
			div2.appendChild(divFooterEl)
			div1.appendChild(div2)
				
			postListRootEl.appendChild(div1)
		}
	} else {
		postListRootEl.innerHTML = '<div><h5 style="color: gray;">작성된 한줄평이 없어요...</h5></div>'
	}
}

function uploadPostData(content) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type : "POST",
			url : './php/post_handler.php',
			dataType : 'json',
			data : {
				command: 'create',
				jwt: getCookie('userHash'),
				name: args.get('name'),
				content: content,
				postID: getRandomStr(6),
				date: getDate()
			},
			success: (obj) => {
				console.log('test', obj)
				resolve(obj)
			},
			error: (err) => {
				reject(err)
			}
		})
	})
}

function editPostData(postID, content) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type : "POST",
			url : './php/post_handler.php',
			dataType : 'json',
			data : {
				command: 'update',
				jwt: getCookie('userHash'),
				content: content,
				postID: postID
			},
			success: (obj) => {
				console.log('editResult', obj)
				resolve(obj)
			},
			error: (err) => {
				reject(err)
			}
		})
	})
}

function deletePostData(postID) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type : "POST",
			url : './php/post_handler.php',
			dataType : 'json',
			data : {
				command: 'delete',
				jwt: getCookie('userHash'),
				postID: postID
			},
			success: (obj) => {
				console.log('deleteResult', obj)
				resolve(obj)
			},
			error: (err) => {
				reject(err)
			}
		})
	})
}

window.onload = async function() {
	controlPostInput()
	postLogoutFunction = async function() {
		console.log('postLogoutFunction')
		controlPostInput()
		forceAlert('info', '한줄평 조회중...', '잠시만 기다려주세요!')
		let getPostDataResult = await getPostData()
		if (getPostDataResult.query_status == 'success') {
			displayPostData(getPostDataResult.query_data)
		}
		Swal.close()
	}
	postLoginFunction = async function() {
		console.log('postLoginFunction')
		controlPostInput()
		forceAlert('info', '한줄평 조회중...', '잠시만 기다려주세요!')
		let getPostDataResult = await getPostData()
		if (getPostDataResult.query_status == 'success') {
			displayPostData(getPostDataResult.query_data)
		}
		Swal.close()
	}
	initDate()
	initNavbar()

	// 페이지로 넘어온 매개변수 확인
	let originArgs = window.location.search.split('?')
	if (originArgs.length > 1) {
		for (let i = 1; i < originArgs.length; ++i) {
			const tmp = originArgs[i].split('=')
			args.set(decodeURI(tmp[0]), decodeURI(tmp[1]))
		}
	}

	// 매개변수 제대로 넘어왔으면
	if (args.has('name')) {
		console.log('has name!')
		forceAlert('info', '영화정보 조회중...', '잠시만 기다려주세요!')
		let getMovieDataResult = await getMovieData()
		if (getMovieDataResult.query_status == 'success') {
			if (getMovieDataResult.query_data.length) {
				displayMovieData(getMovieDataResult.query_data[0])
				let getPostDataResult = await getPostData()
				if (getPostDataResult.query_status == 'success') {
					displayPostData(getPostDataResult.query_data)
					Swal.close()
				} else {
					timerAlert('error', '오류', '한줄평을 조회할 수 없습니다')
				}
			} else {
				forceAlert('error', '오류', '영화정보가 존재하지 않습니다')
			}
		} else {
			timerAlert('error', '오류', '영화 정보를 조회할 수 없습니다')
		}
	} else {
		console.log('no name!')
		forceAlert('error', '오류', '영화 제목 매개변수가 없습니다')
	}

	// 상영일정 필터설정
	let companyCheckboxGroupEl = document.getElementsByClassName('company-checkbox')
	let locationSelectorGroupEl = document.getElementsByClassName('locationSelector')
	for (let i = 0; i < 3; ++i) {
		companyCheckboxGroupEl[i].onchange = function() {
			if (companyCheckboxGroupEl[i].checked) {
				locationSelectorGroupEl[i * 2].style.cursor = 'pointer'
				locationSelectorGroupEl[i * 2 + 1].style.cursor = 'pointer'
			} else {
				locationSelectorGroupEl[i * 2].style.cursor = 'default'
				locationSelectorGroupEl[i * 2 + 1].style.cursor = 'default'
			}
			for (let j = 0; j < cinema_location[i].cineLocation.length; ++j) {
				document.getElementById(`${cinema_location[i].name}-location-cb-${j}`).disabled = !this.checked
			}
		}
		locationSelectorGroupEl[i * 2].onclick = function() {
			if (companyCheckboxGroupEl[i].checked) {
				for (let j = 0; j < cinema_location[i].cineLocation.length; ++j) {
					document.getElementById(`${cinema_location[i].name}-location-cb-${j}`).checked = true
				}
			}
		}
		locationSelectorGroupEl[i * 2 + 1].onclick = function() {
			if (companyCheckboxGroupEl[i].checked) {
				for (let j = 0; j < cinema_location[i].cineLocation.length; ++j) {
					document.getElementById(`${cinema_location[i].name}-location-cb-${j}`).checked = false
				}
			}
		}
	}

	for (let i = 0; i < 3; ++i) {
		let rootEl = document.getElementById(cinema_location[i].group)
		rootEl.innerHTML = ''
		for (let j = 0; j < cinema_location[i].cineLocation.length; ++j) {
			let radioWrapper = document.createElement('div')
			let inputEl = document.createElement('input')
			let labelEl = document.createElement('label')
			radioWrapper.classList.add('form-check', 'form-check-inline', 'col-2')
			inputEl.classList.add('form-check-input')
			inputEl.setAttribute('type', 'checkbox')
			inputEl.setAttribute('name', `${cinema_location[i].name}-location-${j}`)
			inputEl.disabled = true
			inputEl.id = `${cinema_location[i].name}-location-cb-${j}`
			inputEl.value = cinema_location[i].cineLocation[j]
			inputEl.style.marginBottom = 0
			labelEl.classList.add('form-check-label')
			labelEl.setAttribute('for', inputEl.id)
			labelEl.innerText = inputEl.value
			radioWrapper.appendChild(inputEl)
			radioWrapper.appendChild(labelEl)
			rootEl.appendChild(radioWrapper)
		}
	}
	document.getElementById('btn_filter_apply').onclick = async () => {
		let result = {
			company: [ true, true, true ],
			cineLoaction: [
				[],
				[],
				[]
			],
			sortOption: {
				pivot: 'time',
				solution: 0
			}
		}
		for (let i = 0; i < 3; ++i) {
			if (companyCheckboxGroupEl[i].checked) {
				let groupRoot = document.getElementById(cinema_location[i].group)
				let checkEl = groupRoot.getElementsByTagName('input')
				for (let j = 0; j < checkEl.length; ++j) {
					if (checkEl[j].checked) result.cineLoaction[i].push(checkEl[j].value)
				}
				if (!result.cineLoaction[i].length) result.company[i] = false
			} else result.company[i] = false
		}
		let sortOptionGroupEl = document.getElementById('sortOptionGroup')
		let sortOptionInput = sortOptionGroupEl.getElementsByTagName('input')
		if (sortOptionInput[0].checked) result.sortOption.pivot = 'time'
		else if (sortOptionInput[1].checked) result.sortOption.pivot = 'remain_chair'
		else result.sortOption.pivot = 'theater_name'
		let sortSolutionGroupEl = document.getElementById('sortSolutionGroup')
		let sortSolutionInput = sortSolutionGroupEl.getElementsByTagName('input')
		if (sortSolutionInput[0].checked) result.sortOption.solution = 0
		else result.sortOption.solution = 1
		console.log(result)

		// 스케줄 로딩
		let firstCinema = true
		let companyName = ['cgv', 'lotte', 'megabox']
		if (!result.company.includes(true)) {
			timerAlert('error', '조회할 항목이 없어요', '영화관을 하나 이상 선택해주세요')
		} else {
			forceAlert('info', '검색중...', '잠시만 기다려주세요!')
			let query = `SELECT * FROM schedule_data WHERE movie_name="${args.get('name')}" AND (`
			for (let i = 0; i < 3; ++i) {
				let firstLocation = true
				if (result.company[i]) {
					if (!firstCinema) query += " OR "
					else firstCinema = false
					query += `(cinema_name="${companyName[i]}" AND cinema_location IN(`
					for (let j = 0; j < result.cineLoaction[i].length; ++j) {
						if (!firstLocation) query += ", "
						else firstLocation = false
						query += `"${result.cineLoaction[i][j]}"`
					}
					query += '))'
				}
			}
			query += `) ORDER BY ${result.sortOption.pivot} ${result.sortOption.solution ? 'DESC' : 'ASC'}`
			console.log(query)
			let getScheduleDataResult = await getScheduleData(query)
			if (getScheduleDataResult.query_status == 'success') {
				scheduleData = getScheduleDataResult.query_data
				displaySchedule()
				Swal.close()
			} else {
				// 스케줄정보 조회실패

			}
		}
		// getSchedule(result)
	}
	document.getElementById('btn_filter_reset').onclick = function() {
		for (let i = 0; i < 3; ++i) {
			locationSelectorGroupEl[i * 2].style.cursor = 'default'
			locationSelectorGroupEl[i * 2 + 1].style.cursor = 'default'
			for (let j = 0; j < cinema_location[i].cineLocation.length; ++j) {
				document.getElementById(`${cinema_location[i].name}-location-cb-${j}`).disabled = true
			}
		}
	}
}