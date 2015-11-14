var express = require('express');
var userdata = express.Router();
var Cloudant = require('cloudant');

var me = 'e524f5c9-68e4-4329-b70e-24c4a62216f1-bluemix'; // Set this to your own account
var password = "e2783ab8fca083966c09301b2644443300c672e17aa17f5842265afee885a6a8";

// Initialize the library with my account.
var cloudant = Cloudant("https://e524f5c9-68e4-4329-b70e-24c4a62216f1-bluemix:e2783ab8fca083966c09301b2644443300c672e17aa17f5842265afee885a6a8@e524f5c9-68e4-4329-b70e-24c4a62216f1-bluemix.cloudant.com");

var db = cloudant.db.use("userdata_db");


var dummy_type = {name:'dummy-type2', type:'json', index:{fields:['userId']}}
db.index(dummy_type, function(er, response) {
  if (er) {
    throw er;
  }

  console.log('Index creation result: %s', response.result);
});

var fetchUserProducts = function(userId, res, respond, stores) {
	db.find({selector:{"userId":userId}}, function(er, result) {
		if (er) {
    			throw er;
		}
		if(result.docs.length > 0)
			userData = result.docs[0];
		else 
			userData = {};

		respond(res, stores, userData);
	});

}

module.exports = userdata;
module.exports.fetchUserProducts = fetchUserProducts;
