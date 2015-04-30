/*
Filter Server Script File
It listens to the request in-coming from gateway and logic server
Also sends notification the logic server for rule criteria meet trigger
*/

//var engine = require('./dbutility.js');
var http = require('http');
var io = require('socket.io');
var RuleEngine = require('node-rules');
var port = 7000;
var server = http.createServer(function(req, res){ 
    res.writeHead(200,{ 'Content-Type': 'text/html' }); 
    res.end('<h1>Hello Socket Lover!</h1>');
});

var mongoose = require('mongoose');
var db=mongoose.connect('mongodb://localhost/security', function (error) 
{
    if (error) 
    {
        console.log("mongo"+error);
    }
});






server.listen(port);
console.log('Filter Server Starting');

var socket = io.listen(server);
///////////////Global///////////////////////
var detailedInfo_app_global=[];
var detailedInfo_type_global=[];
var detailedInfo_location_global=[];
var count=0;
var resultLength=0;
////////////////////Shemas//////////////////////
var Schema = mongoose.Schema
/**1***/
var AppSensorLinks = new Schema({
    sensor_type: String,
    sensor_id: String,
    sensor_location:String,
    application_name: String,
    application_id: String,
    created_at: Date,
    updated_at: Date
   });
var appsensorModel = mongoose.model('appSensors', AppSensorLinks);
/**2**/
var userAppUserDetails = new Schema({
		    /*appId: String,
		    appUserId:String,*/
			userID:String,appID:String
		  });
		

var userAppUserModel = mongoose.model('RegApps', userAppUserDetails);

/**3**/
var Rules = new Schema({
   sensorId: String,
   requestId:String,
   appId:String,
   sensorType:String,
   Threshold: Number,
   operator: String,
   userId: String,
   registerTime: Date
});
   var RuleModel = mongoose.model('Rules', Rules);//model is the record


var Facts = new Schema({
   sensorId: String,
   sensordata: Number,
   recieveTime: Date
});

var FactModel = mongoose.model('Facts', Facts);

var userAppUserDetails = new Schema({
     appId: String,
     appuserId:String,
  });
   var users = new Schema({
     appuserId: String,
     emailId  : String
  });
