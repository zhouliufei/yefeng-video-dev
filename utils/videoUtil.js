function uploadVideo() {
  var me = this;
  wx.chooseVideo({
    sourceType: ['album'],
    success: function (res) {
      var videoInfo = {
        duration: res.duration,
        height: res.height,
        width: res.width,
        tmpVideoUrl: res.tempFilePath,
        tmpCoverUrl: res.thumbTempFilePath
      }
      if (videoInfo.duration > 61) {
        wx.showToast({
          title: '视频长度不能超过60秒...',
          icon: "none",
          duration: 2500
        })
      }
      else if (videoInfo.duration < 1) {
        wx.showToast({
          title: '视频长度不能少于1秒...',
          icon: "none",
          duration: 2500
        })
      }
      else {
        //TODO 打开bgm选择页
        wx.navigateTo({
          url: '../chooseBgm/chooseBgm?videoInfo=' + JSON.stringify(videoInfo),
        })
      }

    }
  })
}

module.exports = {
  uploadVideo: uploadVideo
}
