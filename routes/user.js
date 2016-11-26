var express = require('express');
var crypto = require('crypto');
var uniq_id = require('../modules/express_uniq_id');

var router = express.Router();


/* GET users listing. */
router.get('/views/:id', function(req, res, next) {
	var id = req.params.id;
	console.log("in GET /user/views/"+id);
	res.render('users/'+id, {});
	//res.send('respond with a resource');
});

router.get('/data/i', function(req, res, next) {
	console.log("in GET /user/data/i");
	if(req.session.user)
		return res.json(req.session.user);
	res.json({});
});


router.get('/data/list', function(req, res, next) {
	console.log("in GET /user/data/list");
	var db = req.app.nedb.db;
	db.users.find({ }, function (err, users) {
		
		users = users
		.map(function (user) {
			user.value = user.function;
			user.key = user.id;
			user.password = "";
			return user;
		})
		.sort(function (a, b) {
		  if (a.value > b.value) return 1;
		  if (a.value < b.value) return -1;
		  return 0;
		});

		res.json(users);
	});
});


router.post('/data', function(req, res){
	console.log("in POST /user/data");
	var db = req.app.nedb.db;
	req.body.id = req.body.id||uniq_id();
	req.body.password = crypto.createHash('sha1').update(req.body.password).digest('hex');

    if( req.body.id == "admin" || req.body.id == "guest" ){
    	return res.send({ status:"error", message: "Хакерам тут не место :)" });
    }

	db.users.insert(req.body, function (err, newDoc) {
		if( err )
			return res.send({ status:"error", message: "Не удалось создать пользователя. ошибка: "+err });
		res.send({newid: req.body.id});
		emit_users_update(req);
	});
});

router.put('/data/:id', function(req, res){
	console.log("in PUT /user/data");
	var db = req.app.nedb.db;
	var id = req.params.id;

	db.users.findOne({ "id": id }, function (err, user) {
		if (err)
			return res.send({ status:"error", message: "Не удалось записать изменения в профиль пользователя. Такой пользователь не существует. ошибка: "+err });

		if( req.body.password && typeof req.body.password == "string" && req.body.password.length > 0 ){
			req.body.password = crypto.createHash('sha1').update(req.body.password).digest('hex');
		}else{
			req.body.password = user.password;
		}

		delete req.body.icon;
		delete req.body.badge;

		if(req.body.profile) req.body.profile = JSON.parse(req.body.profile);

	    if( id == "admin" ){
	    	req.body.admin = "1";
	    	req.body.disabled = "0";
	    }
	    if( id == "guest" ){
	    	req.body.admin = "0";
	    }
    	

		db.users.update({ "id": id }, req.body , {}, function (err, numReplaced) {
			if (err)
				return res.send({ status:"error", message: "Не удалось записать изменения в профиль пользователя. ошибка: "+err });
			res.send({});
			emit_users_update(req);
		});
	});


});



router.delete('/data/:id', function(req, res){
    console.log("in DELETE /user/data");
    var db = req.app.nedb.db;
    var id = req.params.id;
    if( id == "admin" || id == "guest" )
    	return res.send({ status:"error", message: "Этого пользователя нельзя удалить." });
	db.users.remove({ id: id }, {}, function (err, numRemoved) {
		if (err)
			return res.send({ status:"error", message: "Не удалось удалить пользователя. ошибка: "+err });
		res.send({});
		emit_users_update(req);
	});
});


function emit_users_update(req){
	var db = req.app.nedb.db;
	db.users.find({ $not: {disabled: true} },function(err, users){ 
		users.map(function(user){
			user.password = "";
			return user;
		});
		var json = {
			emit:"users/update",
			users: users
		};
		req.app.ws.broadcast(JSON.stringify(json));	
	});		
}




module.exports = router;



// var data = [{ name:"Test 1" }, { name:"Test 2" }];
// findByID(0,data);

// app.get('/data', function(req, res){
// 	console.log("app.get: "+JSON.stringify(data));
//     res.send(data);
// });


// app.post('/data', function(req, res){
// 	req.body.id = getNewID();
// 	res.send({ newid:req.body.id });
// 	data.push(req.body);
// 	console.log( "app.post: "+JSON.stringify(req.body) );
// });

// app.put('/data/:id', function(req, res){
// 	var id = req.params["id"];
// 	console.log("app.put 1: "+JSON.stringify(req.body));
// 	replaceByID(id, data,req.body)
//     //if (err) return res.send({ status:"error" });
//     res.send({});
// });
// app.delete('/data/:id', function(req, res){
// 	console.log("app.delete: "+JSON.stringify(req.body) );
// 	//if (err) return res.send({ status:"error" });
// 	res.send({});
//     // db.record.removeById(req.param("id"), req.body, function(err){
//     //     if (err) return res.send({ status:"error" });
//     //     res.send({});
//     // });
// });