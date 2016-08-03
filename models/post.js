var mongodb=require('./db');
markdown = require('markdown').markdown;//markdown工具，可以将txt转化成html格式
function Post(name,title,post){
    this.name=name;
    this.title=title;
    this.post=post;
};
module.exports=Post;
Post.prototype.save=function(callback){
  var date = new Date();
//存储各种时间格式，方便以后扩展
var time = {
date: date,
year : date.getFullYear(),
month : date.getFullYear() + "-" + (date.getMonth()+1),
day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
}
var post = {
name: this.name,
time: time,
title: this.title,
post: this.post,
comments: []
};
   mongodb.open(function(err,db){
   	if(err){
   		return callback(err);
   	}
   	db.collection('posts',function(err,collection){
   		if(err){
   			mongodb.close();
   			return callback(err);
   		}
    collection.insert(post,{safe:true},function(err,post){
    	mongodb.close();
      //console.log(post.ops[0])
    	callback(null,post.ops[0]);
    })
   	})
   })

}
Post.getAll = function(name, callback) {
//打开数据库
mongodb.open(function (err, db) {
if (err) {
return callback(err);
}
//读取 posts 集合
db.collection('posts', function(err, collection) {
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
docs.forEach(function (doc) {
doc.post = markdown.toHTML(doc.post);
});
callback(null, docs);//成功！以数组形式返回查询的结果
});
});
});
};
Post.getOne = function(name, day, title, callback) {
//打开数据库
mongodb.open(function (err, db) {
if (err) {
return callback(err);
}
//读取 posts 集合
db.collection('posts', function (err, collection) {
if (err) {
mongodb.close();
return callback(err);
}
//根据用户名、发表日期及文章名进行查询
//console.log("name：" + name + ", day: " + day + ", title: " + title);
collection.findOne({
"name": name,
"time.day": day,
"title": title
}, function (err, doc) {
mongodb.close();
if (err) {
return callback(err);
}
//解析 markdown 为 html
if(doc){
doc.post = markdown.toHTML(doc.post);

doc.comments.forEach(function (comment) {
//console.log(comment)
comment.content = markdown.toHTML(comment.content);
});

}
callback(null, doc);//返回查询的一篇文章
});
});
});
};
//自己代码
Post.edit = function(name, day, title, callback) {
//打开数据库
          mongodb.open(function (err, db) {
          if (err) {
                      return callback(err);
              }
//读取 posts 集合
            db.collection('posts', function (err, collection) {
            if (err) {
                        mongodb.close();
                        return callback(err);
              }
//根据用户名、发表日期及文章名进行查询
              collection.findOne({
                  "name": name,
                  "time.day": day,
                  "title": title
                  }, function (err, doc) {
                    mongodb.close(); 
                    if (err) {
                    return callback(err);
              }

         //doc.post = markdown.toHTML(doc.post);不可以解析，不然文章会有<h>这些！
            callback(null, doc);////返回查询的一篇文章（markdown 格式）
          });
       });
            });
  };
///
Post.update= function(name, day, title, post,callback) {
//打开数据库
mongodb.open(function (err, db) {
if (err) {
return callback(err);
}
//读取 posts 集合
db.collection('posts', function (err, collection) {
if (err) {
mongodb.close();
return callback(err);
}
//根据用户名、发表日期及文章名进行查询
collection.update({
"name": name,
"time.day": day,
"title": title
}, {
  $set: {post: post}
},function (err, result) {

if (err) {
return callback(err);
}

//console.log(post+"3333");
callback(null);//返回查询的一篇文章
});
});
});
};