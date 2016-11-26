(function (G, U){
    "use strict";
    G.my = G.my || {};
    var host = G.my.host||{};

	var get_host = function(){
		if( location.origin.match(/^file/))
		{
			host.http = "http://127.0.0.1:3000/";
			host.ws = "ws://127.0.0.1:3000/";
		}

		else
		{
			host.http = location.origin+"/";
			host.ws = location.origin;
			host.ws = host.ws.replace(/^http/, 'ws');
			host.ws = host.ws.replace(/^https/, 'wss');
			host.ws += "/";
		}
	};
	get_host();

    G.my.host = host;

}(this, undefined));


(function (G, U){
    "use strict";
    G.my = G.my || {};
    var libs = G.my.libs||{};

	var id_num = 0;

	function unique(ext_id){
		ext_id = ext_id||"";
		id_num++;
		var date = new Date();
		var id = date.getTime();
		var plus = ''+id_num;
		var len = plus.length;
		for(var i=len;i<3;i++){
			plus='0'+plus;
		}
		return ext_id+id+plus;
	}

	libs.unique = unique;

    G.my.libs = libs;

}(this, undefined));


//console.log("http host: "+my.host.http);
//console.log("ws host: "+my.host.ws);
