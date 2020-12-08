import React, {Component} from 'react';
import {NavBar, WingBlank, List, InputItem, WhiteSpace, Button} from 'antd-mobile';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';

import Logo from "../../components/logo/logo";
import {login} from '../../redux/actions';

class Login extends Component {
  state = {
    username: '',
    password: ''
  };
  handleChange = (name, val) => {
    this.setState({
      // string=>变量
      [name]: val
    })
  };
  login = () => {
    this.props.login(this.state);
  };
  toRegister = () => {
    this.props.history.replace('/register');
  };
  render() {
    const {msg, redirectTo} = this.props.user;
    if (redirectTo) {
      return <Redirect to={redirectTo}/>
    } 
    return (
      <div>
        <NavBar>硅&nbsp;谷&nbsp;直&nbsp;聘</NavBar>
        <Logo/>
        <WingBlank>
          <List>
            {msg ? <div className='error-msg'>{msg}</div> : null}
            <InputItem placeholder="请输入用户名" onChange={val => {this.handleChange('username', val)}}>用户名：</InputItem>
            <WhiteSpace/>
            <InputItem placeholder="请输入密码" type="password" onChange={val => {this.handleChange('password', val)}}>密&nbsp;&nbsp;码：</InputItem>
            <WhiteSpace/>
            <Button type="primary" onClick={this.login}>登陆</Button>
            <Button onClick={this.toRegister}>还没有账户</Button>
          </List>
        </WingBlank>
      </div>
    )
  }
}

export default connect(
  state => ({user: state.user}),
  {login}
)(Login);