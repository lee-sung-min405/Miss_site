let noticeViewModalEl
let noticeWriteModalEl

function displayNoticeData(data) {
	let noticeListRootEl = document.getElementById('noticeListRoot')
	if (data.length) {
		noticeListRootEl.innerHTML = ''
		for (let i = 0, j = data.length; i < data.length; ++i, --j) {
			let tmpTr = document.createElement('tr')
			tmpTr.insertAdjacentHTML("beforeend", `<td>${j}</td>`)
			tmpTr.insertAdjacentHTML("beforeend", `<td onclick="settingViewModal('${data[i].noticeID}')"><b>[${data[i].category}]</b> ${data[i].title}</td>`)
			tmpTr.insertAdjacentHTML("beforeend", `<td>${data[i].date.substring(0, 10)}</td>`)
			// tmpTr.insertAdjacentHTML("beforeend", `<td>${data[i].category}</td>`)
			tmpTr.insertAdjacentHTML("beforeend", `<td>${data[i].view}</td>`)
			noticeListRootEl.appendChild(tmpTr)
		}
	} else {
		noticeListRootEl.innerHTML = `<tr class="disableHover"><td colspan="4" style="font-size: 14pt; font-weight: bold; padding: 50px 0;">공지사항이 없습니다!</td></tr>`
	}
}

function controlNoticeInput() {
	console.log(getCookie('role'))
	let noticeWriteBtnEl = document.getElementById('noticeWriteBtn')
	let noticeDeleteBtnEl = document.getElementById('noticeDeleteBtn')
	let noticeEditBtnEl = document.getElementById('noticeEditBtn')
	if (getCookie('role') == 'admin') {
		noticeWriteBtnEl.style.display = 'inline-block'
		noticeDeleteBtnEl.style.display = 'inline-block'
		noticeEditBtnEl.style.display = 'inline-block'
	} else {
		noticeWriteBtnEl.style.display = 'none'
		noticeDeleteBtnEl.style.display = 'none'
		noticeEditBtnEl.style.display = 'none'
	}
}

function getNoticeData(data = {}) {
	data = {
		command: 'read',
		...data
	}
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/notice_handler.php',
			dataType: 'json',
			data: data,
			success: (obj) => {
				console.log('noticeData', obj)
				resolve(obj)
			},
			error: (err) => {
				console.log(err)
				reject(err)
			}
		})
	})
}

function deleteNoticeData(noticeID) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/notice_handler.php',
			dataType: 'json',
			data: {
				command: 'delete',
				jwt: getCookie('userHash'),
				noticeID: noticeID
			},
			success: (obj) => {
				console.log('deleteResult', obj)
				resolve(obj)
			},
			error: (err) => {
				console.log(err)
				reject(err)
			}
		})
	})
}

function uploadNoticeData(mcategory) {
	let noticeWriteTitleInputEl = document.getElementById('noticeWriteTitleInput')
	let noticeWriteContentInputEl = document.getElementById('noticeWriteContentInput')
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/notice_handler.php',
			dataType: 'json',
			data: {
				command: 'create',
				jwt: getCookie('userHash'),
				noticeID: getRandomStr(6),
				category: mcategory,
				title: noticeWriteTitleInputEl.value,
				content: noticeWriteContentInputEl.value,
				date: getDate()
			},
			success: (obj) => {
				console.log('uploadNoticeResult', obj)
				resolve(obj)
			},
			error: (err) => {
				console.log(err)
				reject(err)
			}
		})
	})
}

function settingWriteModal() {
	let noticeWriterEl = document.getElementById('noticeWriter')
	let noticeWriteCategoryInputEl = document.getElementById('noticeWriteCategoryInput')
	let categoryNoticeRadioEl = document.getElementById('categoryNoticeRadio')
	let noticeWriteTitleInputEl = document.getElementById('noticeWriteTitleInput')
	let noticeWriteContentInputEl = document.getElementById('noticeWriteContentInput')
	noticeWriterEl.innerText = getCookie('nickname')
	noticeWriteCategoryInputEl.value = '공지'
	noticeWriteCategoryInputEl.disabled = true
	categoryNoticeRadioEl.checked = true
	noticeWriteTitleInputEl.value = ''
	noticeWriteContentInputEl.value = ''
}

