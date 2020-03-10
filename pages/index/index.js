const app = getApp()
var indexApi = require('./api.js')

Page({
  data: {
    screenWidth: 350,
    videoList: [],
    totalPage: 1,  //总页数
    records:1, //总记录数
    page: 1,
    pageSize: 5,
    serverUrl: "",
    searchContent:""
  },

  onLoad: function (params) {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    var serverUrl = app.serverUrl;
    me.setData({
      screenWidth: screenWidth,
      serverUrl: serverUrl
    });
    var searchContent = params.searchValue;
    var isSaveRecord = params.isSaveRecord;
    if(isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }
    if(searchContent == null || searchContent == '' || searchContent == undefined) {
      searchContent = '';
    }
    me.setData({
      searchContent: searchContent
    })
    var page = me.data.page;
    var pageSize = me.data.pageSize;
    me.getAllVideoList(page,pageSize,isSaveRecord)
  },

  getAllVideoList: function (page, pageSize, isSaveRecord) {
    var me = this;
    wx.showLoading({
      title: '请稍后,加载中...',
    })
    var newVideoList = me.data.videoList;
    var pageInputDTO = {
      page: page,
      pageSize: pageSize,
      isSaveRecord: isSaveRecord,
      desc:me.data.searchContent
    }
    indexApi.queryHomePageList(pageInputDTO).then(res => {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
      //若是第一页，则清空videoList中的数据
      if (page == 1) {
        this.setData({
          videoList: []
        })
      }
      var data = res.data.object;
      var newVideoList = me.data.videoList;
      var videoList = data.rows;
      me.setData({
        videoList: newVideoList.concat(videoList),
        page: data.page,
        totalPage: data.total,
        records: data.records
      });
    }).catch(err => {
      console.log(err);
    })
  },

  onPullDownRefresh: function() {
    wx.showNavigationBarLoading()
    var me = this;
    var page = 1;
    var pageSize = me.data.pageSize;
    this.getAllVideoList(page,pageSize,0);
  },

  onReachBottom:function() {
   var me = this;
   var currentPage = me.data.page;
   var totalPage = me.data.totalPage
   //判断当前页数和总页数是否相等，如果相等不需要查询
   if(currentPage === totalPage) {
     wx.showToast({
       title: '已经没有视频啦~~',
       icon: 'none'
     });
     return;
   }
   var page = currentPage + 1;
   var pageSize = me.data.pageSize;
   me.getAllVideoList(page,pageSize,0);
  },

  showVideoInfo: function(e) {
   var me = this;
   var videoList = me.data.videoList;
   var arrindex = e.target.dataset.arrindex;
   var videoInfo = JSON.stringify(videoList[arrindex]);
   
   wx.redirectTo({
     url: '../videoinfo/videoinfo?videoInfo= ' + videoInfo,
   })
  }

})
