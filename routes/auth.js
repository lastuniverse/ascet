var crypto = require('crypto');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/auth/login', function(req, res, next) {
	console.log("POST /auth/login: ", req.body.login, req.body.password );
	if( !req.body.login || !req.body.password)
		return next();

	var db = req.app.nedb.db;
	var user = {};
	var login = req.body.login||"";
	var password = req.body.password||"";
	db.users.findOne({ login: login }, function (err, user) {
		var hash = crypto.createHash('sha1').update(password).digest('hex');
		console.log("hash: ",hash);
		if( err || !user || user.disabled == 1 || !( user.password === hash ) )
			return next();
		console.log("search in db", user);
		delete user.password;
		req.session.user = user;
		next();
	});
});

router.all("/auth/logout", function(req, res, next) {
	console.log("ALL /auth/logout: " );
	delete req.session.user;
	res.writeHead(303, {'Location': '/users/login'});
    res.end();
	//next();
});

router.all('/auth/login', function(req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("********************************************");
	console.log("********************************************");
	console.log("ктото: "+ip);
	console.log("********************************************");
	console.log("********************************************");
	if( !req.session.user )
		return auth_page(req, res);

	res.writeHead(303, {'Location': '/'});
	res.end();
});

router.all(/.*/, function(req, res, next) {
	if( req.session.user )
		return next();

	res.writeHead(303, {'Location': '/auth/login'});
	res.end();
	
});


function load_user_data(req){

}

function auth_page(req, res){
	res.render('index', { 
		title: "Авторизуйтесь пожалуйста",
		filename: "users/auth", 
		"params": {"login": req.body.login||"","remember": req.body.remember?true:false} 
		//"params": {"login": "","remember": false } 
	});
	console.log("AUTH POST", req.body);
}
module.exports = router;
