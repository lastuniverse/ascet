"use strict";

const crypto = require('crypto');
const uniq_id = require('../modules/express_uniq_id');

const EventEmitter = require('events');
const util = require('util');

function Users() {
  EventEmitter.call(this);
}
util.inherits(Users, EventEmitter);

var users = new Users();


users.on("connect",function(ws, req, res, json) {
	console.log("* клиент подключился: ",ws.user_id);
	var db = req.app.nedb.db;
	db.users.findOne({ "id": ws.user_id }, function (err, user) {
		if (err) return;
		user.icon= "circle";
		db.users.update({ "id": ws.user_id }, user , {}, function (err, numReplaced) {
			if (err) return;
			delete user.password;
			res.broadcast(user,"update");
		});
	});

});

users.on("disconnect",function(ws, req, res, json) {
	console.log("* клиент отключился: ",ws.user_id);
	var db = req.app.nedb.db;
	db.users.findOne({ "id": ws.user_id }, function (err, user) {
		if (err) return;
		user.icon= "circle-o";
		db.users.update({ "id": ws.user_id }, user , {}, function (err, numReplaced) {
			if (err) return;
			delete user.password;
			res.broadcast(user,"update");
		});
	});
});

users.on("get",function(ws, req, res, json) {
	console.log("in users->get event: ", JSON.stringify(json));

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
		res.send(users);
	});	
});


users.on("insert",function(ws, req, res, json) {
	console.log("in users->insert event: ", JSON.stringify(json));

	var db = req.app.nedb.db;
	json.id = uniq_id();
	json.key = json.id;
	json.value = json.function;
	json.icon = "remove";
	json.password = crypto.createHash('sha1').update(json.password).digest('hex');

    if( json.id == "admin" || json.id == "guest" ){
    	return res.reply({ status:"error", message: "Хакерам тут не место :)" });
    }
    
	db.users.insert(json, function (err, newDoc) {
		if( err )
			return res.reply({ status:"error", message: "Не удалось создать пользователя. ошибка: "+err });
		delete json.password;
		res.reply({ newid: json.id });
		res.broadcast(json);
	});
});

users.on("update",function(ws, req, res, json) {
	console.log("in users->update event: ", JSON.stringify(json));

	var db = req.app.nedb.db;
	var id = json.id;

	db.users.findOne({ "id": id }, function (err, user) {
		if (err)
			return res.reply({ status:"error", message: "Такой пользователь не существует. ошибка: "+err });

		if( json.password && typeof json.password == "string" && json.password.length > 0 ){
			json.password = crypto.createHash('sha1').update(json.password).digest('hex');
		}else{
			json.password = user.password;
		}

		//delete json.icon;
		//delete json.badge;

	    if( id == "admin" ){
	    	json.admin = "1";
	    	json.disabled = "0";
	    }

	    if( id == "guest" ){
	    	json.admin = "0";
	    	json.disabled = "1";
	    }
    	
		json.value = json.function;

		db.users.update({ "id": id }, json , {}, function (err, numReplaced) {
			if (err)
				return res.reply({ status:"error", message: "Не удалось записать изменения в профиль пользователя. ошибка: "+err });
			delete json.password;
			res.broadcast(json);
		});
	});


});

users.on("delete",function(ws, req, res, json) {
	console.log("in users->delete event: ", JSON.stringify(json));
    var db = req.app.nedb.db;
    var id = json.id;
    if( id == "admin" || id == "guest" )
    	return res.reply({ status:"error", message: "Этого пользователя нельзя удалить."});
	db.users.remove({ id: id }, {}, function (err, numRemoved) {
		if (err)
			return res.reply({ status:"error", message: "Вы не можете удалить этого пользователя. ошибка: "+err });
		res.broadcast(json);
	});

});

module.exports = users;

