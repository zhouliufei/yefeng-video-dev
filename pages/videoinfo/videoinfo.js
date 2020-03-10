var videoUtil = require('../../utils/videoUtil.js')
var videoInfoApi = require('./api.js');
const app = getApp()

Page({
  data: {
    cover: "cover",
    src:"",
    videoId:"",
    src:"",
    videoInfo:{},
    userLikeVideo: false,
    publisher:{},
    serverUrl:app.serverUrl,
    commentFocus:false,
    placeholder:'说点什么...',
    contentValue:'',
    commentsList:[],
    commentPage:1,
    commentPageSize:6,
    commentsTotalPage:0
  },

  videoCtx: {},

  onLoad: function (params) {    
    var me = this;
    var user = app.getGlobalUserInfo();
    me.videoCtx = wx.createVideoContext("myVideo", me);
    var videoInfo = JSON.parse(params.videoInfo);
    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var cover = "cover";
    if(width >= height) {
      cover = "";
    }
    me.setData({
      videoId: videoInfo.id,
      src:app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      cover:cover,
      serverUrl:app.serverUrl
    })
    var param = {
      userId: user.userId,
      videoId:videoInfo.id,
      videoCreateId:videoInfo.userId
    }
    videoInfoApi.queryUserLikeStatus(param).then(res => {
      var data = res.data.object;
      console.log(res.data.object)
      me.setData({
        publisher:data.user,
        userLikeVideo: data.userLikeVideo
      })
    }).catch(err => {
      console.log(err);
    });
    me.getCommentsList(1);
  },

  onShow: function () {
    var me = this;
    me.videoCtx.play();
  },

  onHide: function () {
    var me = this;
    me.videoCtx.pause();
  },

  showSearch: function () {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  showPublisher: function () {
    var me = this;
    var user = app.getGlobalUserInfo();
    var publisherId = me.data.videoInfo.userId;
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + publisherId,
      })
    }
  },


  upload: function () {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@'+videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' +realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }
    
    
  },

  showIndex: function () {
   wx.redirectTo({
     url: '../index/index',
   })
  },

  showMine: function () {
    var user = app.getGlobalUserInfo();
    if(user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    }
    else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

  likeVideoOrNot: function () {
    var me = this;
    var user = app.getGlobalUserInfo();
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    }
    else {
      var userLikeVideo = me.data.userLikeVideo;
      var param = {
        userId:user.userId,
        videoId:me.data.videoId,
        videoCreateId:me.data.videoInfo.userId
      }
     //如果userLikeVideo代表用户已经关注，则再点击表示取消关注
      if (userLikeVideo) {
        videoInfoApi.userUnLike(param).then(res => {
          console.log(res);
          if(res.data.status == 200) {
            me.setData({
              userLikeVideo:!userLikeVideo
            })
          } else {
            wx.showToast({
              title: '取消关注失败',
            })
          }
        }).catch(err => {
          wx.showToast({
            title: '网络请求失败',
          })
        })
      } else {
        videoInfoApi.userLike(param).then(res => {
          console.log(res);
          if(res.data.status == 200) {
            me.setData({
              userLikeVideo:!userLikeVideo
            })
          } else {
            wx.showToast({
              title: '关注失败',
            })
          }
        }).catch(err=>{
          wx.showToast({
            title: '网络请求失败',
          })
        })
      }
    }
  },

  shareMe: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    wx.showActionSheet({
      itemList: ['下载到本地','举报用户','分享到朋友圈','分享到QQ空间','分享到微博'],
      success:function(res) {
        var index = res.tapIndex;
        if(index == 0) {
          //下载到本地
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url:me.data.src,
            success:function(res) {
              if(res.statusCode === 200) {
                //获取本地地址
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success:function(res) {
                    console.log(res.errMsg);
                    wx.hideLoading();
                  },
                })
              }
            }
          })
        }else if(index == 1) {
          //举报用户
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoinfo/videoinfo#videoInfo@'+videoInfo;
          if(user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl='+realUrl,
            })
          } else {
            var publisherId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            wx.navigateTo({
              url: '../report/report?videoId='+videoId + "&publisherId="+publisherId,
            })
          }
         wx.navigateTo({
           url: '',
         })
        }else {
          wx.showToast({
            title: '官方暂未开放...',
          })
        }
      }
    })
  },

  onShareAppMessage: function (res) {
    var me = this;
    var videoInfo = me.data.videoInfo;
    return {
      title:'短视频内容分析',
      path:"pages/videoinfo/videoinfo?videoInfo="+JSON.stringify(videoInfo)
    }
  
  },
 

  leaveComment: function() {
   var me = this;
   me.setData({
     commentFocus:true
   })
  },

  replyFocus: function(e) {
    var me = this;
    var fatherCommentId=e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickName = e.currentTarget.dataset.tonickname;

    me.setData({
      placeholder:"回复 " + toNickName,
      replyFatherCommentId:fatherCommentId,
      replyToUserId:toUserId,
      commentFocus: true
    })

  },

  saveComment:function(e) {
    var me = this;
    var content = e.detail.value;
    //获取评论转发的replyFatherCommentId和replyToUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      var param = {
        fromUserId:user.userId,
        videoId:me.data.videoInfo.id,
        comment:content,
        //评论回复相关字段
        fatherCommentId: fatherCommentId,
        toUserId: toUserId
      }
      videoInfoApi.userComment(param).then(res => {
        if(res.data.status == 200) {
          wx.showToast({
            title: '评论成功',
          })
          me.setData({
            contentValue:'',
            commentsList:[]
          });
          me.getCommentsList(1);
        }
      }).catch(err => {
        wx.showToast({
          title: '网络请求失败',
        })
      })
    }
  },

  getCommentsList: function(page) {
      var me = this;
      var videoId = me.data.videoInfo.id;
      var param = {
        page: page,
        pageSize: me.data.commentPageSize,
        videoId:videoId
      }
      videoInfoApi.queryCommentList(param).then(res => {
        var data = res.data.object;
        var commentsList = data.rows;
        var newCommentsList = me.data.commentsList;

        me.setData({
          commentsList:newCommentsList.concat(commentsList),
          commentPage:page,
          commentsTotalPage:data.total
        })
      }).catch(err=> {
        wx.showToast({
          title: '网络请求失败',
        })
      })
  },

  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.commentPage;
    var totalPage = me.data.commentsTotalPage;
    if(currentPage == totalPage) {
      return;
    } 
    var page = currentPage + 1;
    me.getCommentsList(page);
  }
})