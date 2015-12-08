/**
 * Created by admin on 2015/7/9.
 * 韩豆小秘书
 */
let Response = require('../../models/ResponseObj');
let dateUtils = require('../../utils/dateUtils.js');
let secretaryService = require('../../services/SecretaryService.js');
let config = require('../../config/config.json');
let SecretaryController = function(){};
/**
 * 常见问题列表
 * @param req
 * @param res
 */
SecretaryController.getCommonQuestion = function(req, res){
    let command = req.body.command;
    let object = req.body.object;
    let params = {
        type: object.type
    };
    let resObj = Response();
    resObj.command = command;
    secretaryService.getCommonQuestion(params, function(err, list){
        if(err){
            resObj.errMsg(5002, JSON.stringify(err.message));
            res.send(resObj);
        } else {
            resObj.object = list;
            res.send(resObj);
        }
    });
};
/**
 * 我的问题
 * @param req
 * @param res
 */
SecretaryController.getMyQuestion = function(req, res){
    let command = req.body.command;
    let object = req.body.object;
    let params = {
        userId: object.userId,
        direction: object.direction,
        pageSize: object.pageSize? object.pageSize: 10,
        lastDate: object.lastDate
    };
    let resObj = Response();
    resObj.command = command;
    secretaryService.getMyQuestion(params, function(err, list){
        if(err){
            resObj.errMsg(5002, JSON.stringify(err.message));
            res.send(resObj);
        } else {
            let secretaries = [];
            list.forEach(function(item, index){
                secretaries.push({
                    secretaryId: item.getDataValue("secretaryId"),
                    content: item.getDataValue("content"),
                    createDate: dateUtils.formatDate(item.getDataValue("createDate")),
                    type: item.getDataValue("type"),
                    headPortrait: config.qiniu.kp_site + config.qiniu.defaul_user_head
                });
            });
            resObj.object = secretaries;
            res.send(resObj);
        }
    });
};
/**
 * 提问
 * @param req
 * @param res
 */
SecretaryController.addQuestion = (req, res) => {
    let command = req.body.command;
    let object = req.body.object;
    let params = {
        type: "q",
        content: object.content,
        userId: object.userId
    };
    let resObj = Response();
    resObj.command = command;
    secretaryService.addQuestion(params, function(err, obj){
        if(err) {
            resObj.errMsg(5002, JSON.stringify(err.message));
            res.send(resObj);
        } else {
            res.send(resObj);
        }
    });
};

module.exports = SecretaryController;