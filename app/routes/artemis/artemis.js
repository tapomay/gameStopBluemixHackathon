/*
 * IBM Confidential OCO Source Materials
 *
 * 5725-I43 Copyright IBM Corp. 2015
 *
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 *
*/

// External dependencies
var express = require('express');
var artemis = express.Router();
var Cloudant = require('cloudant');

var me = 'e524f5c9-68e4-4329-b70e-24c4a62216f1-bluemix'; // Set this to your own account
var password = "e2783ab8fca083966c09301b2644443300c672e17aa17f5842265afee885a6a8";

// Initialize the library with my account.
var cloudant = Cloudant("https://e524f5c9-68e4-4329-b70e-24c4a62216f1-bluemix:e2783ab8fca083966c09301b2644443300c672e17aa17f5842265afee885a6a8@e524f5c9-68e4-4329-b70e-24c4a62216f1-bluemix.cloudant.com");

var payloadTmp = "NONE";
cloudant.db.list(function(err, allDbs) {
  payloadTmp = allDbs.join(', ')
  console.log('All my databases: %s', allDbs.join(', '))
});

var db = cloudant.db.use("stores_db");

//VERY DANGEROUS
//db.insert({_rev: '2-cc5825485a9b2f66d79b8a849e162g2f', "type":"FULL"}, function(err, body) {});
//db.insert({_rev: '2-0f20a52060bf4e69acf1cd345ba18821', "type":"COPY"}, function(err, body) {});

var dummy_type = {name:'dummy-type', type:'json', index:{fields:['type']}}
db.index(dummy_type, function(er, response) {
  if (er) {
    throw er;
  }

  console.log('Index creation result: %s', response.result);
});


// Internal dependencies
//var enroll = require('./enroll.js');
//var sessioncookie = require('./sessioncookie.js');


// Setup security filter
var passport_auth_func = function() {
    console.log('Authentication is disabled.');
    return function(req, res, next) {
      next();
    };
}
/*
if (!process.env.NO_AUTH) {
    var passport = require('passport');
    var ImfStrategy = require('passport-imf-token-validation').ImfBackendStrategy;
    passport.use(new ImfStrategy());
    artemis.use('/api/v1/apps/', passport.initialize());
    passport_auth_func = function() {
        console.log('Authentication is enabled.');
        return passport.authenticate('imf-backend-strategy', {
            session: false
        });
    };
}
*/
var passport_auth = passport_auth_func();

// Routes enroll traffic
//artemis.use('/enroll', passport_auth, enroll);

// Routes sessioncookie traffic
//artemis.use('/sessioncookie', passport_auth, sessioncookie);

// Displays current version of server APIs
artemis.get('/', function(req, res) {
    res.status(200).json({
        artemis: "ok",
	allDbs: payloadTmp,
        version: 1
    });
});

// Displays current version of server APIs
artemis.get('/:postal', function(req, res) {
    var postal =  req.params.postal;
    var devid = req.query.devid;
    db.find({selector:{"type":"FULL"}}, function(er, result) {
	  if (er) {
	    throw er;
	  }

	  console.log('Found %d documents with type Full', result.docs.length);
	  respArr = []
	  for (var i = 0; i < result.docs.length; i++) {
	      console.log('  Doc id: %s', result.docs[i]._id);
	      respArr.push(result.docs[i]._id);
	  }
	console.log(Object.keys(result.docs[0]));
	var zipdata = result.docs[0].zipdata;
	var stores = zipdata[postal];
	if(postal in zipdata && stores.length > 0) {
		console.log("STORE: " + stores[0].STORENUMBER);
	} else {
		console.log("No stores in vicinity");
	}
	var respObj = {
		artemis: "ok",
		postal:  req.params.postal,
		devid: req.query.devid,
		stores: stores,
		version: 1,
		allDbs: payloadTmp
    	};
	res.status(200).json(respObj);
    });

    
});

module.exports = artemis;
