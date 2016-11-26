
// // создаем новый эмиттер событий
// var emitter = new my.libs.EventEmitter();

// // создать слушатель для события
// emitter.on('пицца', function(message){
//   console.log("1 "+message);
// });

// // создать слушатель для события
// emitter.on('пицца', function(message){
//   console.log("2 "+message);
// });
// // emit an event
// emitter.emit('пицца', 'пицца это невероятно вкусно');

(function (G, U){
    "use strict";
    G.my = G.my || {};
    var libs = G.my.libs||{};

    // тут храним ссылки на коллекции
    var collections = {};

    // тут храним подключение по websocket
    var ws;

    // если подключены, выставляем в true
    var isReady = false;
	// обработчики события onready
	var onready = new my.libs.EventEmitter();
	function ready (cb) {
		if( isReady ){
			//console.log("my.like.firebase.js. готов ");
			cb();
		}else{
			//console.log("my.like.firebase.js. еще не готов ");
			onready.once("ready",cb);
		}
	}    

    // параметры инициализации
    var options = {
    	url: my.host.ws+"likefb",
    	timeout: 5000,
    	cb: function(){}
    };

    // функция инициализации
    function connect(opt, cb ){
    	opt=opt||{};
    	options.url = opt.url||options.url;
    	options.timeout = opt.timeout||options.timeout;
    	options.cb = cb||options.cb;
    	options.collections = opt.collections||[];

	    console.log('my.like.firebase.js. Подключаюсь к серверу '+options.url);
	    ws = new WebSocket(options.url);
	    ws.onopen = onopen;
	    ws.onmessage = onmessage;
	    ws.onerror = onerror;
	    ws.onclose = onclose;
    }

	function onclose(event){
		isReady = false;
        if (event.wasClean)
            console.log('my.like.firebase.js. Соединение закрыто чисто');
        else
            console.log('my.like.firebase.js. Обрыв соединения');
        console.log('my.like.firebase.js. Код: ' + event.code + ' причина: ' + event.reason);
        setTimeout(function(){ connect(); }, options.timeout);
    }

	function onopen() {
	    console.log("my.like.firebase.js. Соединение c "+options.url+" установлено.");


	

		function loadcollection(name) {
			return new Promise(function(resolve, reject) {
				collection(name).init({},function(data){
					if( data.status == "error"){
						console.log("LOAD error: ", name);
						reject(data);
					}else{
						console.log("LOAD ok: ", name);
						resolve(data);						
					}
				});
			});
		}

	    var loaded = [];
		options.collections.forEach(function(name){
			console.log("LOAD: ", name);
			loaded.push(loadcollection(name));
		});

		Promise.all(loaded)
		.then(results => {
			console.log("LOADED all: ", results);
		    options.cb(ws);
		    isReady = true;
		    onready.emit("ready");
		});
	}

	function onerror(error) {
	    console.log("my.like.firebase.js. Ошибка " + error.message);
	}

	function onmessage(event) {
	    //console.log("my.like.firebase.js. Получены данные " + event.data);

			if( !event.data && typeof event.data != "string" )
				return false;

			var json = JSON.parse(event.data);

			if( !json.collection && !json.data && !json.method)
				return false;

			if( !collections[json.collection] )
				return false;

			if( collections[json.collection].init ){
				collections[json.collection].emit(json.method, json.data);
			}else if( json.method == "init" ){
				collections[json.collection].emit(json.method, json.data);
			}
			// {
			// 	collection: "",
			// 	method: "",
			// 	data: {}
			// }	    
	}

	// обобщенная функция отправки запроса в коллекцию
	function send(name, method, data, cb){
		//console.log("my.like.firebase.js. отправляепм запрос "+method+" в коллекцию "+name);

		var unique = G.my.libs.unique();
		// если задан callback формируем обработчик события, ожидающий ответ на запрос
	    if(cb){
			collections[name].once(unique,cb);
		}

		// формируем инициализационный запрос
	    var json = {
	        collection: name,
	        method: method,
	        unique: unique,
	        data: data||{}
	    };
	    // и отправляем его серверу
	    ws.send(JSON.stringify(json), {mask: true});
	}


	// функция получения объекта для общения с коллекцией
	function collection (name) {
		//console.log("my.like.firebase.js. инициализируем коллекцию "+name);


		// если данная коллекция уже существует, возвращаем ее
		if( collections[name] )
			return collections[name];


		// иначе создаем ее
		var ret = new my.libs.EventEmitter();
		ret.data = [];
		ret.hash = {};

		ret.isInit = false;
		// создаем в объекте коллекции функцию реинициализации		
		ret.emitinit = function(){
			if( ret.isInit )
				collections[name].emit("init", ret.data);
		};

		ret.init = function(data, cb){
			//console.log("my.like.firebase.js. отправлен запрос на инициализацию: ",data)
			send(name, "get", data, cb );
		};

		// создаем в объекте коллекции функцию реинициализации		
		ret.insert = function(data, cb){
			//console.log("my.like.firebase.js. отправлен запрос на добавление: ",data)
			send(name, "insert", data, cb);
		};

		// создаем в объекте коллекции функцию обновления
		ret.update = function(data, cb){
			//console.log("my.like.firebase.js. отправлен запрос на обновление: ",data)
			send(name, "update", data, cb);
		};

		// создаем в объекте коллекции функцию удаления
		ret.delete = function(data, cb){
			//console.log("my.like.firebase.js. отправлен запрос на удаление: ",data)
			send(name, "delete", data, cb);
		};

		// создаем в объекте коллекции функцию с произвольным методом
		ret.custom = function(custom, data, cb){
			//console.log("my.like.firebase.js. отправлен запрос на удаление: ",data)
			send(name, custom, data, cb);
		};		


		function delete_item(item){
			for(var i=0; i<ret.data.length; i++){
				if(ret.data[i].id == item.id)
					ret.data.splice(i,1);
			}
			if(item.id)
				delete ret.hash[item.id];
		}
		function update_item(item){
			for(var i=0; i<ret.data.length; i++){
				if(ret.data[i].id == item.id)
					ret.data[i] = item;
			}
			if(item.id)
				ret.hash[item.id] = item;
		}
		function insert_item(item){
			ret.data.push(item);
			if(item.id)
				ret.hash[item.id] = item;
		}
		function init_items(items){
			ret.data = items;
			items.forEach(function(item){
				if(item.id)
					ret.hash[item.id] = item;
			});
		}		

		// добавляем в нее обработчик события init
		ret.once("init",function(data) {
			//console.log("my.like.firebase.js. коллекция "+name+" получила инициализационные данные");
			init_items(data);
			ret.isInit = true;
		});
		// добавляем в нее обработчик события init
		ret.on("insert",function(data) {
			//console.log("my.like.firebase.js. коллекция "+name+" получила новый элемент");
			insert_item(data);
		});
		// добавляем в нее обработчик события init
		ret.on("update",function(data) {
			//console.log("my.like.firebase.js. коллекция "+name+" получила данные для обновления существующего элемента");
			update_item(data);
		});
		// добавляем в нее обработчик события init
		ret.on("delete",function(data) {
			//console.log("my.like.firebase.js. коллекция "+name+" получила данные для удаления существующего элемента");
			delete_item(data);
		});


		// оправляем запрос на инициализацию
		//ret.init();

		
	    // запихиваем новую коллекцию в хранилище
		collections[name] = ret;
		// и возвращаем ссылку на нее
		return collections[name];
	}


	// создаем объект для размещения в глобальном пространстве имен
	var likeFirebase = {
		connect: connect,
		collection: collection,
		options: options,
		ready: ready
	};

	libs.likeFirebase = likeFirebase;


	// сохраняем в глобальное пространство имен
    G.my.libs = libs;

}(this, undefined));



