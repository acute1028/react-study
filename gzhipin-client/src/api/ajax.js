import axios from 'axios';

export default function ajax(url, data={}, type='GET') {
  if (type === 'GET') {
    let keyArray = [];
    Object.keys(data).forEach(key => {
      keyArray.push(key + '=' + data[key]);
    })
    return axios.get(keyArray.length > 0 ? url + '?' + keyArray.join('&') : url);
  } else {
    return axios.post(url, data);
  }
}