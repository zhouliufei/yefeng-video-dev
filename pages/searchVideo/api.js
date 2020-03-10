var request = require("../../utils/server.js")

module.exports = {
  queryHomePageList: function (param) {
    return request('/homePage/queryHomePageList', 'GET', param);
  },
  queryHot: function () {
    return request('/homePage/queryHot', 'GET');
  }
}