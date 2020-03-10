var request = require("../../utils/server.js")

module.exports = {
  logout: function(param) {
    return request('/logout', 'POST',param);
  },
  queryUserInfo: function(param) {
    return request('/user/queryUserInfo','GET',param);
  },
  followAuthor: function (param) {
    return request('/user/followAuthor', 'POST', param);
  },
  removeFollowAuthor: function (param) {
    return request('/user/removeFollowAuthor', 'POST', param);
  },
  queryHomePageList: function(param) {
    return request('/homePage/queryHomePageList','GET',param);
  },
  queryLikeVideo: function(param) {
    return request('/video/queryLikeVideo','GET',param);
  },
  queryFollowVideo: function(param) {
    return request('/video/queryFollowVideo','GET',param);
  }
}