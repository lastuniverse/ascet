var fs = require('fs');
var uniq_id = require('../modules/express_uniq_id');
var express = require('express');

var router = express.Router();



// получаем файлы
var multer = require('multer');
var upload = multer({ 
	dest:'./public/upload/',
	limits: {
		fileSize: 300*1024*1024
	}
}).single("upload");

router.post('/file/upload', function(req, res, next) {
	console.log("in POST /files/file/upload/ ");
	upload(req, res, function (err) {
		if (err) 
		return res.send({ status: "error", message:"Файл не должен превышать размер в 30 Мегабайт" });
		res.send({
			status: "server",
			name: req.file.originalname,
			sname: req.file.filename 
		});
	});
});

router.get('/file/:sname/:name', function(req, res, next) {
	var name = req.params.name;
	var sname = req.params.sname;

	console.log("in GET /files/file/ ",JSON.stringify(req.params) );
	res.download('public/upload/'+sname, name, function(err){
	  if (err) {
	  	console.log("in GET /files/file/ error: ", err);
	    // Handle error, but keep in mind the response may be partially-sent
	    // so check res.headersSent
	  } else {
	  	console.log("in GET /files/file/ OK ");
	    // decrement a download credit, etc.
	  }
	});	


});



module.exports = router;
