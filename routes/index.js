var crypto = require('crypto'),//crypto 是 Node.js 的一个核心模块，我们后面用它生成散列值来加密密码。
fs = require('fs');
User = require('../models/user.js');
Post = require('../models/post.js');
Movie = require('../models/Movie.js');
Comment = require('../models/comment.js');
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require("path");
/* GET home page. */


module.exports = function(app) {
	app.get('/', function (req, res) {
//想显示登陆后自己的文章，用req.session.user
		Post.getAll(null, function (err, posts) {
//这里能显示登陆后自己的文章是因为req.session.user的信息只有自己的名字属性，不然req.session.user=null会有错误！
			if (err) {
				posts = [];
			}
			res.render('index', {
				title: '主页',
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
			//console.log (req.body.name+'2222')
		});
	});
// 简单解释一下流程：用户在注册成功后，把用户信息存入 session ，同时页面跳转到主页显示 注册成功！ 。然后把 session 中的用户信息
//赋给变量 user ，在渲染 ejs 文件时通过检测 user 判断用户是否在线，根据用户状态的不同显示不同的导航信息

	app.get('/reg', checkNotLogin);
	app.get('/reg', function (req, res) {
		res.render('reg', {
		title: '注册',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
		});
	});
	app.post('/reg', checkNotLogin);
	app.post('/reg', function (req, res) {   
		//我们可以把用户登录状态的检查放到路由中间件中，在每个路径前增加路由中间件，即可实现页面权限控
		//制。我们添加 checkNotLogin 和 checkLogin 函数来实现这个功能。
		var name = req.body.name,
		password = req.body.password,//等价password = req.body['password']
		password_re = req.body['password-repeat'];
		//检验用户两次输入的密码是否一致
		if (password_re != password) {
			req.flash('error', '两次输入的密码不一致!');
			return res.redirect('/reg');
		}
		//生成密码的 md5 值
		var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
		name: req.body.name,
		password: password,
		email: req.body.email
	});
//检查用户名是否已经存在
	User.get(newUser.name, function (err, user) {
				if (user) {
				       req.flash('error', '用户已存在!');
				        return res.redirect('/reg');//用户名存在则返回注册页res.redirect： 重定向功能，实现了页面的跳转
				}
//如果不存在则新增用户
		newUser.save(function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = user.name;//用户信息存入 session
			 //console.log(req.session.user);
			req.flash('success', '注册成功!');
			res.redirect('/');//注册成功后返回主页
		});
	});
});


app.get('/login', checkNotLogin);
app.get('/login', function (req, res) {
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});
app.post('/login', checkNotLogin);
app.post('/login', function (req, res) {
//生成密码的 md5 值
		var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
		//检查用户是否存在
		User.get(req.body.name, function (err, user) {
			if (!user) {
					req.flash('error', '用户不存在!');
					return res.redirect('/login');//用户不存在则跳转到登录页
				}
//检查密码是否一致
			if (user.password != password) {
			req.flash('error', '密码错误!');
			return res.redirect('/login');//密码错误则跳转到登录页
			}
//用户名密码都匹配后，将用户信息存入 session
req.session.user = user.name;
//console.log(req.session.user);
req.flash('success', '登陆成功!');
res.redirect('/');
	});
	});

