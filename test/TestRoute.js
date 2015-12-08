/**
 * Created by admin on 2015/1/27.
 */
var express = require('express');
var router = express.Router();
var myClient = require('../utils/redisDB').myClient;

router.get('/testSet', function(req, res){
	var list = [ "test keys 1", "test val 1", "test keys 2", "test val 2"];
	myClient.setValue("key", 12, list, function (err, res) {
		if(err) {
			render('test', {age: err});
		}
	});
	res.render('test', {age:""});
});
router.get('/testGet', function(req, res){
	myClient.select("key", function(err, replies){
		res.render('test', {age:replies});
	});
});

module.exports = router;