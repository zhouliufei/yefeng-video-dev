var videoUtil = require('../../utils/videoUtil.js')
var mineApi = require('./api.js')

const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    fansCounts: 0,
    followCounts: 0,
    receiveLikeCounts: 0,
    serverUrl:'',
    nickname: '夜风',
    isMe:true,
    isFollow:false,
    publisherId:'',
    videoSelClass:'video-info',
    isSelectedWork:"video-info-selected",
    isSelectedLike:"",
    isSelectedFollow:"",
    pageSize:6,

    myVideoList:[],
    myVideoPage:1,
    myVideoTotal:1,

    likeVideoList:[],
    likeVideoPage:1,
    likeVideoTotal:1,

    followVideoList:[],
    followVideoPage:1,
    followVideoTotal:1,

    myWorkFalg:false,
    myLikesFalg:true,
    myFollowFalg:true,
  },

  onLoad: function(params) {
    var me = this;
    const serverUrl = app.serverUrl;
    //fixme 全局变量修改为本地缓存，原来为app.userInfo;
    var userInfo = app.getGlobalUserInfo();
    var userId = userInfo.userId;

    var publisherId = params.publisherId;
    if (publisherId != null && publisherId != '' && publisherId != undefined) {
        //进入视频发布者的界面
        userId = publisherId;
        me.setData({
          isMe:false,
          publisherId:publisherId
        })
    }
    mineApi.queryUserInfo({ userId: userId,fanId:userInfo.userId}).then(res => {
      if(res.data.status == 200) {
        var userInfo = res.data.object;
        var faceUrl = "../resource/images/noneface.png";
        if (userInfo.faceImage != null &&
          userInfo.faceImage != '' &&
          userInfo.faceImage != undefined) {
          faceUrl = serverUrl + userInfo.faceImage;
        }
        me.setData({
          faceUrl: faceUrl,
          fansCounts: userInfo.fansCounts,
          followCounts: userInfo.followCounts,
          receiveLikeCounts: userInfo.receiveLikeCounts,
          nickname: userInfo.nickname,
          isFollow:userInfo.follow,
          serverUrl:serverUrl
        })
      }
      else if(res.data.status == 401) {
        wx.showToast({
          title: res.data.object.msg,
          duration:2000,
          icon:'none'
        }),
        wx.redirectTo({
          url: '../userLogin/login',
        })
      }
     
      console.log(res);
    }).catch(err=> {
      console.log(err);
    });
    me.doSelectWork();
  },
  logout:function() {
    // var user = app.userInfo;
    //fixme 修改全局变量为本地缓存
    var user = app.getGlobalUserInfo();
    mineApi.logout(user).then(res => {
      if(res.data.status == 200) {
        // app.userInfo = null;
        //注销登录，清空缓存
        wx.removeStorageSync("userInfo");
        //页面跳转
        wx.navigateTo({
          url: '../userLogin/login',
        })
        wx.showToast({
          title: '注销成功',
          icon: 'success'
        });
      } else if(res.data.status == 500) {
        wx.showToast({
          title: res.data.msg,
        })
      }
    }).catch(err => {
      wx.showToast({
        title: '注销失败',
        icon: 'none'
      });
    })
  },
  changeFace:function() {
    var me = this;
    var userInfo = app.getGlobalUserInfo();
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        const serverUrl = app.serverUrl;
        wx.showLoading({
          title: '头像上传中...',
        })
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace', 
          filePath: tempFilePaths[0],
          name: 'files',
          formData: { 
            userId: userInfo.userId //fixme 原来的参数app.userInfo.userId,
          },
          header: {
            'content-type':'application/json'
          },
          success(res) {
            var data = JSON.parse(res.data);
            wx.hideLoading();
            if(data.status == 200) {
              wx.showToast({
                title: '上传成功',
                icon: 'success',
              })
              me.setData({
                faceUrl:serverUrl + data.object
              });
            } else if(data.status == 500) {
              wx.showToast({ 
                title: res.data.msg,
              })
            }
            
          }
        })
      }
    })
  },
  uploadVideo:function() {
    videoUtil.uploadVideo();
  },
  followMe:function(e) {
    var me = this;
    var publisherId = me.data.publisherId;
    var user = app.getGlobalUserInfo();
    var userId = user.userId;
    var followType = e.currentTarget.dataset.followtype;
    //1：关注 0：取消关注
    var followAuthorInputDTO = {
      userId:userId,
      authorId:publisherId
    }
    if (followType == '0') {
      mineApi.removeFollowAuthor(followAuthorInputDTO).then(res => {
        if (res.data.status == 200) {
          wx.showToast({
            title: '取消关注成功',
          });
          me.setData({
            isFollow: false,
            fansCounts:--me.data.fansCounts
          })
        }
        else if (res.data.status == 500) {
          wx.showToast({
            title: res.data.msg,
          })
        }
      }).catch(err => {
        wx.showToast({
          title: '网络请求失败',
        })
      })
    } else if (followType == '1') {
      mineApi.followAuthor(followAuthorInputDTO).then(res => {
        if(res.data.status == 200) {
          wx.showToast({
            title: '关注成功',
          });
          me.setData({
            isFollow:true,
            fansCounts:++me.data.fansCounts
          })
        }
        else if(res.data.status == 500) {
          wx.showToast({
            title: res.data.msg,
          })
        }
        console.log(res);
      }).catch(err => {
        wx.showToast({
          title: '网络请求失败',
        })
      })
    }
  },
  doSelectWork:function() {
    var me = this;
    me.setData({
      isSelectedWork:"video-info-selected",
      isSelectedLike:"",
      isSelectedFollow:"",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,
    });
    me.selectWork(1);
  },
  selectWork: function (page) {
    var me = this;
    var userInfo = app.getGlobalUserInfo();
    var userId = userInfo.userId;
    if(!me.data.isMe) {
      userId = me.data.publisherId;
    }
    var param = {
      page: page,
      pageSize: me.data.pageSize,
      userId: userId
    }
    mineApi.queryHomePageList(param).then(res => {
      var data = res.data.object;
      var myVideoList = data.rows;
      var newMyVideoList = me.data.myVideoList;
      me.setData({
        myVideoList: newMyVideoList.concat(myVideoList),
        myVideoPage: data.page,
        myVideoTotal: data.total
      })
    }).catch(err => {
      wx.showToast({
        title: '网络请求失败',
      })
    })
  },
  doSelectLike: function () {
    var me = this;
    me.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFalg:true,
      myLikesFalg:false,
      myFollowFalg:true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,
    });
    me.selectLike(1);
  },
  selectLike:function(page) {
    var me = this;
    var userInfo = app.getGlobalUserInfo();
    var userId = userInfo.userId;
    if (!me.data.isMe) {
      userId = me.data.publisherId;
    }
    var param = {
      page: page,
      pageSize: me.data.pageSize,
      userId: userId
    }
    mineApi.queryLikeVideo(param).then(res => {
      var data = res.data.object;
      var likeVideoList = data.rows;
      var newLikeVideoList = me.data.likeVideoList;
      me.setData({
        likeVideoList: newLikeVideoList.concat(likeVideoList),
        likeVideoPage: data.page,
        likeVideoTotal: data.total
      })
    }).catch(err => {
      wx.showToast({
        title: '网络请求失败',
      })
    })
  },
  doSelectFollow: function () {
    var me = this;
    me.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

    });
    me.selectFollow(1);
  },
  selectFollow:function(page) {
    var me = this;
    var userInfo = app.getGlobalUserInfo();
    var userId = userInfo.userId;
    if (!me.data.isMe) {
      userId = me.data.publisherId;
    }
    var param = {
      page: page,
      pageSize: me.data.pageSize,
      userId: userId
    }
    mineApi.queryFollowVideo(param).then(res => {
      var data = res.data.object;
      var followVideoList = data.rows;
      var newFollowVideoList = me.data.followVideoList;
      me.setData({
        followVideoList: newFollowVideoList.concat(followVideoList),
        followVideoPage: data.page,
        followVideoTotal: data.total
      })
    }).catch(err => {
      wx.showToast({
        title: '网络请求失败',
      })
    })
  },
  onReachBottom:function() {
    var me = this;
    var myWorkFlag = me.data.myWorkFalg;
    var myLikesFalg = me.data.myLikesFalg;
    var myFollowFalg = me.data.myFollowFalg;
    //如果展示的是个人的作品
    if(!myWorkFlag) {
      var currentPage = me.data.myVideoPage;
      var totalPage = me.data.myVideoTotal;
      //获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if(currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon:'none'
        });
        return;
      }
      var page = currentPage + 1;
      me.selectWork(page);
    }else if(!myLikesFalg) {
      var currentPage = me.data.likeVideoPage;
      var totalPage = me.data.likeVideoTotal;
      //获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if(currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: 'none'
        });
        return;
      }
      var page = currentPage + 1;
      me.selectLike(page);
    } else if (!myFollowFalg) {
      var currentPage = me.data.followVideoPage;
      var totalPage = me.data.followVideoTotal;
      //获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: 'none'
        });
        return;
      }
      var page = currentPage + 1;
      me.selectFollow(page);
    }
  },
  showVideo:function(e) {
    var me = this;
    var myWorkFlag = me.data.myWorkFalg;
    var myLikesFalg = me.data.myLikesFalg;
    var myFollowFalg = me.data.myFollowFalg;
    var videoList = [];
    if(!myWorkFlag) {
      videoList = me.data.myVideoList;
    } 
    else if(!myLikesFalg) {
      videoList = me.data.likeVideoList;
    } 
    else if(!myFollowFalg) {
      videoList = me.data.followVideoList;
    }
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);
    console.log(videoInfo);
    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo,
    })
  }
})
