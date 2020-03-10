const app = getApp();
const md5 = require("../../utils/md5.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
      
  },
  redirectUrl:'',
  onLoad:function(params) {
    var me = this;
    var redirectUrl = params.redirectUrl;
    if(redirectUrl != null && redirectUrl != '' && redirectUrl != undefined) {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");
      me.redirectUrl = redirectUrl;
    }
  },
  doLogin:function(param) {
    var me = this;
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
        url: serverUrl + '/login/login',
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
          if(status === 200) {
            // app.userInfo = res.data.object;
            // fixme 修改原有的全局对象为本地缓存
            app.setGlobalUserInfo(res.data.object);
            //TODO  页面跳转
            var redirectUrl = me.redirectUrl;
            if(redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
              wx.redirectTo({
                url: redirectUrl,
              })
            }
            else {
              wx.redirectTo({
                url: '../mine/mine',
              })
            }
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1000
            })
          } else if(status == 500) {
            wx.hideLoading();
            //弹出失败框
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
  goRegistPage:function() {
    wx.navigateTo({
      url: '../userRegist/userRegist',
    })
  }

})