app.get('/post', checkLogin);
app.get('/post', function (req, res) {
res.render('post', {
title: '发表',
user: req.session.user,
success: req.flash('success').toString(),
error: req.flash('error').toString()
});
});
app.post('/post', checkLogin);
app.post('/post', function (req, res) {
var currentUser = req.session.user,
post = new Post(currentUser, req.body.title, req.body.post);
post.save(function (err) {
if (err) {
req.flash('error', err);
return res.redirect('/');
}
req.flash('success', '发布成功!');
res.redirect('/');
	})
});
app.get('/logout', checkLogin);
app.get('/logout', function (req, res) {
//req.session.user.name = null;
req.session.user=null;
req.flash('success', '登出成功!');
res.redirect('/');//登出后跳转到主页
});
app.get('/upload', checkLogin);
app.get('/upload', function (req, res) {
res.render('upload', {
title: '文件上传',
user: req.session.user,
success: req.flash('success').toString(),
error: req.flash('error').toString()
});
});
//app.get('/movie', checkLogin);
app.get('/movie', function (req, res){
	Movie.getAll(null, function (err, files) {
	 if (err) {
				files = [];
			}
	//console.log(files+'55');
     for (var i in files){
	         	if (files[i].file.size == 0){
		         	//使用同步方式删除一个文件
		         	fs.unlink(files[i].path);
		         	//console.log('file path:',files[i].path);
		         	//console.log('success remove a empty file');
	         	}
	         	console.log(files[i].file.size+'1234');
	         }
	         ///不会删除的，因为都不是文件，只是存在数据库中的文字
	res.render('movie', {
	title: '视频播放',
	user: req.session.user,
	files:files,
	success: req.flash('success').toString(),
	error: req.flash('error').toString()
});
});
//console.log(files);
});
app.post('/upload', checkLogin);
app.post('/upload', function (req, res) {

		var form = new formidable.IncomingForm();
		console.log(__dirname+'111');
		form.uploadDir = path.join(path.normalize(__dirname + '/..'),'public','images');
		//现在__dirnames是routes，/..表示返回上一个目录！
		form.keepExtensions = true;             //保留后缀格式
		form.maxFieldsSize = 2*1024*1024;       //文件大小
	    //console.log('new formidable',form);
		form.parse(req, function(err,fields,files){
	        if (err){
				req.flash('error', '文件上传失败');
				return res.redirect('/upload');
			     }
			for (var i in files){
	         	if (files[i].size == 0){
		         	//使用同步方式删除一个文件
		         	fs.unlinkSync(files[i].path);
		         	//console.log('file path:',files[i].path);
		         	//console.log('success remove a empty file');
	         	}else{
			         var target_path = './public/images/' + files[i].name;  //这里重名时  一定要注意
			         //使用同步方式重命名一个文件
			          console.log(files[i].name+'2121');
			           file = new Movie(files[i].name);
			           fs.renameSync(files[i].path, target_path);
			           console.log(file.file+'111');
					   file.save(function (err) {
						if (err) {
						req.flash('error', err);
						return res.redirect('/movie'); //保存不了数据！卡在这里
						}
						
						req.flash('success', '发布成功!');
						res.redirect('/movie');
							})
			         //file=files[i].name;
			         
				}
			}
	
		});
});
app.get('/u/:name', function (req, res) {
//检查用户是否存在
User.get(req.params.name, function (err, user) {
if (!user) {
req.flash('error', '用户不存在!');
return res.redirect('/');//用户不存在则跳转到主页
}
Post.getAll(user.name, function (err, posts) {
if (err) {
req.flash('error', err);
return res.redirect('/');
}
res.render('user', {
title: user.name,
posts: posts,
user : req.session.user,
success : req.flash('success').toString(),
error : req.flash('error').toString()
});
});
});
})
app.get('/u/:name/:day/:title', function (req, res) {
//console.log(req.params.name+ req.params.day+req.params.title+'1111')
Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
//console.log("3333");
if (err) {
req.flash('error', err);
return res.redirect('/');
}
//console.log(req.session.user+"4444");
res.render('article', {
title: req.params.title,
post: post,
user: req.session.user,
success: req.flash('success').toString(),
error: req.flash('error').toString()
});
});
});
//自己代码
app.post('/u/:name/:day/:title', function(req,res){
	//console.log("req.body.content" + req.body.content);
  var date = new Date();
  time = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
  var comment={
  	name: req.body.name,
	email: req.body.email,
	website: req.body.website,
	time: time,
	content: req.body.content

  }
 // console.log(comment+'33333');
  var newComment=new Comment(req.params.name,req.params.day,req.params.title,comment);
  newComment.save(function(err){
  	if(err){
  		req.flash('error',"评论失败！");
  		return res.redirect('back');
  	}
  	req.flash('success',"评论成功！");
  	res.redirect('back');
  })
});
//////////
app.get('/edit/:name/:day/:title', checkLogin);
app.get('/edit/:name/:day/:title', function (req, res) {
var currentUser = req.session.user;
Post.edit(currentUser, req.params.day, req.params.title, function (err, post) {
if (err) {
req.flash('error', err);
return res.redirect('/');
}
res.render('edit', {
title:"编辑",
post: post,
user: req.session.user,
success: req.flash('success').toString(),
error: req.flash('error').toString()
});
});
});
app.post('/edit/:name/:day/:title', checkLogin);
app.post('/edit/:name/:day/:title', function (req, res) {
var currentUser = req.session.user;
Post.update(currentUser, req.params.day, req.params.title,req.body.post, function (err) {
var url = '/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title;
if (err) {
req.flash('error', err);
return res.redirect(url);
}
req.flash('success', "编辑成功！");
//console.log(url+"地址");
//return res.redirect(url);
return res.redirect('/');//这里url有中文的话传不了
});
});
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录!');
			res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登录!');
			res.redirect('back');
		}
		next();
	}
};