var Datastore = require('nedb');

var db = {};
db.users = new Datastore('./data/users/users.db');
db.profile = new Datastore('./data/users/profile.db');
db.sessions = new Datastore('./data/users/sessions.db');

db.users.loadDatabase();
db.profile.loadDatabase();
db.sessions.loadDatabase();




var doc = { 
    login: 'admin',
    password: 'admin',
    admin: true
}
db.users.insert(doc, function (err, newDoc) { });

doc = { 
    login: 'user',
    password: 'user'
}
db.users.insert(doc, function (err, newDoc) { });


doc = { 
    login: 'admin',
    name: 'name',
    sname: 'sname',
    famaly: 'famaly',
    rank: 'rank',
};

db.profile.insert(doc, function (err, newDoc) {});

doc = { 
    login: 'user',
    name: 'name',
    sname: 'sname',
    famaly: 'famaly',
    rank: 'rank',
};

db.profile.insert(doc, function (err, newDoc) {});


doc = {};

db.sessions.insert(doc, function (err, newDoc) {});