//////////////////////////////////////////////

    socket.on('connection', function(client){ 
      console.log('Connection to client established');
      /*********
----------------------------------------------------QUERY BY APP-------------------------------------------------------------
	*******/


     
     client.on('QueryByApp',function(request)
	{ 

		QueryByApp(request,assignAppResult);
		
            	
       });
      //var fact = {'ID':'123','DateTime':'Tue Apr 14 2015 20:03:21 GMT+0530 (IST)','value':55}
      client.on('fact',function(request){
		console.log('got from gateway:'+request);
                processFact(request);
		setTimeout(function() {
                  console.log('notification generated'+globalNotification);
		  socket.emit('Notification',globalNotification);
                  //engine.clearGlobalNotification();
	     }, 500);
            
      });
	function myAppfunc(response)
	{
		count++;
		console.log("--------------count="+count);
		if(count==resultLength)
		{
			count=0;
			response["detailedInfo"]=detailedInfo_app_global;
			socket.emit('QueryByApp-resp',response);
			detailedInfo_app_global=[];
		}
	}

	function assignAppResult(response,result,myAppfunc)
	{
		
		resultLength=result.length;
		if(resultLength==0)
		{
			response["detailedInfo"]=[];
			socket.emit('QueryByApp-resp',response);
		}
		else
		{
			for(var i in result)
			{
								  
								  
					  
				var query = appsensorModel.find({});
				query.where('sensor_id',result[i]["sensor_id"]);
				console.log("outside result[i]['sensor_id']"+result[i]['sensor_id']);
				query.exec(function (err, result2)
				{
					console.log("****************"+result2.length+"************");
					if (!err)
					{
										//console.log(result2);
						for(var j=0;j<result2.length;j++)
						{
							console.log("hello");
							var temp = {};
							console.log("result2[i]['sensor_id']"+result2[j]['sensor_id']);
							temp["sensorId"] =  result2[j]['sensor_id'];
					  		temp["sensorValue"] = 12;
							//temp["sensorValue"] = sensorLatestData["sensorId"]
							temp["sensorType"] = result2[j]["sensor_type"];
							temp["sensorLocation"] = result2[j]["sensor_location"];
							detailedInfo_app_global.push(temp);

						}
										
		  			} 
									
					myAppfunc(response);
				});
							
			}
		}
		
	}

	function QueryByApp(request,assignAppResult)
	{
		console.log('Sensor Data By type Query is called'+request);

			var response = {};
			  response["appRequestType"] = "QueryByApp";
			  response["appId"] = request["appId"];
			  console.log(  response["appId"]);
			  response["appUserId"] = request["appUserId"];
			  //console.log('response till now:'+response);

			  
			  var query = appsensorModel.find({});
                        query.where('application_id',request["appId"]);
			query.exec(function (err, result)
			{
				if (!err)
				{
					//console.log("check if error="+err);
                                       //console.log('fetched data====='+result);
					console.log('fetched data.length====='+result.length);
					//constructQueryResultByApp(response,result);
				       
	  			}
				else
					console.log('Eror...............................')

				assignAppResult(response,result,myAppfunc);
			});
	}
/**
-----------------------------------------------------END OF QUERY BY APP----------------------------------------------------------
**/

/**
-----------------------------------------------------QUERY BY TYPE----------------------------------------------------------
**/	
	client.on('QueryByType',function(request)
	{ 

		QueryByType(request,assignTypeResult);
		
            	
       });
	
	function myTypefunc(response)
	{
		count++;
		console.log("--------------count="+count);
		if(count==resultLength)
		{
			count=0;
			response["detailedInfo"]=detailedInfo_type_global;
			socket.emit('QueryByType-resp',response);
			detailedInfo_type_global=[];
		}
	}

	function assignTypeResult(response,result,myTypefunc)
	{		
		resultLength=result.length;

		if(resultLength==0)
		{
			response["detailedInfo"]=[];
			socket.emit('QueryByApp-resp',response);
		}
		else
		{
			for(var i in result)
			{
				  
				  var query = appsensorModel.find({});
		                query.where('application_id',result[i]["appID"]);
				query.where('sensor_type',response["sensorType"]);
		               console.log('result[i]["appId"]:'+result[i]["appID"]);	
				query.exec(function (err, result2)
				{
					if (!err)
					{
						for(var j=0;j<result2.length;j++)
						{
						
							var temp = {};
							//console.log("came for:"+result2+":"+result2[0]["sensor_id"]);
							temp["sensorId"] = result2[j]["sensor_id"];
							temp["sensorValue"] = 12;
							//temp["sensorValue"] = sensorLatestData["sensorId"]
							temp["sensorLocation"] = result2[j]["sensor_location"];
							temp["appId"] = result2[j]["application_id"];
							detailedInfo_type_global.push(temp);
						}
		  			} 
				
								
					myTypefunc(response);
				});

	  		}
		}
	}

	function QueryByType(request,assignTypeResult)
	{

		
		  var response = {};
		  response["appRequestType"] = "QueryByType";
		  response["sensorType"] = request["sensorType"];
		  response["appUserId"] = request["appUserId"];
		  	 
		   
		  var query = userAppUserModel.find({}).select('appID');
                        query.where('userID',request["appUserId"]);
			query.exec(function (err, result)
			{
                                console.log('result of fetchQueryByType'+result);
				//constructQueryResultByType(response,result);
				assignTypeResult(response,result,myTypefunc);
			});


		
	}

			


/**
-----------------------------------------------------END OF QUERY BY TYPE----------------------------------------------------------
**/	
/**
-----------------------------------------------------QUERY BY LOCATION----------------------------------------------------------
**/

	client.on('QueryByLocation',function(request)
	{ 

		QueryByLocation(request,assignLocationResult);
		
            	
       });
	
	function myLocationfunc(response)
	{
		count++;
		console.log("--------------count="+count);
		if(count==resultLength)
		{
			count=0;
			response["detailedInfo"]=detailedInfo_location_global;
			socket.emit('QueryByLocation-resp',response);
			detailedInfo_location_global=[];
		}
	}

	function assignLocationResult(response,result,myLocationfunc)
	{		
		resultLength=result.length;

		if(resultLength==0)
		{
			response["detailedInfo"]=[];
			socket.emit('QueryByApp-resp',response);
		}
		else
		{
			for(var i in result)
			{
				  
				  var query = appsensorModel.find({});
		                query.where('application_id',result[i]["appID"]);
				query.where('sensor_location',response["sensorLocation"]);
		               console.log('result[i]["appId"]:'+result[i]["appID"]);	
				query.exec(function (err, result2)
				{
					if (!err)
					{
						for(var j=0;j<result2.length;j++)
						{
						
							var temp = {};
							//console.log("came for:"+result2+":"+result2[0]["sensor_id"]);
							temp["sensorId"] = result2[j]["sensor_id"];
							temp["sensorValue"] = 12;
							//temp["sensorValue"] = sensorLatestData["sensorId"]
							temp["sensorType"] = result2[j]["sensor_type"];
							temp["appId"] = result2[j]["application_id"];
							detailedInfo_location_global.push(temp);
						}
		  			} 
				
								
					myLocationfunc(response);
				});

	  		}
		}
	}

	function QueryByLocation(request,assignLocationResult)
	{

		
		  var response = {};
		  response["appRequestLocation"] = "QueryByLocation";
		  response["sensorLocation"] = request["sensorLocation"];
		  response["appUserId"] = request["appUserId"];
		  	 
		   
		  var query = userAppUserModel.find({}).select('appID');
                        query.where('userID',request["appUserId"]);
			query.exec(function (err, result)
			{
                                console.log('result of fetchQueryByLocation'+result);
				//constructQueryResultByLocation(response,result);
				assignLocationResult(response,result,myLocationfunc);
			});


		
	}

/**
-----------------------------------------------------END OF QUERY BY LOCATION----------------------------------------------------------
**/
});

