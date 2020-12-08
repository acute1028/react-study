const md5 = require('blueimp-md5');
// 引入mongoose
const mongoose = require('mongoose');
// 连接指定数据
mongoose.connect('mongodb://localhost:27017/gzhipin');
// 获取连接对象
const conn = mongoose.connection;
// 绑定连接完成的监听
conn.on('connected', function(){
  console.log('数据库连接成功！');
})

// 得到对应特定集合的model
const userSchema = mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  type: {type: String, required: true},
  header: {type: String}
})

// 定义model，返回的是构造函数。通过model实例实现增删改查
const UserModel = mongoose.model('user', userSchema);
function testSave() {
  const userModel = new UserModel({username: 'Tom', password: md5('123'), type: 'dashen'});
  userModel.save(function(error, user){
    console.log('save()', error, user);
  });
}
function testFind() {
  userModel.find(function(error, users) {
    console.log('find()', error, users);
  });
  // 查询一个：得到匹配的文档对象，没有的话返回null
  userModel.findOne({_id: '123'}, function(error, user) {
    console.log('findOne()', error, user);
  });
}function testUpdate() {
  userModel.findByIdAndUpdate({_id: '123'}, {username: 'Jack'}, function(error, oldUser){
    console.log('update()', error, oldUser);
  })
}
function testDelete(){
  userModel.remove({id: '123'}, function (error, doc) {
    console.log('delete()', error, doc); //{n:1, ok:1}
  })
}