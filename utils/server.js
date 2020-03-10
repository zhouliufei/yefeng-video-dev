const app = getApp();
var serverUrl = app.serverUrl;
const request = (url, method, params) => {
  wx.showLoading({
    title: '请稍后...',
  })
  var userInfo = app.getGlobalUserInfo();
  return new Promise((resolve, reject) => {
    wx.request({
      url: serverUrl + url, //服务器url+参数中携带的接口具体地址
      data: params,
      header: {
        'content-type': 'application/json',
        'userId': userInfo.userId,
        'token':userInfo.token
      },
      method: method, //默认为GET,可以不写
      success: function (res) {
        wx.hideLoading();
        resolve(res)
      },
      fail: function (e) {
        wx.hideLoading();
        reject(e)
      }
    })
  })
}
module.exports = request