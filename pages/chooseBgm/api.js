var request = require("../../utils/server.js")

module.exports = {
  queryBgmList:function() {
    return request('/bgm/queryBgmList','GET')
  }
}


