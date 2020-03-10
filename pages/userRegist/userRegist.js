const app = getApp();
const md5 = require("../../utils/md5.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  doRegist:function(param) {
    var formObject = param.detail.value;
    var username = formObject.username;
    var password = md5.b64Md5(formObject.password);
    //简单验证
    if(username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名和密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      var serverUrl = app.serverUrl;
      wx.request({
        url: serverUrl + '/regist/regist',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json'
        },
        success:function(res) {
          wx.hideLoading();
          var status = res.data.status;
          if(status == 200) {
            wx.showToast({
              title: '注册成功',
              icon: 'success',
              duration: 3000 
            })
          } else if(status == 500) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
  },
  goLoginPage:function() {
    wx.navigateTo({
      url: '../userLogin/login',
    })
  }

})