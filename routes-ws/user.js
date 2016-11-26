"use strict";

const EventEmitter = require('events');
const util = require('util');

function User() {
  EventEmitter.call(this);
}
util.inherits(User, EventEmitter);

var user = new User();


user.on("get",function(ws, req, res, json) {
	console.log("in user->get event: ", JSON.stringify(json));
	res.send([{id: req.session.user.id }]);

});


module.exports = user;

