const mysql = require('mysql2/promise')
const pool = mysql.createPool({
	host: 'dev-friox.com',
	port: 3310,
	user: 'hwanza',
	password: '0011',
	database: 'miss'
})
module.exports = pool