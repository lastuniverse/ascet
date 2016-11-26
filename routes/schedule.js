var express = require('express');
var uniq_id = require('../modules/express_uniq_id');

var router = express.Router();

/* GET users listing. */
router.get('/views/current/:id', function(req, res, next) {
	var id = req.params.id;
	console.log("in GET /schedule/views/current/"+id);
	res.render('schedules/current',{params:{id:id}});
	//res.send('respond with a resource');
});

router.get('/views/:id', function(req, res, next) {
	var id = req.params.id;
	console.log("in GET /schedule/views/"+id);
	res.render('schedules/'+id, {params:{id:false}});
	//res.send('respond with a resource');
});


/*************************************************************************************/
router.get('/data/combo', function(req, res, next) {
	console.log("in GET /schedule/data/combo");
	var db = req.app.nedb.db;
	db.schedule.find({ }, function (err, schedules) {
		//var first_date = "2000-01-01 00:00";
		schedules = schedules
		.map(function (schedule) {
			var list = {
				id: schedule.id,
				value: schedule.name
			};
			return list;
		})
		.sort(function (b, a) {
		  if (a.name > b.name) return 1;
		  if (a.name < b.name) return -1;
		  return 0;
		});

		res.json(schedules);
	});
});



/*************************************************************************************/
router.all('/data/standart', function(req, res, next) {
	console.log("in ALL /schedule/data/standart");
	console.log("data: ", req.body);
	res.send({});
});

/*************************************************************************************/
router.get('/data/list', function(req, res, next) {
	console.log("in GET /schedule/data/list");
	var db = req.app.nedb.db;
	db.schedule.find({}, function (err, schedule) {
	 	if( err || !schedule ){
	 		return res.send({ status:"error" });
	 	}
		schedule = schedule.sort(function (a, b) {
		  if (a.name > b.name) return 1;
		  if (a.name < b.name) return -1;
		  return 0;
		});
		res.json(schedule);
	});
});

router.get('/data/list/:id', function(req, res, next) {
	var id = req.params.id;
	console.log("in GET /schedule/data/list/"+id);
	var db = req.app.nedb.db;
	db.schedule.findOne({id: id}, function (err, schedule) {
	 	if( err || !schedule ){
	 		return res.send({ status:"error" });
	 	}
		res.json(schedule);
	});
});

router.post('/data/list', function(req, res){
	console.log("in POST /schedule/data/list");
	var db = req.app.nedb.db;
	req.body.id = uniq_id();

	var schedule = {
		id: req.body.id,
		name: req.body.name,
		schedule: []
	};

	db.schedule.insert(schedule, function (err, newDoc) {
		if( err )
			return res.send({ status:"error" });
		res.send({ newid:req.body.id });
	});
});


router.put('/data/list/:id', function(req, res){
	console.log("in PUT /schedule/data/list");
	var db = req.app.nedb.db;
	var id = req.params.id;

	db.schedule.findOne({ id: id }, function (err, schedule) {
	 	if( err || !schedule )
	 		return res.send({ status:"error" });

	 	schedule.name  = req.body.name;
	 	schedule.start_date = req.body.start_date;

		db.schedule.update({ "id": id }, schedule , {}, function (err, numReplaced) {
			if (err)
				return res.send({ status:"error" });
			res.send({});
		});

	});

});

router.delete('/data/list/:id', function(req, res){
    console.log("in DELETE /schedule/data/list");
    var db = req.app.nedb.db;
    var id = req.params.id;

	db.schedule.remove({ id: id }, {}, function (err, numRemoved) {
		if (err)
			return res.send({ status:"error" });
		res.send({});
	});

});













/*************************************************************************************/
router.get('/data/task/:id', function(req, res, next) {
	console.log("in GET /schedule/data/task");
	var db = req.app.nedb.db;
	var id = req.params.id;

	db.schedule.findOne({ id: id }, function (err, schedule) {
	 	if( err || !schedule ){
	 		return res.send({ status:"error" });
	 	}
		schedule.schedule = schedule.schedule.sort(function (a, b) {
			if (a.start_date > b.start_date) return 1;
			if (a.start_date < b.start_date) return -1;
			return 0;
		});
		//console.log("schedule: ", JSON.stringify(schedule.schedule,0," ") );
		res.json(schedule.schedule);

	});

});


router.post('/data/task', function(req, res){
	console.log("in POST /schedule/data/task");
	var db = req.app.nedb.db;
	req.body.id = uniq_id();
	// console.log("data: ", req.body);
	var sid = req.body.sid;

	db.schedule.findOne({ id: sid }, function (err, schedule) {
	 	if( err || !schedule )
	 		return res.send({ status:"error" });

		schedule.schedule.push(req.body);
	 	//console.log("schedule: ", schedule);

		db.schedule.update({ "id": sid }, schedule , {}, function (err, numReplaced) {
			if (err)
				return res.send({ status:"error" });
			res.send({ newid:req.body.id });
		});

	});

});

router.put('/data/task/:id', function(req, res){
	console.log("in PUT /schedule/data/task");
	var db = req.app.nedb.db;
	//var id = req.params.id;
	var id = req.body.id;
	console.log("id: "+id);
	var sid = req.body.sid;

	db.schedule.findOne({ id: sid }, function (err, schedule) {
	 	if( err || !schedule )
	 		return res.send({ status:"error" });

	 	var task;
	 	schedule.schedule = schedule.schedule.map(function(item){
	 		if( item.id == id ){
	 			item = req.body;
	 		}
	 		return item;
	 	});

		db.schedule.update({ "id": sid }, schedule , {}, function (err, numReplaced) {
			if (err)
				return res.send({ status:"error" });
			res.send({});
		});

	});

});



router.delete('/data/task/:id', function (req, res){
    console.log("in DELETE /schedule/data/task");
    var db = req.app.nedb.db;
    var id = req.params.id;
    var sid = req.body.sid;
    console.log("id: ",id);
    console.log("sid: ",sid);

	db.schedule.findOne({ id: sid }, function(err, schedule) {
	 	if( err || !schedule )
	 		return res.send({ status:"error" });

	 	var task;
	 	schedule.schedule = schedule.schedule.filter(function(item) {
	 		if( item.id == id )
	 			return false;
	 		return true;
		});

		db.schedule.update({ "id": sid }, schedule , {}, function (err, numReplaced) {
			if (err)
				return res.send({ status:"error" });
			res.send({});
		});

	});
});


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