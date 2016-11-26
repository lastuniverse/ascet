"use strict";


const uniq_id = require('../modules/express_uniq_id');
const EventEmitter = require('events');
const util = require('util');

var app;
var url;

var res_methods = {
	"get":"init",
	"post":"insert",
	"insert": "insert",
	"put":"update",
	"update":"update",
	"delete":"delete"
};


function send(ws, collection, method, data) {
	var json = {
		collection: collection,
		method: method,
		data: data
	};
	try{
		//console.log('express-like-firebase.js send: ', JSON.stringify(data));
		ws.send(JSON.stringify(json));
	}catch(err){
		//console.log('express-like-firebase.js send error: ', err);
	}
}

function broadcast(collection, method, data) {
	//console.log('express-like-firebase.js broadcasted: ', JSON.stringify(data));
    var ws = app.expressWs.getWss(url);
	var json = {
		collection: collection,
		method: method,
		data: data
	};
    ws.clients.forEach(function (client) {
      try{
		client.send(JSON.stringify(json));
		//console.log('express-like-firebase.js broadcasted: ...');
      }catch(err){
        //console.log('broadcasted: client closed: ', err);
      }
    });
}

// var online_users = {};

function init(opt){
	app = opt.app;
	url = opt.url;

	//console.log("express-like-firebase.js init()");

	function likeFirebase() {
		EventEmitter.call(this);
	}
	util.inherits(likeFirebase, EventEmitter);

	// сохраняем в объекте ссылку на app
	likeFirebase.app = app;

	// сохраняем в объекте значение url
	likeFirebase.prototype.url = url;

	// создаем в объекте хранилище для роутеров коллекций
	likeFirebase.routers = {};

	// функция для связывания вебсокета с созданным объектом
	likeFirebase.prototype.bind = function(ws, req) {

		// вызываем событие "connect" у всех подключенных роутеров
		//console.log("клиент подключился: ",ws.user_id);
		Object.keys(likeFirebase.routers).forEach(function(router){
			var res = {};
			res.send = function(data, method, collection){
				send(ws, collection||router, method||"connect", data);
			};
			res.broadcast = function(data, method, collection){
				broadcast(collection||router, method||"connect", data);
			};

			likeFirebase.routers[router].emit("connect", ws, req, res, {} );	
		});

		// вызываем событие "disconnect" у всех подключенных роутеров
		ws.on('close', function(data) {
			//console.log("клиент отключился: ",ws.user_id);
			Object.keys(likeFirebase.routers).forEach(function(router){
				var res = {};
				res.broadcast = function(data, method, collection){
					broadcast(collection||router, method||"disconnect", data);
				};

				likeFirebase.routers[router].emit("disconnect", ws, req, res, {} );	
			});
		});



		// лайтовый обработчик входящих пакетов
		ws.on('message', function(data) {
			//console.log("express-like-firebase.js get message: ", data);
			if( !data && typeof data != "string" )
				return false;

			var json = JSON.parse(data);

			if( !json.collection && !json.method && !res_methods[json.method] )
				return false;

			if( !likeFirebase.routers[json.collection] )
				return false;

			var isReply = false;

			var res = {};

			res.reply = function(data){
				isReply = true;
				send(ws, json.collection, json.unique, data);
			};
			res.send = function(data){
				send(ws, json.collection, res_methods[json.method], data);
				if(!isReply)				
					res.reply({});
			};
			res.broadcast = function(data){
				broadcast(json.collection, res_methods[json.method], data);
				if(!isReply)				
					res.reply({});
			};

			likeFirebase.routers[json.collection].emit(json.method, ws, req, res, json.data);

		});
	};

	// подключаем роутеры коллекций
	likeFirebase.prototype.route = function(collection,obj){
		likeFirebase.routers[collection] = obj; 
	};

	return new likeFirebase();

}



module.exports = init;

