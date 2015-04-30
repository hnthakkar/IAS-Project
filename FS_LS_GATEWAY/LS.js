var express = require('express');
var app = express();
//var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var nodemailer = require('nodemailer');///////////////////
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'html');
//app.engine('html', require('ejs').renderFile);
//app.use(express.static(__dirname + '/public'));

//app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.urlencoded({extended:true})); // to support URL-encoded bodies
app.use(bodyParser.json()); // to support JSON-encoded bodies

app.listen(3000);

var io = require('socket.io-client');
var socket_rep = io.connect('http://127.0.0.1:6969');
var socket_FS = io.connect('http://127.0.0.1:7000');

var sess;
var global;
	app.get('/index', function(req, res)
	{
		
		res.render("index");
	});

	app.get('/', function(req, res)
	{
		res.render('logincss');
	});

	app.get('/registration', function(req, res)
	{
		res.render('Register');
	});

	app.get('/QueryByAppLink', function(req, res)
	{
		sess.app=req.param("name");
		res.render('QueryByAppLinks');
	});

	app.get('/QueryByTypeLink', function(req, res)
	{
		console.log("/QueryByTypeLink");
		sess.sensorType=req.param("name");
		res.render('QueryByTypeLinks');
	});

	app.get('/QueryByLocationLink', function(req, res)
	{
		console.log("/QueryByLocationLink");
		sess.sensorLocation=req.param("name");
		res.render('QueryByLocationLinks');
	});
	app.get('/setRulesLink', function(req, res)
	{
		sess.app=req.param("name");
		res.render('setRulesLinks');
	});
	
	app.post('/QueryByAppLinkSelect', function(req, res)
	{
		socket_FS = io.connect('http://127.0.0.1:7000',{'forceNew':true });
		var request={"appId":sess.app,"appUserId" : sess.username};
 
		socket_FS.emit("QueryByApp",request);
		socket_FS.on('QueryByApp-resp',function(data)
		{
				global=data;
				/*var a="";
				console.log(data.appUserId);
				
				for(var i=0;i<data.detailedInfo.length;i++)
				{
					console.log(data.detailedInfo[i].sensorId);
				}*/
				
				
   		});
		res.send(global);
		console.log("global="+global);
	});

	app.post('/setRulesLinkSelect', function(req, res)
	{
		socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
		var request={"appId":sess.app,"appUserId" : sess.username};
 
		socket_rep.emit("setRulesDisplay",request);
		socket_rep.on('setRulesDisplay-resp',function(data)
		{
				res.send(data);
				
   		});
		
	});

	app.post('/QueryByTypeLinkSelect', function(req, res)
	{
		console.log("/QueryByTypeLinkSelect");
		socket_FS = io.connect('http://127.0.0.1:7000',{'forceNew':true });
		var request={"sensorType":sess.sensorType,"appUserId" : sess.username};
 
		socket_FS.emit("QueryByType",request);
		socket_FS.on('QueryByType-resp',function(data)
		{
				global=data;
				/*var a="";
				console.log(data.appUserId);
				
				for(var i=0;i<data.detailedInfo.length;i++)
				{
					console.log(data.detailedInfo[i].sensorId);
				}*/
				
				
   		});
		res.send(global);
		console.log("global="+global);
	});

	app.post('/QueryByLocationLinkSelect', function(req, res)
	{
		console.log("inside QueryByLocationLinkSelect");
		socket_FS = io.connect('http://127.0.0.1:7000',{'forceNew':true });
		var request={"sensorLocation":sess.sensorLocation,"appUserId" : sess.username};
 
		socket_FS.emit("QueryByLocation",request);
		socket_FS.on('QueryByLocation-resp',function(data)
		{
				global=data;
				/*var a="";
				console.log(data.appUserId);
				
				for(var i=0;i<data.detailedInfo.length;i++)
				{
					console.log(data.detailedInfo[i].sensorId);
				}*/
				
				
   		});
		res.send(global);
		console.log("inside QueryByLocationLinkSelect="+global);
	});

	app.post('/QueryByApp', function(req, res)
	{
			console.log("session"+sess.username);
			socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
			socket_rep.emit("QueryByApp",sess.username);
		 	socket_rep.on('QueryByApp-resp',function(data)
			{
				var a="";
				data.forEach(function(entry) 
					{
						n=entry.appID;
						console.log(entry.userID);
						a=a+'<a href="/QueryByAppLink?name='+n+'">'+n+'</a><br/>';
		    				
					
					});
      				console.log("Received data from rep="+data);
				//res.setHeader('Content-Type', 'text/html');
				
				res.send(a);
				//console.log(a);
   		 	});
			var obj = {};
			//console.log('body: ' + JSON.stringify(req.body));
			 
			//res.render('QueryByApp');
	});

	app.post('/setRules', function(req, res)
	{
			console.log("session"+sess.username);
			socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
			socket_rep.emit("QueryByApp",sess.username);
		 	socket_rep.on('QueryByApp-resp',function(data)
			{
				var a="";
				data.forEach(function(entry) 
					{
						n=entry.appID;
						console.log(entry.userID);
						a=a+'<a href="/setRulesLink?name='+n+'">'+n+'</a><br/>';
		    				
					
					});
      				//console.log('Received a message from the server!',data);
				//res.setHeader('Content-Type', 'text/html');
				
				res.send(a);
				//console.log(a);
   		 	});
			var obj = {};
			//console.log('body: ' + JSON.stringify(req.body));
			 
			//res.render('QueryByApp');
	});

	
	app.post('/setRulesinsert', function(req, res)
	{
			console.log("inside setRulesInsert sess.app"+sess.app);
			console.log("req="+req);
			console.log("req.threshold="+req.param("threshold"));
			console.log("req.threshold="+req.param("operator"));
			

			request={ "appRequestType": "setRule", 
					  "requestId" : "12345" ,  
					  "appId":sess.app,
					"Threshold":req.param("threshold"),
					 "operator":req.param("operator")
				};
			/*socket_FS = io.connect('http://127.0.0.1:7000',{'forceNew':true });
			socket_FS.emit("setRule",request);

		 	socket_FS.on('setRule-resp',function(data)
			{
				
				res.send("Rules Added Successfully");
   		 	});*/
			res.send("Rules Added Successfully");			
	});
	

	app.post('/QueryByType', function(req, res)
	{
			console.log("session"+sess.username);
			socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
			socket_rep.emit("QueryByType",sess.username);
		 	socket_rep.on('QueryByType-resp',function(data)
			{
				var a="";
				data.forEach(function(entry) 
					{
						n=entry.sensor_type;
						console.log(entry.sensor_type);
						a=a+'<a href="/QueryByTypeLink?name='+n+'">'+n+'</a><br/>';
		    				
					
					});
      				//console.log('Received a message from the server!',data);
				//res.setHeader('Content-Type', 'text/html');
				
				res.send(a);
				//console.log(a);
   		 	});
			var obj = {};
			//console.log('body: ' + JSON.stringify(req.body));
			 
			//res.render('QueryByApp');
	});

	app.post('/QueryByLocation', function(req, res)
	{
			console.log("session"+sess.username);
			socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
			socket_rep.emit("QueryByLocation",sess.username);
		 	socket_rep.on('QueryByLocation-resp',function(data)
			{
				var a="";
				data.forEach(function(entry) 
					{
						n=entry.location;
						console.log(entry.location);
						a=a+'<a href="/QueryByLocationLink?name='+n+'">'+n+'</a><br/>';
		    				
					
					});
      				//console.log('Received a message from the server!',data);
				//res.setHeader('Content-Type', 'text/html');
				
				res.send(a);
				//console.log(a);
   		 	});
			var obj = {};
			//console.log('body: ' + JSON.stringify(req.body));
			 
			//res.render('QueryByApp');
	});

	
	
	//socket_rep.on('connect',function()
	//{
		
 		app.post('/login', function(req, res)
		{
			socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
			sess=req.session;
			sess.username=req.body.uname;
			//var n=req.body.uname;
     			socket_rep.emit("login",req.body);
		 	socket_rep.on('login-resp',function(data)
			{
      				console.log('Received a message from the server!',data);
				res.setHeader('Content-Type', 'text/html');
				if(data==null)
					res.end("Not Registered user");
				else
					res.render("index");
					//res.end("Welcome" + data.name +"!!");
   		 	});
			
		});

		app.post('/register', function(req, res)
		{
			socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
			//var n=req.body.uname;
     			socket_rep.emit("register",req.body);
		 	socket_rep.on('register-resp',function(data)
			{
      				console.log('Received a message from the server!',data);
				res.setHeader('Content-Type', 'text/html');
				//res.end("Not Registered user");
				
				res.render("logincss");
   		 	});
			

		});

		app.post('/notify', function(req, res)
		{
			
			socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
			socket_rep.emit("displayNotification",sess.username);
			socket_rep.on('displayNotification-resp',function(data)
			{
					console.log("inside notify="+data);
					res.send(data);
					
				
	   		});
			
			
		});

		socket_rep.on('disconnect',function() 
		{
		      		console.log('The client has disconnected!');
		      		//socket_rep.destroy();
		});
	//});
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
 		socket_FS.on('Notification',function(data)
			{
				socket_rep = io.connect('http://127.0.0.1:6969',{'forceNew':true });
				//var n=req.body.uname;
                                console.log('Notification recoeved:'+data);

                                console.log('detailedInfo se List of users:'+data["detailedInfo"][0]["emailId"]);
                                 
	     			socket_rep.emit("insertNotification",data);
			 	socket_rep.on('insertNotification-resp',function(result)
				{
	      				console.log(result);
	   		 	});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                console.log('data:'+data);
                                var emailId = 'avinashc@gmail.com';
var msg='';
				//var emailId=data.detailedInfo[0].emailId;
      				/*var msg="Dear "+data.detailedInfo[0].appUserId+"\n"+"Below Sensor has meet its threshold limit :"+"\n"+"sensorId:"+data.sensorId+"\n"+"sensorType:"+data.sensorType+"\n"+"Threshold:"+data.Threshold+"\n"+"currentValue"+data.currentValue+"\n";*/
			

				//var nodemailer = require('nodemailer');

				// create reusable transporter object using SMTP transport
				/*var transporter = nodemailer.createTransport({
				    service: 'Gmail',
					auth: {
					user: 'iot.warning@gmail.com',
					pass: 'iotwarning'
				    }
				});*/

				// NB! No need to recreate the transporter object. You can use
				// the same transporter object for all e-mails

				// setup e-mail data with unicode symbols
				var mailOptions = {
				   from: 'iot.warning@gmail.com',
				    to: emailId,
				    subject: 'Warning:Sensor data has reached Threshold limit',
				    text: msg
				};

				// send mail with defined transport object
				/*transporter.sendMail(mailOptions, function(error, info){
				    if(error){
					console.log(error);
				    }else{
					console.log('Message sent: ' + info.response);
				    }
				});*/



				//console.log(a);
   		 	});
			
    	


////////////////////////////////////////////////////////////////////////////////////////////////////////
	/*socket_FS.on('connect',function()
	{
		
		var rawRule={ 
			  "appRequestType":"setRule", 
			  "requestId" : "12345" , 
			  "appId":"app1",
			"sensorType":"temperatureSensor",
			"Threshold":"12",
			 "operator":"greater"    
		};

		socket_FS.emit("newRule",rawRule);
		
	});

	socket_FS.on('disconnect',function() 
	{
		console.log('The client has disconnected!');
		socket_FS.destroy();
	});
	 // Sends a message to the server via sockets
    function sendMessageToServer(message) {
      socket_rep.send(message);
    };
*/
//});

    

   
