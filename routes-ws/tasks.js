"use strict";
const moment = require('moment');
const uniq_id = require('../modules/express_uniq_id');

const EventEmitter = require('events');
const util = require('util');

function Tasks() {
  EventEmitter.call(this);
}
util.inherits(Tasks, EventEmitter);

var tasks = new Tasks();



tasks.on("get",function(ws, req, res, json) {
	console.log("in tasks->get event: ", JSON.stringify(json));

	var id = ws.user_id;
	var db = req.app.nedb.db;

	// обновляем или вставляем новую задачу в текущие задачи
	// тянем из БД все сообщения для пользователя и в общий чат за последние 30 дней
	db.tasks.find({ 
		$or: [
			{owner: id },
			{user: id },
			{users: { $regex: new RegExp(id) } }
		]
	}).sort({ end_date: 1 }).sort({ start_date: 1 }).exec(cb_find_tasks);

	// общий callback
	function cb_find_tasks(err, docs) {
		if( err ) return res.reply({ status:"error", message: "Не удалось найти запрошенные данные. ошибка: "+err });
		res.send(docs);
	}
});


tasks.on("insert",function(ws, req, res, json) {
	console.log("in tasks->insert event: ", JSON.stringify(json));

	var db = req.app.nedb.db;

	if ( json.owner && json.owner != req.session.user.id ) 
		return res.reply({ status: "error", message:"Опять хакеры?" });

	var id = json.id = json.id||uniq_id();

	// вставляем новую задачу
	json.owner = req.session.user.id;
	db.tasks.insert( json , cb_insert );

	// рассылаем принятое сообщение всем кому оно адресованно
	res.broadcast(json);

	// общий callback
	function cb_insert(err, newDoc) {
		if( err ) return res.reply({ status:"error", message: "Не удалось сохранить изменения. ошибка: "+err });
		res.reply({newid: id, status:"ok", message: "Задача успешно сохранена "});
	}
});

tasks.on("update",function(ws, req, res, json) {
	console.log("in tasks->update event: ", JSON.stringify(json));

	// var db = req.app.nedb.db;
	res.reply({});
});

tasks.on("delete",function(ws, req, res, json) {
	console.log("in tasks->delete event: ", JSON.stringify(json));
    // var db = req.app.nedb.db;
	res.reply({});
});

module.exports = tasks;

var task_data = {
	"disabled":"0",
	"id":"1461879209104006",
	"start_date":"2016-04-28 14:00",
	"end_date":"2016-04-30 16:00",
	"text":"Отвезти на ФЭС документы на поднаем.",
	"owner":"1460988819865001",
	"user":"admin",
	"users":"admin",
	"records":[
		{"file":{},"name":"IMG_20160210_150917.jpg","id":1461893354108,"size":907833,"sizetext":"886.56 Kb","type":"jpg","status":"server","percent":100,"progress":100,"sname":"72d08d499935fdc002d309fb85316c38"},
		{"file":{},"name":"IMG_20160210_150930.jpg","id":1461893354143,"size":852264,"sizetext":"832.29 Kb","type":"jpg","status":"server","percent":100,"progress":100,"sname":"c13cc650a18b797898282843d3fff3fb"}
	],
	messages: [
		{
			sender: "admin",
			text: "bla bla bla",
			last_date: "....",
			records: [],
			users: [
				{id: "admin", icon: "circle-o" }
			]
		}
	]
};


// 
// execute block ~ ~1 ~ 152 0 
// setblock 10 20 30 wool 
// execute 
// /setblock ~-1 ~-6 ~1 minecraft:redstone_block
// /setblock ~-1 ~-6 ~1 minecraft:obsidian
// /setblock ~2 ~29 ~-8 minecraft:redstone_block