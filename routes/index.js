var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('/', function(req, res, next) {
	res.render('index', { 
		title: "remember note",
		filename: "main", 
		"params": {
			user: req.session.user
		} 
	});
});

module.exports = router;
