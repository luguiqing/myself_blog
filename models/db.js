var settings = require('../settings'),
Db = require('mongodb').Db,
Connection = require('mongodb').Connection,
Server = require('mongodb').Server;
//module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {}));
module.exports = new Db(settings.db, new Server(settings.host,'27017', {}), {safe: true});//连接数据库