var express = require('express');
var router = express.Router();
const {UserModel, ChatModel} = require('../db/models');
const md5 = require('blueimp-md5');
const filter = {password: 0, __v: 0};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', function(req, res) {
  const {username, password, type} = req.body;
  UserModel.findOne({username}, function(error, user){
    if (user) {
      res.send({code: 1, msg: '此用户已存在'});
    } else {
      const userModel = new UserModel({username, password: md5(password), type});
      userModel.save(function(error, user){
        if (user) {
          console.log('用户注册成功', user);
          // 保存在文件里，浏览器关掉也没事
          res.cookie('userid', user._id, {maxAge: 1000*60*60*24});
          res.send({code: 0, data: {_id: user._id, username, type}});
        } else {
          console.log('register', error);
          res.send({code: 1, msg: '用户注册失败'});
        }
      })
    }
  })
});

router.post('/login', function(req, res) {
  const {username, password} = req.body;
  UserModel.findOne({username, password: md5(password)}, filter, function(error, user){
    if (user) {
      res.cookie('userid', user._id, {maxAge: 1000*60*60*24});
      res.send({code: 0, data: user});
    } else {
      res.send({code: 1, msg: '用户名或密码不正确！'});
    }
  })
});

router.post('/update', function(req, res) {
  const userid = req.cookies.userid;
  if (!userid) {
    return res.send({code: 1, msg: '请先登陆！'});
  }
  const user = req.body;
  UserModel.findByIdAndUpdate({_id: userid}, user, function(error, oldUser){
    if (!oldUser) {
      res.clearCookie('userid');
      res.send({code: 1, msg: '请先登陆！'});
    } else {
      const {_id, username, type} = oldUser;
      const data = Object.assign(user, {_id, username, type});
      res.send({code: 0, data});
    }
  })
});
router.get('/user', function(req, res) {
  const userid = req.cookies.userid;
  if (!userid) {
    return res.send({code: 1, msg: '请先登陆！'});
  } else {
    UserModel.findOne({_id: userid}, filter, function(error, user) {
      res.send({code: 0, data: user});
    })
  }
})
router.get('/userlist', function(req, res) {
  const {type} = req.query;
  UserModel.find({type}, filter, function(error, users){
    res.send({code: 0, data: users});
  })
})
/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', function (req, res) {
  // 获取cookie中的userid
  const userid = req.cookies.userid
  // 查询得到所有user文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
    /*const users = {} // 对象容器
    userDocs.forEach(doc => {
      users[doc._id] = {username: doc.username, header: doc.header}
    })*/

    const users = userDocs.reduce((users, user) => {
      users[user._id] = {username: user.username, header: user.header}
      return users
    } , {})
    /*
    查询userid相关的所有聊天信息
     参数1: 查询条件
     参数2: 过滤条件
     参数3: 回调函数
    */
    ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({code: 0, data: {users, chatMsgs}})
    })
  })
})

/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
  // 得到请求中的from和to
  const from = req.body.from
  const to = req.cookies.userid
  /*
  更新数据库中的chat数据
  参数1: 查询条件
  参数2: 更新为指定的数据对象
  参数3: 是否1次更新多条, 默认只更新一条
  参数4: 更新完成的回调函数
   */
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    res.send({code: 0, data: doc.nModified}) // 更新的数量
  })
})

module.exports = router;
