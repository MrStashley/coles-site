const express = require('express')
const router = express.Router()
const mysql = require('mysql') 

const con = mysql.createPool({
	connectionLimit: 100,
	host: "us-cdbr-iron-east-03.cleardb.net",
	user: "b31e06c660fbbd",
	password:"d9509ec4",
	port: 3306,
	database: "heroku_a07141a102e2b1f",
	debug: 'false'
})

var logindata = {
	logininfo: 0
}


/*con.connect(function(err){
	if(err){
		console.error("Error Connecting" + err.stack)
	}
	console.log("Connected as id " + con.threadId)

})*/


router.get('/', (req, res, next) => { //handles GET request
		res.redirect('/home')
})

router.get('/json', (req, res, next) =>{ //handles get @ /json
	const data = { //json object 
		greeting: 'Hello!'
	}

	res.json(data); //sends json object to website
})

router.get('/home', (req, res, next) => {//Handles get @ /home

	res.render('home', logindata)//renders home.mustache from views

	if (logindata.logininfo != 2){
		logindata = {
			logininfo:0
		}
	}



})

router.get('/BouncyBall', (req, res, next) => {//Handles get @ /home
	res.render('BouncyBall',logindata)	//renders home.mustache from views
})

router.get('/userinfo', (req, res, next) =>{
	const username = req.query.username;
	const password = req.query.password;

	con.query("SELECT * FROM userinfo WHERE username = ? AND password = ?", [username,password], function(err, result){
		if(err){
			console.error(err.stack)
			logindata = {
				logininfo: 3
			}
		}else if(result.length == 0){
			logindata = {
				logininfo: 1
			}
		}else if(result.length == 1){
			logindata = {
				logininfo: 2,
				username: username
			}
		}else {
			logindata = {
				logininfo: 3
			}
		}
	})

	res.redirect('/home')
})

router.get('/userinfo/register', (req, res, next) =>{
	const username = req.query.username;
	const password = req.query.password;

	con.query("INSERT INTO userinfo VALUES (?,?)",[username, password], function(err, result){
		if(err){
			console.error(err.stack)
		}
	})

	logindata = {
		logininfo: 4,
	}
	res.redirect('/home')
})

router.get('/logout', (req, res, next) =>{
	logindata = {
		logininfo: 0
	}
	res.redirect('/home')
})

module.exports = router