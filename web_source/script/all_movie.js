function getMovieData() {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: "POST",
			url: './php/movie_handler.php',
			dataType: 'json',
			data: {
				command: 'getMovieInfo'
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

window.onload = async () => {
	initNavbar(1)
	forceAlert('info', '영화정보 조회중...', '잠시만 기다려주세요!')
	let getMovieDataResult = await getMovieData()
	if (getMovieDataResult.query_status == 'success') {
		let query_data = getMovieDataResult.query_data
		let movieRoot = document.getElementById('movie_root')
		let imgGroup = movieRoot.getElementsByTagName('img')
		for (let i = 0; i < query_data.length; ++i) {
			imgGroup[i].src = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${query_data[i].poster_path}`
			imgGroup[i].onclick = () => {
				location.href=`./movie_detail.html?name=${query_data[i].name}`
			}
		}
		Swal.close()
	} else {
		timerAlert('error', '', '뭔가 잘못됐어요...')
	}
}