var request = require("../../utils/server.js")

module.exports = {
 
  userLike:function(param) {
    return request('/video/userLike','POST',param);
  },
  userUnLike: function (param) {
    return request('/video/userUnLike', 'POST', param);
  },
  queryUserLikeStatus:function(param) {
    return request('/video/queryUserLikeStatus','POST',param);
  },
  userComment:function(param) {
    return request('/video/userComment','POST',param);
  },
  queryCommentList(param) {
    return request('/comment/queryCommentList','POST',param);
  }
}