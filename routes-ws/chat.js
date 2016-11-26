"use strict";
const moment = require('moment');
const uniq_id = require('../modules/express_uniq_id');

const EventEmitter = require('events');
const util = require('util');

function Chat() {
  EventEmitter.call(this);
}
util.inherits(Chat, EventEmitter);

var chat = new Chat();



chat.on("get",function(ws, req, res, json) {
	console.log("in chat->get event: ", JSON.stringify(json));

	var db = req.app.nedb.db;

	// получаем дату на 30 дней назад
	var date_ago = moment(new Date()).subtract(30, 'd').format("YYYY-MM-DD hh:mm:ss");

	// тянем из БД все сообщения для пользователя и в общий чат за последние 30 дней
	db.messages.find({ 
		$or: [
			{reciver: { $in: ['shared', ws.user_id] }},
			{sender: ws.user_id}
		],
		date: { $gte: date_ago }
	}).sort({ date: 1 }).limit(100).exec(function (err, docs) {
		// отправляем их пользователю
		if( err ) 
			return console.log("messages error: ",err);
		if( !docs ) 
			return console.log("messages not found");
		res.send(docs);
		// docs.reverse().forEach(function(msg){
		// 	ws.send(JSON.stringify(msg));
		// });

		// // после отправки истории, запускаем механизм 
		// // подсчета и отображения бейджиков
		// var data = {
		// 	emit: "chat/start"
		// };
		// ws.send(JSON.stringify(data));
	});



});


chat.on("insert",function(ws, req, res, json) {
	console.log("in chat->insert event: ", JSON.stringify(json));

	var db = req.app.nedb.db;

	json.id = uniq_id();
	json.date = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
	json.sender = ws.user_id;
	res.reply({ newid: json.id });
	// кидаем в базу данных
	db.messages.insert(json, function (err, newDoc) {
		// даже не представляю что делать 
		// если сообщения не сохраняются :)
	});		

	
	// рассылаем принятое сообщение всем кому оно адресованно
	res.broadcast(json);
});

chat.on("update",function(ws, req, res, json) {
	console.log("in chat->update event: ", JSON.stringify(json));

	var db = req.app.nedb.db;

});

chat.on("delete",function(ws, req, res, json) {
	console.log("in chat->delete event: ", JSON.stringify(json));
    var db = req.app.nedb.db;

});

module.exports = chat;