async function settingViewModal(noticeID) {
	let noticeViewTitleEl = document.getElementById('noticeViewTitle')
	let noticeViewCategoryEl = document.getElementById('noticeViewCategory')
	let noticeViewDateEl = document.getElementById('noticeViewDate')
	let noticeViewCountEl = document.getElementById('noticeViewCount')
	let noticeViewContentEl = document.getElementById('noticeViewContent')
	let noticeDeleteBtnEl = document.getElementById('noticeDeleteBtn')
	let noticeEditBtnEl = document.getElementById('noticeEditBtn')
	forceAlert('info', '공지 불러오는중...', '잠시만 기다려주세요!')

	noticeViewTitleEl.innerText = 'title'
	noticeViewCategoryEl.innerText = 'category'
	noticeViewDateEl.innerText = 'date'
	noticeViewCountEl.innerText = 'count'
	noticeViewContentEl.readOnly = true
	noticeViewContentEl.style.border = 'none'
	noticeViewContentEl.value = ''
	noticeDeleteBtnEl.innerText = '삭제'
	noticeEditBtnEl.innerText = '수정'

	let getNoticeDataResult = await getNoticeData({ noticeID: noticeID })
	if (getNoticeDataResult.query_status == 'success') {
		if (getNoticeDataResult.query_data) {
			let useData = getNoticeDataResult.query_data
			noticeViewTitleEl.innerText = useData.title
			noticeViewCategoryEl.innerText = useData.category
			noticeViewDateEl.innerText = useData.date
			noticeViewCountEl.innerText = useData.view
			noticeViewContentEl.value = useData.content
			const deleteFunc = () => {
				questionAlert('정말 삭제할까요?', '삭제 후 복구할 수 없어요', async () => {
					forceAlert('info', '삭제중...', '잠시만 기다려주세요!')
					let deleteNoticeDataResult = await deleteNoticeData(useData.noticeID)
					if (deleteNoticeDataResult.query_status == 'success') {
						let getNoticeDataResult = await getNoticeData()
						if (getNoticeDataResult.query_status == 'success') {
							displayNoticeData(getNoticeDataResult.query_data)
						}
						noticeViewModalEl.hide()
						timerAlert('success', '삭제 완료', '정상적으로 삭제되었어요')
					} else if (deleteNoticeDataResult.query_status == 'invalid' || deleteNoticeDataResult.query_status == 'user_invalid') {
						timerAlert('error', '오류', '사용자 정보가 유효하지 않습니다')
					}
				})
			}
			const editFunc = () => {
				let originContent = noticeViewContentEl.value
				noticeViewContentEl.readOnly = false
				noticeViewContentEl.style.setProperty('border', '')
				// noticeDeleteBtnEl.style.display = 'none'
				noticeDeleteBtnEl.innerText = '취소'
				noticeEditBtnEl.innerText = '수정'
				noticeDeleteBtnEl.onclick = () => {
					noticeViewContentEl.value = originContent
					noticeViewContentEl.style.border = 'none'
					noticeViewContentEl.readOnly = true
					noticeDeleteBtnEl.innerText = '삭제'
					noticeDeleteBtnEl.onclick = deleteFunc
					noticeEditBtnEl.onclick = editFunc
				}
				noticeEditBtnEl.onclick = () => {
					if (noticeViewContentEl.value.length) {
						// 내용이 있을 때
						if (noticeViewContentEl.value != originContent) {
							// 내용이 수정되었을 때
							questionAlert('이대로 수정할까요?', '작성한 내용을 다시한번 확인해주세요', async () => {
								forceAlert('info', '수정중...', '잠시만 기다려주세요!')
								let editNoticeDataResult = await editNoticeData(noticeID, noticeViewContentEl.value)
								if (editNoticeDataResult.query_status == 'success') {
									noticeViewContentEl.style.border = 'none'
									noticeViewContentEl.readOnly = true
									noticeDeleteBtnEl.innerText = '삭제'
									noticeDeleteBtnEl.onclick = deleteFunc
									noticeEditBtnEl.onclick = editFunc
									timerAlert('success', '수정완료', '정상적으로 수정되었어요')
								} else if (editNoticeDataResult.query_status == 'user_invalid') {
									timerAlert('error', '오류', '사용자 정보가 유효하지 않습니다')
								} else {
									timerAlert('error', '오류', '무슨일이지?...')
								}
							})
						} else {
							// 내용이 수정되지 않았을 때
							timerAlert('error', '오류', '변경사항이 없어요')
						}
					} else {
						// 내용이 없을 때
						timerAlert('error', '오류', '내용을 확인해주세요')
					}
				}
			}
			noticeDeleteBtnEl.onclick = deleteFunc
			noticeEditBtnEl.onclick = editFunc
			noticeViewModalEl.show()
			Swal.close()
		} else {
			timerAlert('error', '오류', '공지를 불러올 수 없어요')
		}
	} else {
		timerAlert('error', '오류', '공지를 불러올 수 없어요')
	}
}

function editNoticeData(noticeID, content) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type : "POST",
			url : './php/notice_handler.php',
			dataType : 'json',
			data : {
				command: 'update',
				jwt: getCookie('userHash'),
				noticeID: noticeID,
				content: content
			},
			success: (obj) => {
				console.log('editResult', obj)
				resolve(obj)
			},
			error: (err) => {
				console.log(err)
				reject(err)
			}
		})
	})
}

