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
  header: {type: String},
  post: {type: String},
  info: {type: String},
  company: {type: String},
  salary: {type: String}
})

// 定义model，返回的是构造函数。通过model实例实现增删改查
const UserModel = mongoose.model('user', userSchema);
exports.UserModel = UserModel;

const chatSchema = mongoose.Schema({
  from: {type: String, required: true},
  to: {type: String, required: true},
  chat_id: {type: String, required: true},//from和to组成的字符串
  content: {type: String, required: true},
  read: {type: Boolean, default: false},
  create_time: {type: Number} //sort用
})

// 定义model，返回的是构造函数。通过model实例实现增删改查
const ChatModel = mongoose.model('chat', chatSchema);
exports.ChatModel = ChatModel;