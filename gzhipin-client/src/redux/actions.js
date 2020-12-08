import io from 'socket.io-client';
// 包含N个reducer函数，根据老的state和指定的action返回一个新的state
import {reqRegister, reqLogin, reqUpdateUser, reqUser, reqUserList, reqChatMsgList, reqReadMsg} from '../api';
import {AUTH_SUCCESS, ERROR_MSG, RECEIVE_USER, RESET_USER, RECEIVE_USER_LIST,
  RECEIVE_MSG_LIST,
  RECEIVE_MSG,
  MSG_READ} from './action-types';
/*
单例对象
1. 创建对象之前: 判断对象是否已经存在, 只有不存在才去创建
2. 创建对象之后: 保存对象
 */
function initIO(dispatch, userid) {
  // 1. 创建对象之前: 判断对象是否已经存在, 只有不存在才去创建
  if(!io.socket) {
    // 连接服务器, 得到与服务器的连接对象
    io.socket = io('ws://localhost:4000')  // 2. 创建对象之后: 保存对象
    // 绑定监听, 接收服务器发送的消息
    io.socket.on('receiveMsg', function (chatMsg) {
      console.log('客户端接收服务器发送的消息', chatMsg)
      // 只有当chatMsg是与当前用户相关的消息, 才去分发同步action保存消息
      // debugger
      if(userid===chatMsg.from || userid===chatMsg.to) {
        dispatch(receiveMsg(chatMsg, userid))
      }
    })
  }
}
// 异步获取消息列表数据
async function getMsgList(dispatch, userid) {
  initIO(dispatch, userid)
  const response = await reqChatMsgList()
  const result = response.data
  if(result.code===0) {
    const {users, chatMsgs} = result.data
    // 分发同步action
    dispatch(receiveMsgList({users, chatMsgs, userid}))
  }
}

// 发送消息的异步action
export const sendMsg = ({from, to, content}) => {
  return dispatch => {
    console.log('客户端向服务器发送消息', {from, to, content})
    // 发消息
    io.socket.emit('sendMsg', {from, to, content})
  }
}

// 读取消息的异步action
export const readMsg = (from, to) => {
  return async dispatch => {
    const response = await reqReadMsg(from)
    const result = response.data
    if(result.code===0) {
      const count = result.data
      dispatch(msgRead({count, from, to}))
    }
  }
}
const authSuccess = user => ({type: AUTH_SUCCESS, data: user});;
const errorMsg = msg => ({type: ERROR_MSG, data: msg});
const receiveUser = user => ({type: RECEIVE_USER, data: user});
export const resetUser = msg => ({type: RESET_USER, data: msg});
export const receiveUserList = userList => ({type: RECEIVE_USER_LIST, data: userList});
// 接收消息列表的同步action
const receiveMsgList = ({users, chatMsgs, userid}) => ({type: RECEIVE_MSG_LIST, data:{users, chatMsgs, userid}})
// 接收一个消息的同步action
const receiveMsg = (chatMsg, userid) => ({type: RECEIVE_MSG, data: {chatMsg, userid}})
// 读取了某个聊天消息的同步action
const msgRead = ({count, from, to}) => ({type: MSG_READ, data: {count, from, to}})
export const register = user => {
  const {username, password, password2, type} = user;
  if (!username || !password) {
    return errorMsg('用户名和密码必须输入！');
  }
  if (password !== password2) {
    return errorMsg('2次密码要一致！');
  }
  return async dispatch => {
    // 发送异步ajax请求
    const response = await reqRegister({username, password, type});
    const result = response.data;
    if (result.code===0) {
      getMsgList(dispatch, result.data._id)
      dispatch(authSuccess(result.data));
    } else {
      dispatch(errorMsg(result.msg));
    }
  } 
}

export const login = user => {
  const {username, password} = user;
  if (!username || !password) {
    return errorMsg('用户名和密码必须输入！');
  }
  return async dispatch => {
    // 发送异步ajax请求
    const response = await reqLogin(user);
    const result = response.data;
    if (result.code===0) {
      getMsgList(dispatch, result.data._id)
      dispatch(authSuccess(result.data));
    } else {
      dispatch(errorMsg(result.msg));
    }
  }
}

export const updateUser = user => {
  return async dispatch => {
    const response = await reqUpdateUser(user);
    const result = response.data;
    if (result.code === 0) {
      dispatch(receiveUser(result.data));
    } else {
      dispatch(resetUser(result.msg));
    }
  }
}
//自动登陆获取user信息
export const getUser = () => {
  return async dispatch => {
    const response = await reqUser();
    const result = response.data;
    if (result.code===0) {
      getMsgList(dispatch, result.data._id)
      dispatch(receiveUser(result.data));
    } else {
      dispatch(resetUser(result.msg));
    }
  }
}
export const getUserList = type => {
  return async dispatch => {
    const response = await reqUserList(type);
    const result = response.data;
    if (result.code===0) {
      dispatch(receiveUserList(result.data));
    }
  }
}