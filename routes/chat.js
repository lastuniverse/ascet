var express = require('express');

var router = express.Router();

// рендерим представление и отдаем его
router.get('/views/:id', function(req, res, next) {

	var id = req.params.id;
	console.log("in GET /chat/views/"+id);
	res.render('chat/'+id, {});
	//res.send('respond with a resource');
});




module.exports = router;