const puppeteer = require("puppeteer");
const cheerio = require('cheerio');
const axios = require('axios')

function calcTime(st, time){ // 12:20, 103분 
	var hour = Number(st.split(':')[0]); // 12시
	var min = Number(st.split(':')[1]); // 20분

	hour += Number(time)/60;
	min += Number(time)%60 + 10;

	if(min >= 60) {min -= 60, hour++}
	if(hour > 24) {hour -= 24}

	let ee_hour = hour.toString();
	let ee_min = min.toString();

	if(hour < 10) {
		let e_hour = '0' + ee_hour;
		ee_hour = e_hour;
	}
	
	if( min < 10) {
		let e_min = '0' + ee_min;
		ee_min = e_min;
	}
	
	let et = ee_hour.split('.')[0] + ':' + ee_min;
	
	return et;
}

async function main(){
	
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
	
	const result = []
	
	let site = [ "0061", "0042", "0337", "0005", "0285", "0303", "0089", "0160", "0306", "0245", "0318", "0159"];
	let theater = ["대연", "동래", "부산명지", "서면", "서면삼정타워", "서면상상마당", "센텀시티", "아시아드", "정관", "하단아트몰링", "해운대", "화명", "CINE de CHEF 센텀"];
	let browser = await puppeteer.launch({headless:false})
	let page = await browser.newPage();
	for(let si = 0; si<=site.length; si++){
		if(si == site.length) await page.goto(`http://www.cgv.co.kr/theaters/special/show-times_new.aspx?regioncode=103&theaterCode=0089`);
		else await page.goto(`http://www.cgv.co.kr/theaters/?areacode=05%2C207&theaterCode=${site[si]}`);
		const frame = await page.frames().find(frame => frame.name() === 'ifrm_movie_time_table');
		
		for(let i = 1; i <= 5; i++){
			await frame.waitForTimeout(1000);
			await frame.click(`#slider > div:nth-child(1) > ul > li:nth-child(${i})`);
			await frame.waitForTimeout(1000);
			const content = await frame.content();
			const $ = cheerio.load(content);
	
			const month = $("#slider > div:nth-child(1) > ul > li.on > div > a > span").text().trim().split("월"); // 월
			const day = $("#slider > div:nth-child(1) > ul > li.on > div > a > strong").text().trim(); // 일
			const date = "2022."+ month[0] + '.' + day; // 2022.월.일 형식
		
			const list = $("body > div > div.sect-showtimes > ul > li"); 
			list.each((lidx, lists) => {
				const name = $(`body > div > div.sect-showtimes > ul > li:nth-child(${lidx+1}) > div > div.info-movie > a > strong`).text().trim().replaceAll('-', ': '); // 영화이름
				movieMatchFlag = false
				for (let i = 0; i < movieList.length; ++i) {
					if (movieList[i].name == name) {
						movieMatchFlag = true
						break
					}
				}
				if (movieMatchFlag) {
					const rt = $(`body > div > div.sect-showtimes > ul > li:nth-child(${lidx+1}) > div > div.info-movie > i:nth-child(6)`).text().trim().split("분")[0]; // 러닝타임
					const typeHall = $(`body > div > div.sect-showtimes > ul > li:nth-child(${lidx+1}) > div > div.type-hall`); // lidx번째 li태그 내 typehall의 개수
					typeHall.each((hidx, typeHalls) => { // 4개 이므로 4번 반복
						const type = $(typeHalls).find("div.info-hall > ul > li:nth-child(1)").text().trim(); // 영화타입
						const hall = $(typeHalls).find("div.info-hall > ul > li:nth-child(2)").text().replace(/\([^)]+\)/g, '').trim(); // 상영관
						const allSeat = $(typeHalls).find("div.info-hall > ul > li:nth-child(3)").text().split(' ').join('').split('\n')[1].split("석")[0].trim(); // 전체 좌석
						const timetable = $(typeHalls).find(`div.info-timetable > ul > li`); // 상영 시간의 개수
						timetable.each((tidx, timetables)=> {
							const deadline = $(timetables).find(`li:nth-child(${tidx+1}) > a`); // 마감되었지만 홈페이지에 계속 띄워져있을경우
							if(deadline == 0) return; // 출력하지 않고 넘어감
			
							const st = $(timetables).find(`li:nth-child(${tidx+1}) > a > em`).text().trim(); // 시작 시간
							let et = calcTime(st,rt); // 시작시간 + 러닝타임해서 끝 시간 반환
			
							const cjojo = $(timetables).find(`li:nth-child(${tidx+1}) > a > span.early.txt-lightblue`); var jojo; // 조조여부
							cjojo.length == 1 ? jojo = 1 : jojo = 0; // 조조면 1 아니면 0
			
							const remainSeat = $(timetables).find(`li:nth-child(${tidx+1}) > a > span.txt-lightblue`).text().trim();
							let rSeat;
							if(remainSeat == "준비중") {rSeat = "준비중"}
							else {rSeat = remainSeat.split("잔여좌석")[1].split("석")[0]}; // 잔여좌석
							
							if (rSeat != '준비중') {
								let apiTemplate = []
								apiTemplate.push(name)
								apiTemplate.push('cgv')
								apiTemplate.push(theater[si])
								apiTemplate.push(date)
								apiTemplate.push(`${st} ~ ${et}`)
								apiTemplate.push(jojo)
								apiTemplate.push(type)
								apiTemplate.push(hall)
								apiTemplate.push(rSeat)
								apiTemplate.push(allSeat)
								result.push(apiTemplate)
								console.log("영화제목 :", name, "\n영화관 지점 :",theater[si], "\n상영날짜 :", date, "\n상영시간 :", st, "~" , et, "\n조조여부 : ", jojo ,"\n영화타입 :",type, "\n상영관 :", hall, "\n잔여 좌석 :", rSeat , "\n전체 좌석 :", allSeat, '\n');								
							}
						});
					});
				}
			});
		}
	}
	browser.close();
	
	const mysql = require('mysql2/promise')
	const db = mysql.createPool({
		host: 'dev-friox.com',
		port: 3310,
		user: 'hwanza',
		password: '0011',
		database: 'miss'
	})
	
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
}
main();