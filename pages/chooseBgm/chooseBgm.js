const app = getApp()
const serverUrl = app.serverUrl;
const chooseBgmApi = require('./api.js');

Page({
    data: {
      bgmList:[],
      serverUrl:"",
      videoInfo:{}
    },
    onLoad: function (param) {
        var me = this;
        me.setData({
          videoInfo:JSON.parse(param.videoInfo)
        })
        chooseBgmApi.queryBgmList().then(res => {
          me.setData({
            bgmList:res.data.object,
            serverUrl:serverUrl
          })
        }).catch(err=> {
          wx.showToast({
            title: '页面加载失败',
            icon: 'cancel'
          })
        })
    },

    upload: function(e) {
      var me = this;
      var formValue = e.detail.value;
      var tempVideoUrl = me.data.videoInfo.tmpVideoUrl;
      //fixme userinfo修改成本地缓存
      var userInfo = app.getGlobalUserInfo();
      var param = {
        userId:userInfo.userId,  //fixme修改成本地缓存 app.userInfo.userId
        audioId:formValue.bgmId,
        videoDesc: formValue.desc,
        videoWidth: me.data.videoInfo.width,
        videoHeight: me.data.videoInfo.height,
        videoSeconds: me.data.videoInfo.duration,
        coverPath: me.data.videoInfo.tmpCoverUrl
      }
      wx.showLoading({
        title: '短视频上传中...',
      })
      var serverUrl = app.serverUrl;
      wx.uploadFile({
        url: serverUrl + '/video/upload',
        filePath: tempVideoUrl,
        name: 'file',
        formData: param,
        header: {
          'content-type': 'multipart/form-data'  
        },
        success(res) {
          var data = JSON.parse(res.data);
          console.log(data);
          var coverPath = {
            videoId:data.object,
            coverPath:param.coverPath
          }
          var videoId = data.object.videoId;
          if(200 == data.status) {
            //上传封面
            wx.uploadFile({
              url: serverUrl + '/video/uploadCover',
              filePath: param.coverPath,
              name: 'file',
              formData: coverPath,
              header: {
                'content-type': 'multipart/form-data'
              },
              success(res) {
                var data = JSON.parse(res.data);
                if(data.status == 200) {
                  wx.navigateTo({
                    url: '../mine/mine',
                  })
                }
                else {
                  wx.showToast({
                    title: '短视频封面上传失败',
                    duration: 2000
                  })
                }
              },
              fail(err) {
                wx.showToast({
                  title: '短视频封面上传失败',
                  duration: 2000
                }),
                  wx.navigateTo({
                    url: '../mine/mine',
                  }),
                  wx.hideLoading();
              }
            })
            wx.showToast({
              title: '短视频上传成功',
              icon: 'success',
              duration: 2000
            }),
            wx.hideLoading();
          }
          else if(500 == data.status) {
            wx.navigateTo({
              url: '../mine/mine',
            }),
            wx.showToast({
              title: data.msg,
            });
            wx.hideLoading();
          }
        },
        fail(err) {
          wx.showToast({
            title: '短视频上传失败',
            duration: 2000
          }),
          wx.navigateTo({
            url: '../mine/mine',
          }),
          wx.hideLoading();
        }
      })      
    }
})

