import React, {Component} from 'react';
import {TabBar} from 'antd-mobile';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

const Item = TabBar.Item;
class NavFooter extends Component {
  static propTypes = {
    navList: PropTypes.array.isRequired,
    unReadCount: PropTypes.number.isRequired
  }
  render() {
    let {navList, unReadCount} = this.props;
    const path = this.props.location.pathname;
    navList = navList.filter(nav => !nav.hide);
    return (
      <TabBar>
        {navList.map((nav, index) => (
          <Item key={nav.path} 
          badge={nav.path==='/message' ? unReadCount : 0}
          title={nav.text} icon={{uri: require(`../../assets/images/nav/${nav.icon}.png`)}}
          selectedIcon={{uri: require(`../../assets/images/nav/${nav.icon}-selected.png`)}}
          selected={path===nav.path} onPress={() => this.props.history.replace(nav.path)}/>
        ))}
      </TabBar>
    )
  }
}
//内部会向组件中传入一些路由组件特有的属性：history,location,match
export default withRouter(NavFooter);