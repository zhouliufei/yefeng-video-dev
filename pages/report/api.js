var request = require("../../utils/server.js")

module.exports = {
  reportUser: function (param) {
    return request('/user/reportUser', 'POST', param);
  }
}