var sensorLatestData={};
var sensorRulesEngineMap ={};
var sensorRuleCount = {};
var consequence = 0;
var notifyResponse = {};
function fetchRulesAtStart(){
var globalNotification = {}


   var RuleModel = mongoose.model('Rules', Rules);//model is the record
   var rules = {};
   var query = RuleModel.find({});
			query.exec(function (err, result){
				constructRuleFromDB(result);
			}); 
}
function engineinit(){
  fetchRulesAtStart();
}
engineinit();

function parseFact(rawFact){
	var parseFact = rawFact.substring(1,rawFact.length-1);
	var arr = parseFact.split(",");
	var fact = {};
	for(var i in arr){
  	var data = arr[i].split(":");
        var key;
	key = data[1];
	if(i==0){
		    fact["ID"] = key.substring(1,key.length-1);
	  }
	  if(i==2){
		    fact["value"] = key.substring(0,key.length);
	  }
	}
	return fact;
}

function constructFact(rawFact){
  var fact = {};
  fact["sensorId"] = rawFact["sensorId"];
  fact["sensorData"] = rawFact["value"];
  return fact;
}

function executeEngine(R,fact){
 R.execute(fact, function(data) {
    if (data.result) {
        console.log("Valid transaction");
    } else {

    }
 });
}

function processFact(rFact){
  var rawFact = parseFact(rFact);
  persistFact(rawFact);
  var sensorId = rawFact["ID"];
  sensorLatestData[sensorId] = rawFact["value"];
  var R = sensorRulesEngineMap[sensorId];
  var fact = constructFact(rawFact);
  if(sensorRuleCount[sensorId] > 0){
     localrulesCount = sensorRuleCount[sensorId];
     executeEngine(R,fact); 
  }else{
     console.log('No rules defined for this sensor, hence no execution');
   }
  localrulesCount = 0;
  //console.log('exiting fact creation');
}

