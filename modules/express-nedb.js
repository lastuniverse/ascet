var nedb = require('nedb');
var path = require('path');
var fs   = require("fs");


function init(options){
	console.log("mod.nedb.js init()");
	var db_nedb = { 
		db: {},
		open: open,
		index: index,
		compact: compact
	};

	function open(name){
		if( !('path' in db_nedb) )
			return undefined;
		if( name in db_nedb.db )
			return db_nedb.db[name];
	 	db_nedb.db[name] = new nedb(path.join( db_nedb.path, name+'.'+db_nedb.ext));
	 	db_nedb.db[name].loadDatabase();
		return db_nedb.db[name];
	}

	function index(name,field){
		if( !('path' in db_nedb) )
			return undefined;
		if( !(name in db_nedb.db) )
			open(name);
		// Using a unique constraint with the index 
		db_nedb.db[name].ensureIndex({ fieldName: field , unique: true }, function (err) {
		});
	}

	function compact(name,interval){
		if( !('path' in db_nedb) )
			return undefined;
		if( !(name in db_nedb.db) )
			return undefined;
		// Using a unique constraint with the index 
		if(interval){
			db_nedb.db[name].persistence.setAutocompactionInterval(interval);
		}else{
			db_nedb.db[name].persistence.compactDatafile();
		}
	}

	if('path' in options){
		db_nedb.ext = options.ext||'db';
		db_nedb.path = options.path;
		var regExp = new RegExp( "\."+db_nedb.ext+"$" );
		var db_list = fs.readdirSync(db_nedb.path);
		db_list = db_list.filter(function(item) {
			return regExp.test(item);
		});
		db_list = db_list.map(function(item) {
		 	var cur = item.replace(regExp,"");
		 	db_nedb.db[cur] = new nedb(path.join( db_nedb.path, item));
		 	db_nedb.db[cur].loadDatabase();
		 	return cur;
		});
		//console.log("mod.nedb.js", db_nedb.path, db_list);
	}
	
	options.app.nedb = db_nedb;

	return function (req, res, next) {
		//req.app.nedb = db_nedb;
		next();
	};
}

module.exports = init;