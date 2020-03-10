const reportApi = require('./api.js')
const app = getApp()

Page({
    data: {
        reasonType: "请选择举报原因",
        reportReasonArray: app.reportReasonArray,
        publisherId:"",
        videoId:""
    },

    onLoad:function(params) {
      var me = this;

      var videoId = params.videoId;
      var publisherId = params.publisherId;

      me.setData({
        publisherId: publisherId,
        videoId: videoId
      });
    },

    changeMe:function(e) {
      var me = this;
      var index = e.detail.value;
      var reasonType = app.reportReasonArray[index];
      me.setData({
        reasonType: reasonType
      });
    },

    submitReport:function(e) {
      var me = this;
      var reasonIndex = e.detail.value.reasonIndex;
      var reasonContent = e.detail.value.reasonContent;
      var user = app.getGlobalUserInfo();
      var userid = user.userId;

      if (reasonIndex == null || reasonIndex == '' || reasonIndex == undefined) {
        wx.showToast({
          title: '选择举报理由',
          icon: "none"
        })
        return;
      }
      var param = {
        userid:userid,
        dealUserId:me.data.publisherId,
        dealVideoId:me.data.videoId,
        title: me.data.reportReasonArray[reasonIndex],
        content:reasonContent
      }
      reportApi.reportUser(param).then(res => {
        var data = res.data.object;
        if(res.data.status == 200) {
          wx.showToast({
            title: '举报成功',
          })
          wx.navigateBack();
        } else if(res.data.status == 500) {
          wx.showToast({
            title: res.data.msg,
          })
        }
      }).catch(err => {
        wx.showToast({
          title: '网络请求失败',
        })
      })
    }
})
