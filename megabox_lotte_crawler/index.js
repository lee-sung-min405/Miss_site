const express = require('express')
const axios = require('axios')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const db = require('./db')
const app = express()
const port = process.env.PORT || 3002
axios.create({})

const doAsync = fn => async (req, res, next) => await fn(req, res, next).catch(next);

let megaboxList = ['6161', '6001', '6906', '0032', '6191', '6121']

app.get('/', doAsync(async (req, res) => {

	let nowDate = new Date()
	nowDate.setDate(nowDate.getDate() - 1)
	let nowYear = nowDate.getFullYear()
	let nowMonth = nowDate.getMonth() + 1
	let nowDay = nowDate.getDate()
	let nowHour = nowDate.getHours()
	let nowMinutes = nowDate.getMinutes()
	let nowDayOfTheWeek = nowDate.getDay()
	let param = {
		'key': '9f3a3817ead1cd7ad4d6650f0b601e90',
		'targetDt': `${nowYear}${nowMonth < 10 ? '0' : ''}${nowMonth}${nowDay < 10 ? '0' : ''}${nowDay}`
	}

	const movieListOrigin = []
	const movieList = []

	await axios({
		method: "get",
		url: "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json",
		params: param,
		headers: {
			'Content-Type': 'multipart/form-data',
			'Accept-Encoding': 'identity'
		},
	}).then(function (res) {
		let updateDate = `${nowYear}.${nowMonth < 10 ? '0' : ''}${nowMonth}.${nowDay + 1 < 10 ? '0' : ''}${nowDay + 1} ${nowHour < 10 ? '0' : ''}${nowHour}:${nowMinutes < 10 ? '0' : ''}${nowMinutes}`
		let dailyList = res.data.boxOfficeResult.dailyBoxOfficeList
		for (let i = 0; i < dailyList.length; ++i) {
			movieListOrigin.push({
				// name: (dailyList[i].movieNm == '극장판 뽀로로와 친구들: 바이러스를 없애줘!' ? '뽀로로와 친구들 극장판 바이러스를 없애줘!' : dailyList[i].movieNm),
				name: dailyList[i].movieNm,
				audiAcc: parseInt(dailyList[i].audiAcc),
				salesAcc: parseInt(dailyList[i].salesAcc),
				update: updateDate
			})
		}
		// console.log(res.data.boxOfficeResult.dailyBoxOfficeList)
	}).catch(function (err) {
		movieListOrigin.length = 0
		// console.log(err)
	})

	// console.log(movieListOrigin)

	if (movieListOrigin.length) {
		let flag
		// 영화목록이 살아있을때
		for (let i = 0; i < movieListOrigin.length; ++i) {
			flag = false
			// console.log(movieListOrigin[i].name)
			await axios({
				method: "get",
				url: "https://api.themoviedb.org/3/search/movie",
				params: {
					'api_key': '84dbb7a11dcd3a9f3bf7e7fe15082bae',
					'language': 'ko-KR',
					'query': (movieListOrigin[i].name == '극장판 뽀로로와 친구들: 바이러스를 없애줘!' ? '뽀로로와 친구들 극장판 바이러스를 없애줘!' : movieListOrigin[i].name == '신비아파트 극장판 차원도깨비와 7개의 세계' ? '신비아파트 차원도깨비와 7개의 세계' : movieListOrigin[i].name)
				},
				headers: {
					'Content-Type': 'multipart/form-data',
					'Accept-Encoding': 'identity'
				},
			}).then(function (res) {
				// console.log(res.data)
				if (res.data.results.length) {
					movieListOrigin[i].id = res.data.results[0].id
					movieListOrigin[i].overview = res.data.results[0].overview
					movieListOrigin[i].poster_path = res.data.results[0].poster_path
					movieListOrigin[i].release_date = res.data.results[0].release_date
					flag = true
				}
			}).catch(function (err) {
				console.log(err)
			})
			if (flag) {
				await axios({
					method: "get",
					url: `https://api.themoviedb.org/3/movie/${movieListOrigin[i].id}`,
					params: {
						'api_key': '84dbb7a11dcd3a9f3bf7e7fe15082bae',
						'language': 'ko-KR'
					},
					headers: {
						'Content-Type': 'multipart/form-data',
						'Accept-Encoding': 'identity'
					}
				}).then(function (res) {
					// console.log(res.data)
					if (!res.data.hasOwnProperty('success')) {
						movieListOrigin[i].tagline = res.data.tagline
						movieList.push(movieListOrigin[i])
					}
				}).catch(function (err) {
					console.log(err)
				})
			}
		}
	}
	console.log(movieList)

	if (movieList.length) {
		const connection = await db.getConnection(async conn => conn)
		try {
			await connection.beginTransaction()
			for (let i = 0; i < movieList.length; ++i) {
				let sql = 'INSERT INTO movie_data VALUES('
				sql += `'${movieList[i].id}'`				// ID
				sql += `, '${movieList[i].name}'`			// 영화 이름
				sql += `, '${movieList[i].tagline}'`		// 한줄 요약
				sql += `, '${movieList[i].overview.replaceAll('\'', '\\\'')}'`		// 요약
				sql += `, '${movieList[i].release_date}'`	// 개봉일
				sql += `, ${movieList[i].audiAcc}`			// 총 관객 수
				sql += `, ${movieList[i].salesAcc}`			// 총 매출액
				sql += `, '${movieList[i].poster_path}'`	// 포스터 경로
				sql += `, '${movieList[i].update}')`		// 업데이트일
				console.log(sql)
				await connection.query(sql)
			}
			await connection.commit()
		} catch (err) {
			console.log(err)
		} finally {
			connection.release()
		}
	}

	// ##################################################################################################

	let lotteList = [
		['2009', '2007', '9092', '2004', '2008', '2006', '2011', '9059'],
		['2012', '2010']
	]
	
	let browser = await puppeteer.launch({headless:true})
	let page = await browser.newPage();

	const result = []
	let movieMatchFlag

	for (let y = 0; y < 2; ++y) {
		for (let x = 0; x < lotteList[y].length; ++x) {
			await page.goto(`https://www.lottecinema.co.kr/NLCHS/Cinema/Detail?divisionCode=1&detailDivisionCode=101&cinemaID=${lotteList[y][x]}`);
			if (!y) {
				if (lotteList[y][x] == '2011') {
					await page.waitForSelector("#layerPopupMulti > li > div.layer_footer.ty2 > ul > li > button");
					await page.click("#layerPopupMulti > li > div.layer_footer.ty2 > ul > li > button");
					await page.waitForSelector("#layerPopupMulti.active", {hidden: true});
				} else {
					await page.waitForSelector("#layerGetPopup > div.layer_footer.ty2 > ul > li > button");
					await page.click("#layerGetPopup > div.layer_footer.ty2 > ul > li > button");
					await page.waitForSelector("#layerGetPopup.active", {hidden: true});
				}
			}
			await page.waitForSelector('div.date_select_wrap.datetheaterWrap')
			let content = await page.content()
			let $ = cheerio.load(content)
			let dateArray = []
			let clickArray = []
			let flag = false
			let month
			let day
			let activeOwlGroup = $($('div.owl-stage')[1]).find('div.owl-item.active')
			for (let i = 0; i < activeOwlGroup.length; ++i) {
				if (flag) {
					if ($(activeOwlGroup[i]).find('li.item > strong.month').length) {
						// 월이 바뀌었을때 갱신
						month = $(activeOwlGroup[i]).find('li.item > strong.month').text()
					}
					day = $(activeOwlGroup[i]).find('li.item > span.date > label > strong').text()
					dateArray.push(`2022.${month < 10 ? '0' : ''}${month}.${day < 10 ? '0' : ''}${day}`)
					clickArray.push(i + 1)
					if (clickArray.length >= 5) break
				} else if ($(activeOwlGroup[i]).find('li.item > span.date > label > em').text() == '오늘') {
					flag = true
					month = $(activeOwlGroup[i]).find('li.item > strong.month').text().split('월')[0]
					day = $(activeOwlGroup[i]).find('li.item > span.date > label > strong').text()
					dateArray.push(`2022.${month < 10 ? '0' : ''}${month}.${day < 10 ? '0' : ''}${day}`)
					clickArray.push(i + 1)
				}
			}
			let cinema = $('div.theater_tit > h3.tit').text();
			for (let i = 0; i < 5; ++i) {
				let queryStr = `#timeTable > div.date_select_wrap.datetheaterWrap > div > ul > div.owl-stage-outer > div > div:nth-child(${clickArray[i]}) > li > span`
				await page.click(queryStr);
				await page.waitForTimeout(1000)
				content = await page.content();
				$ = cheerio.load(content);
				console.log(`[LOTTE ${cinema} - ${dateArray[i]}]`)
				$(`#mCSB_${i * 2 + 2}_container > div`).map((index, movieRoot) => {
					let movieName = $(movieRoot).find('div.list_tit > p').text()
					movieMatchFlag = false
					for (let i = 0; i < movieList.length; ++i) {
						if (movieList[i].name == movieName) {
							movieMatchFlag = true
							break
						}
					}
					if (movieMatchFlag) {
						console.log(`🟢 : ${movieName}`)
						$(movieRoot).find('ul.list_hall').map((idx, el) => {
							let movieType = $(el).find('li:first-child').text()
							$($(movieRoot).find('ul.list_time')[idx]).find('li').map((idx, el) => {
								let early = el.attribs.class.split(' ').includes('morning') ? 1 : 0 // 조조여부
								let time = $(el).find('a > dl > dd.time').text().split('종료 ') // 시간
								let seat = $(el).find('a > dl > dd.seat').text().split(' / ') // 좌석
								let hall = $(el).find('a > dl > dd.hall').text() // 상영관
								if (seat[0] != '상영준비중' && seat[0] != '예매마감') {
									// 예약가능할때
									let apiTemplate = []
									apiTemplate.push(movieName)
									apiTemplate.push('lotte')
									apiTemplate.push(cinema)
									apiTemplate.push(dateArray[i])
									apiTemplate.push(`${time[0]} ~ ${time[1]}`)
									apiTemplate.push(early)
									apiTemplate.push(movieType)
									apiTemplate.push(hall)
									apiTemplate.push(seat[0])
									apiTemplate.push(seat[1])
									result.push(apiTemplate)
								}
							})
						})
					} else {
						console.log(`🔴 : ${movieName}`)
					}
				})
				console.log()
			}
		}
	}

	const removeBig = / ?\[[^)]+\] ?/gi
	const removeMiddle = / ?\([^)]+\) ?/gi

	await page.setCacheEnabled(0)
	for (let k = 0; k < megaboxList.length; ++k) {
		await page.goto(`https://www.megabox.co.kr/theater/time?brchNo=${megaboxList[k]}`)
		let content = await page.content()
		let $ = cheerio.load(content)
		let cinema_name = $('p.name').text()
		const btnEl = $('div.date-area div button')
		for (let i = 1; i <= (btnEl.length < 5 ? btnEl.length : 5); ++i) {
			console.log(`MEGABOX [${cinema_name} - ${btnEl[i].attribs['date-data']}, ${!btnEl[i].attribs.class.split(' ').includes('disabled') ? '활성화' : '비활성화'}]`)
			// console.log(, btnEl[i].attribs.class.split(' '), )
			if (!btnEl[i].attribs.class.split(' ').includes('disabled')) {
				let tmp = {}
				tmp.cinema_name = cinema_name
				tmp.date = btnEl[i].attribs['date-data']
				await page.click(`div.date-area > div > button:nth-child(${i + 1})`)
				await page.waitForSelector(`div.date-area > div > button:nth-child(${i + 1}).on`)
				content = await page.content()
				$ = cheerio.load(content)
				$('div.theater-list').map(function (i, el) {
					tmp.movie_name = $(el).find('.theater-tit p:nth-of-type(2) a').text()
					movieMatchFlag = false
					for (let i = 0; i < movieList.length; ++i) {
						if (movieList[i].name == tmp.movie_name) {
							movieMatchFlag = true
							break
						}
					}
					if (!movieMatchFlag) {
						console.log(`🔴 : ${tmp.movie_name}`)
					} else {
						console.log(`🟢 : ${tmp.movie_name}`)
						tmp.movie_name = tmp.movie_name.replace(removeBig, '').replace(removeMiddle, '')
						// if (!movieList.includes(tmp.movie_name)) movieList.push(tmp.movie_name)
						$(el).find('.theater-type-box').map(function (j, el) {
							tmp.theater_name = $(el).find('.theater-type .theater-name').text()
							tmp.all_chair = $(el).find('.theater-type .chair').text()
							$(el).find('.theater-time').map(function (k, el) {
								tmp.movie_type = $(el).find('.theater-type-area').text()
								$(el).find('.theater-time-box').map(function (l, el) {
									$(el).find('div.txt-center').map(function (m, el) {
										tmp.time = $(el).find('p.time').text()
										tmp.remain_chairs = $(el).find('p.chair').text()
										tmp.early = $(el).find('.ico-box .ico-sun').length
										tmp.time2 = $(el).find('.play-time p:first-child').text()
										let apiTemplate = []
										apiTemplate.push(tmp.movie_name)
										apiTemplate.push('megabox')
										apiTemplate.push(tmp.cinema_name)
										apiTemplate.push(tmp.date)
										apiTemplate.push(tmp.time2.replace('~', ' ~ '))
										apiTemplate.push(tmp.early)
										apiTemplate.push(tmp.movie_type)
										apiTemplate.push(tmp.theater_name)
										apiTemplate.push(tmp.remain_chairs.replace('석', ''))
										apiTemplate.push(tmp.all_chair.replace('총 ', '').replace('석', ''))
										result.push(apiTemplate)
									})
								})
							})
						})
					}

				})
			}
			console.log()
		}
	}

	

	if (result.length) {
		const connection = await db.getConnection(async conn => conn)
		try {
			await connection.beginTransaction()
			for (let i = 0; i < result.length; ++i) {
				let sql = 'INSERT INTO schedule_data VALUES('
				sql += `'${result[i][0]}'`		// 영화 이름
				sql += `, '${result[i][1]}'`	// 영화관 이름
				sql += `, '${result[i][2]}'`	// 영화관 지점
				sql += `, '${result[i][3]}'`	// 상영 날짜
				sql += `, '${result[i][4]}'`	// 상영 시간
				sql += `, ${result[i][5]}`		// 조조영화 여부
				sql += `, '${result[i][6]}'`	// 영화 종류
				sql += `, '${result[i][7]}'`	// 상영관 이름
				sql += `, ${result[i][8]}`		// 잔여 좌석
				sql += `, ${result[i][9]})`		// 전체 좌석
				console.log(sql)
				await connection.query(sql)
			}
			await connection.commit()
		} catch (err) {
			console.log(err)
		} finally {
			connection.release()
		}
	}


	res.json({
		status: 'success',
		result: result
	})
}))

app.listen(port, () => {
	console.log(`server is listening at localhost:${port}`)
})