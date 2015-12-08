/**
 * Created by admin on 2015/7/9.
 * 韩豆小秘书
 */
let travelSchedule = require('../models/sqlFile/TravelSchedule');
let Secretary = require('../models/app-models/SecretaryModel.js');
let UserModel = require('../models/app-models/UserModel.js');
var sequelize = require('../utils/sequelizeDB');
let SecretaryService = () => {};

/**
 * 小秘书，常见问题
 * @param params
 * @param callback
 */
SecretaryService.getCommonQuestion = (params, callback) => {
    sequelize.query(travelSchedule.commonQuestion(), {
        type: sequelize.QueryTypes.SELECT,
        replacements: params
    }).then(function (obj) {
        callback(null,obj);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 提问
 * @param params
 * @param callback
 */
SecretaryService.addQuestion = (params, callback) => {
    Secretary.create({
        content: params.content,
        type: params.type,
        userId: params.userId,
        createDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        updateDate: moment().format("YYYY-MM-DD HH:mm:ss")
    }).then(function(obj){
        callback(null, obj);
    }).catch(function(err){
        callback(err);
    });
};

/**
 * 小秘书，我的提问
 * @param params
 * @param callback
 */
SecretaryService.getMyQuestion = (params, callback) => {
    let condition = {};
    condition.userId = params.userId;
    if (params.direction === 'refresh') {
        condition.createDate = {$lt: new Date()}
    } else if (params.direction === 'loadmore'){
        condition.createDate = {$lt: params.lastDate}
    }
    Secretary.findAll({
        attributes: ['secretaryId', 'content', 'createDate', 'type'],
        where: condition,
        include: [{model: UserModel, attributes: ['headPortrait']}],
        limit: params.pageSize,
        order: [['create_date', 'DESC']]
    }).then(function(list){
        callback(null, list);
    }).catch(function(err) {
        callback(err);
    });
};
module.exports = SecretaryService;