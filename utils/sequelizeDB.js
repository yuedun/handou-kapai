/**
 * Created by admin on 2015/1/26.
 */
var config = require('../config/config');
var Sequelize = require('sequelize')
    , sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
        host: config.db.dbhost,
        dialect: "mysql", // or 'sqlite', 'postgres', 'mariadb'
        port:    config.db.port, // or 5432 (for postgres)
        pool: {
            maxConnections: 5,
            minConnections: 0,
            maxIdleTime: 10000
        },
        timezone:"+08:00"
    });
    sequelize.authenticate();//验证链接成功返回“SELECT 1+1 AS result”
module.exports = sequelize;