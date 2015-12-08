
var express = require('express');
var router = express.Router();

router.get('/news/filter/list', function(req, res) {
	res.render('news/filter_results', {});
});

/** 手机落地页1 */
router.get('/appluodi1', function(req, res){
	res.render('appluodi/appluodi1');
});

router.get('/appluodi2', function(req, res){
	res.render('appluodi/appluodi2');
});

router.get('/appluodi3', function(req, res){
	res.render('appluodi/appluodi3');
});

router.get('/appluodi4', function(req, res){
	res.render('appluodi/appluodi4');
});

router.get('/appluodi5', function(req, res){
	res.render('appluodi/appluodi5');
});

module.exports = router;