function confirmWrite() {
	let noticeWriteCategoryInputEl = document.getElementById('noticeWriteCategoryInput')
	let categoryCustomRadioEl = document.getElementById('categoryCustomRadio')
	let noticeWriteTitleInputEl = document.getElementById('noticeWriteTitleInput')
	let noticeWriteContentInputEl = document.getElementById('noticeWriteContentInput')
	// 안되는경우 다쓰자
	if (categoryCustomRadioEl.checked && !noticeWriteCategoryInputEl.value.length) {
		// 직접입력인데 분류가 비었을때
		timerAlert('info', '', '분류가 비었어요')
	} else if (!noticeWriteTitleInputEl.value.length) {
		// 제목이 비었을때
		timerAlert('info', '', '제목이 비었어요')
	} else if (!noticeWriteContentInputEl.value.length) {
		// 내용이 비었을때
		timerAlert('info', '', '내용이 비었어요')
	} else {
		// 모든조건 만족
		questionAlert('이대로 작성할까요?', '작성한 내용을 다시한번 확인해주세요', async () => {
			forceAlert('info', '처리중...', '잠시만 기다려주세요!')
			console.log(noticeWriteCategoryInputEl.value)
			let uploadNoticeDataResult = await uploadNoticeData(noticeWriteCategoryInputEl.value)
			console.log(uploadNoticeDataResult)
			if (uploadNoticeDataResult.query_status == 'success') {
				let getNoticeDataResult = await getNoticeData()
				if (getNoticeDataResult.query_status == 'success') {
					displayNoticeData(getNoticeDataResult.query_data)
				}
				noticeWriteModalEl.hide()
				timerAlert('success', '완료', '정상적으로 작성했어요')
			} else if (uploadNoticeDataResult.query_status == 'user_invalid') {
				timerAlert('error', '오류', '사용자 정보가 유효하지 않습니다')
			} else {
				timerAlert('error', '오류', '무슨일이지?...')
			}
		})
	}
}

window.onload = async () => {
	initNavbar(1)
	noticeViewModalEl = new bootstrap.Modal('#noticeViewModal', {keyboard : false})
	noticeWriteModalEl = new bootstrap.Modal('#noticeWriteModal', {keyboard : false})
	let noticeWriteCategoryInputEl = document.getElementById('noticeWriteCategoryInput')
	let categoryNoticeRadioEl = document.getElementById('categoryNoticeRadio')
	let categoryEventRadioEl = document.getElementById('categoryEventRadio')
	let categoryCustomRadioEl = document.getElementById('categoryCustomRadio')
	
	noticeWriteCategoryInputEl.onreset = (el) => {
		noticeWriteCategoryInputEl.disabled = true
		noticeWriteCategoryInputEl.value = '공지'
	}

	categoryNoticeRadioEl.onchange = (el) => {
		if (categoryNoticeRadioEl.checked) {
			noticeWriteCategoryInputEl.disabled = true
			noticeWriteCategoryInputEl.value = '공지'
		}
	}

	categoryEventRadioEl.onchange = (el) => {
		if (categoryEventRadioEl.checked) {
			noticeWriteCategoryInputEl.disabled = true
			noticeWriteCategoryInputEl.value = '이벤트'
		}
	}

	categoryCustomRadioEl.onchange = (el) => {
		if (categoryCustomRadioEl.checked) {
			noticeWriteCategoryInputEl.disabled = false
			noticeWriteCategoryInputEl.value = ''
		}
	}

	controlNoticeInput()
	postLogoutFunction = function() {
		controlNoticeInput()
	}
	postLoginFunction = function() {
		controlNoticeInput()
	}
	
	// 공지 로딩
	forceAlert('info', '조회중...', '잠시만 기다려주세요!')
	let getNoticeDataResult = await getNoticeData()
	if (getNoticeDataResult.query_status == 'success') {
		displayNoticeData(getNoticeDataResult.query_data)
		Swal.close()
	} else {
		timerAlert('error', '오류', '공지를 불러올 수 없어요')
	}

	// 공지작성버튼 온클릭 이벤트
	document.getElementById('noticeWriteBtn').onclick = function() {
		settingWriteModal()
		noticeWriteModalEl.show()
	}

	document.getElementById('noticeWriteCancelBtn').onclick = function() {
		noticeWriteModalEl.hide()
	}

	document.getElementById('noticeWriteResetBtn').onclick = function() {
		settingWriteModal()
	}

	document.getElementById('noticeWriteConfirmBtn').onclick = function() {
		confirmWrite()
	}

	document.getElementById('noticeCloseBtn').onclick = function() {
		noticeViewModalEl.hide()
	}
}