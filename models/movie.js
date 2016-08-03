var mongodb=require('./db');
function Movie(file){
	this.file=file;
}
module.exports=Movie;
Movie.prototype.save=function(callback){
   var file=this.file;
   console.log(file+'9999');
  var file={
  	file:file
  };
 mongodb.open(function(err,db){
 	if(err){
 		mongodb.close();
 		return callback(err);
 	}
 	db.collection('files',function(err,collection){
 		if(err){
 			mongodb.close();
 			return callback(err);
 		}

 		 collection.insert(file,{safe:true},function(err,file){
    	mongodb.close();
      //console.log(post.ops[0])
    	callback(null,file);
    })
 })
 })
}
Movie.getAll = function(name, callback) {
//打开数据库
mongodb.open(function (err, db) {
if (err) {
return callback(err);
}
//读取 posts 集合
db.collection('files', function(err, collection) {
if (err) {
mongodb.close();
return callback(err);
}
var query = {};
if (name) {
query.name = name;
}
//根据 query 对象查询文章,sort（{time:-1}）表示按时间先后顺序
collection.find(query).sort({
time: -1
}).toArray(function (err, docs) {
mongodb.close();
if (err) {
return callback(err);//失败！返回 err
}
//解析 markdown 为 html

callback(null, docs);//成功！以数组形式返回查询的结果
});
});
});
};