function constructRuleFromDB(ruleTable){
  for (var i=0;i<ruleTable.length ;i++) {
     var sensorId = ruleTable[i]["sensorId"];
     var R = new RuleEngine();
     sensorRulesEngineMap[sensorId] = R;
     if(sensorRulesEngineMap[sensorId]===undefined){
        createNewRuleEngineInstance(sensorId);
     }
    registerRule(sensorRulesEngineMap[sensorId], ruleTable[i]);
  }
  console.log('Rules loading from database is complete, Number of rules ='+ruleTable.length);
}

function persistFact(rawFact){
  var FactModel = mongoose.model('Facts', Facts);//model is the record
  var record = new FactModel();
  var currentDate = new Date(); 
  var rawSensorId = rawFact["ID"].toString();
  record.sensorId = rawSensorId;
  record.sensordata = Number(rawFact["value"]);
  record.recieveTime = currentDate;
  record.save(function (err, data) {
		if(err){
			console.log("Error occured while Registering"+err);
		}
});
}

function registerRule(R,rawRule){
  var sensordata = rawRule["Threshold"];
  var operator = rawRule["operator"];
  var sensorId = rawRule["sensorId"];
  var user = rawRule["user"];
  var appId = rawRule["appId"];
  console.log('Registering rule:'+sensordata+'--'+operator+'--'+sensorId);
  sensorRuleCount[sensorId] = 0;
  var rule = constructNewRule(sensordata, operator,user,sensorId,appId);
  R.register(rule);
  //console.log('increamented for :'+sensorId);
  sensorRuleCount[sensorId] = sensorRuleCount[sensorId] + 1;
  console.log('rule count incremented for '+sensorId);
  //console.log('Count becomes:'+ sensorRuleCount[sensorId]);
  //console.log('rule:'+rule["condition"]+'--'+rule["consequence"]);
}

function constructNewRule(threshold, operator, user,sensorId, appId){ 
 var rule = {};
 rule["appId"] = appId;
 if(operator == "greater")
	 rule["condition"] =   function(R) {localrulesCount=localrulesCount-1; R.when(this.sensorData > threshold);};
 else if (operator == "lesser")	
         rule["condition"] =   function(R) {localrulesCount=localrulesCount-1;R.when(this.sensorData < threshold);};
 else if (operator == "greaterequal")	
         rule["condition"] =   function(R) {localrulesCount=localrulesCount-1;R.when(this.sensorData >= threshold);};
 else if (operator == "lesserequal")	
         rule["condition"] =   function(R) {localrulesCount=localrulesCount-1;R.when(this.sensorData <= threshold);};
 else if (operator == "equal")	
         rule["condition"] =   function(R) {localrulesCount=localrulesCount-1;R.when(this.sensorData == threshold);};
 rule["consequence"] = function(R) {
	 this.result = false; 
         if(consequence == 0)
           generateWrapForNotification(sensorId, threshold, this.sensorData,appId);
         consequence = consequence + 1;
         generateNotificationObject(appId,sensorRuleCount[sensorId]-localrulesCount);   
         console.log("Rule Criteria met, Now notify all users registered to "+appId);  
	 if(localrulesCount == 0)
           R.stop();
         else
            R.next();
 }
 return rule;
}

function generateWrapForNotification(sensorId, threshold, currentValue,appId){
    notifyResponse["appRequestType"] =  "Notification";  
    notifyResponse["appId"] = appId;    
    notifyResponse["Threshold"] = threshold;    
    notifyResponse["currentValue"] = currentValue;    
    notifyResponse["sensorId"] = sensorId;
    notifyResponse["detailedInfo"] = {};
    globalNotification = notifyResponse;
}

function generateNotificationObject(appId,i){
  
  console.log('appId:'+appId);
  var userAppUserModel = mongoose.model('UserAppUser', userAppUserDetails);
  var query = userAppUserModel.find({}).select({ "appuserId": 1 ,"_id": 0});
 	      query.where('appId',appId);
 	      query.exec(function (err,result){	
				var ids = result.map(function(doc) { return doc.appuserId; });
			        var userModel = mongoose.model('users', users);
                        	var query1 = userModel.find({}).select({ "appuserId": 1,"emailId":2,"_id": 0});
                        	query.where('appId',ids);
                                query1.exec(function (err,result1){
                      			globalNotification["detailedInfo"] = result1;
        		        });

   });
}
