/*
	likeFirebase proxy for Webix
	Allows to use likefb urls in all places where normal http urls can be used
*/

my.libs.likeFirebase.connect({collections:["users","user","chat","tasks"]}, function(ws) {
	webix.likefb = my.libs.likeFirebase; 

	my.data = {};
	my.data.users = webix.likefb.collection("users");
	my.data.user = webix.likefb.collection("user");
	my.data.chat = webix.likefb.collection("chat");
	my.data.tasks = webix.likefb.collection("tasks");

	my.proxy = {};

	my.proxy.users = webix.proxy("likefb", my.data.users);
	my.proxy.user = webix.proxy("likefb", my.data.user);
	my.proxy.chat = webix.proxy("likefb", my.data.chat);
	my.proxy.tasks = webix.proxy("likefb", my.data.tasks);

	my.libs.ws = ws;

	my.components = {};

});

my.sounds = {};
my.sounds.getmessage = soundAPI('/sounds/getmessage.mp3');
my.sounds.sendmessage = soundAPI('/sounds/sendmessage.mp3');



webix.proxy.likefb = {
	$proxy:true,
	/*
	some.load("likefb->ref");
	or
	some.load( webix.proxy("likefb", reference) )
	or
	url:"likefb->ref"
	*/
	load:function(view, callback){
		var isInit = false;
		//decode string reference if necessary
		if (typeof this.source == "object")
			this.collection = this.source;
		else
			this.collection = this.collection || webix.likefb.collection(this.source);

		//full data loading - do only once, during first loading
		this.collection.once("init", function(data){
			var source = data;
			webix.ajax.$callback(view, callback, "", source, -1);
			isInit = true;
		});
		this.collection.emitinit();

		//after initial data loading, set listeners for changes
		//data in likefb updated
		this.collection.on("update", function(data){
			//event triggered by data saving in the same component
			if (view.likefb_saving) return;

			// выходим если еще не прошло событие init
			if ( !isInit ) return;

			//do not trigger data saving events
			webix.dp(view).ignore(function(){
				view.updateItem(data.id, data);
			});
		});

		//data in likefb added
		this.collection.on("insert", function(data){
			//event can be triggered while initial data loading - ignoring
			if (view.waitData.state == "pending") return;
		
			//event triggered by data saving in the same component
			if (view.likefb_saving) return;

			// выходим если еще не прошло событие init
			if ( !isInit ) return;

			//do not trigger data saving events
			webix.dp(view).ignore(function(){
				if( view.getItem(data.id) )
					view.updateItem(data.id, data);
				else
					view.add(data);
			});
		});

		//data in likefb removed
		this.collection.on("delete", function(data){
			//event triggered by data saving in the same component
			if (view.likefb_saving) return;

			// выходим если еще не прошло событие init
			if ( !isInit ) return;

			//do not trigger data saving events
			webix.dp(view).ignore(function(){
				view.remove(data.id);
			});
		});

	},
	/*
	save:"likefb->ref"
	*/
	save:function(view, obj, dp, callback){
		//decode string reference if necessary
		if (typeof this.source == "object")
			this.collection = this.source;
		else
			this.collection = this.collection || webix.likefb.collection(this.source);

		//flag to prevent triggering of onchange listeners on the same component
		view.likefb_saving = true;

		if (obj.operation == "update"){
			//data changed
			this.collection.update(obj.data, function(reply){
				if (reply.status == "error" ){
					callback.error("", null, reply.message);
					webix.message({ type:"error", expire:10000, text:reply.message });
				}
				else{
					callback.success("", {}, -1);
				}

			});

		} else if (obj.operation == "insert"){
			//data inserted
			id = obj.data.id;
			delete obj.data.id;
			this.collection.insert(obj.data, function(reply){
				if (reply.status == "error" ){
					//console.log("REPLY ERROR: ", JSON.stringify(reply));
				 	callback.error("", null, reply.error);
				 	view.remove(id);
				 	webix.message({ type:"error", expire:10000, text:reply.message });
				}
				else{
					//console.log("REPLY OK: ", JSON.stringify(reply));
				 	callback.success("", { newid: reply.newid }, -1);
				}
				
			});
			
		} else if (obj.operation == "delete"){
			//data deleted
			this.collection.delete(obj.data, function(reply){
				if (reply.status == "error" ){
					callback.error("", null, reply.message);
					webix.message({ type:"error", expire:10000, text:reply.message });
				}
				else{
					callback.success("", {}, -1);
				}
			});
		}

		view.likefb_saving = false;
	}
};



/*
	Helper for component.sync(reference)
*/

webix.attachEvent("onSyncUnknown", function(target, source){
	if( source instanceof my.libs.likeFirebase ){
		//console.log("instanceof OK ", source);
	}else{
		//console.log("instanceof ERROR ", source);
	}

	if (window.my.libs.likeFirebase && source instanceof my.libs.likeFirebase){

		var proxy = webix.proxy("likefb", source);

		//due to some limitations in Webix 2.2 we can't use above proxy with DataStore directly
		//so will create intermediate data collection and use syn like
		//likefb -> data collection -> target view
		var data = new webix.DataCollection({
			url:proxy,
			save:proxy
		});

		target.sync(data);
	}
});



