const EventEmitter = require('events');
const util = require('util');

function Test() {
  EventEmitter.call(this);
}
util.inherits(Test, EventEmitter);

var test = new Test();


test.on("insert",function(ws, req, res, json) {
	console.log("in test->insert event: ", JSON.stringify(json));
	res.reply({});
});


test.on("get",function(ws, req, res, json) {
	console.log("in test->get event: ", JSON.stringify(json));
	res.reply({});
});

test.on("update",function(ws, req, res, json) {
	console.log("in test->update event: ", JSON.stringify(json));
	res.reply({});
});

test.on("delete",function(ws, req, res, json) {
	console.log("in test->delete event: ", JSON.stringify(json));
	res.reply({});
});

module.exports = test;

