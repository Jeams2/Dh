var API_URL = "https://www.datahunter.cn/rpc"
var requestHandler = {
  params: {},
  success: function (res) {
    // success
  },
  fail: function () {
    // fail
  },
}

//GET请求
function GET(requestHandler) {
  request('GET', requestHandler)
}
//POST请求
function POST(requestHandler) {
  request('POST', requestHandler)
}

function request(method, requestHandler) {
  //注意：可以对params加密等处理
  var params = requestHandler.params;

  wx.request({
    url: API_URL,
    data: params,
    method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    success: function (res) {
      //注意：可以对参数解密等处理
      requestHandler.success(res)
    },
    fail: function () {
      requestHandler.fail()
    },
    complete: function () {
      // complete
    }
  })
}




function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatLocation(longitude, latitude) {
  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}
function rpc(data,cb) {
  var app = getApp()
  var aaa = {}
  if (app.globalData.socketOpen) {
    wx.closeSocket()
    app.globalData.socketOpen = false
  }
  if (!app.globalData.socketOpen){
    wx.connectSocket({
      url: 'wss://www.datahunter.cn/ws/rpc',
    })
    wx.onSocketOpen(function (res) {
      app.globalData.socketOpen = true
      console.log('WebSocket连接已打开！', res);
      wx.sendSocketMessage({
        data: JSON.stringify(data)
      })
    })
    wx.onSocketMessage(function (res) {
      resData = JSON.parse(res.data)
      cb && cb(resData);
    })
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！')
    })
  }
  // return resData
}


function post(data,cb){
  var resdata
  wx.request({
    url: API_URL, 
    data: JSON.stringify(data),
    method:"POST",
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      resdata=res.data
      cb && cb(resData);
    }
  })
  return resdata
}

function strToJson(str) {
  return JSON.parse(str);
} 
function json2str(o) {
  var arr = [];
  var fmt = function (s) {
    if (typeof s == 'object' && s != null) return json2str(s);
    return /^(string|number)$/.test(typeof s) ? "\"" + s + "\"" : s;
  }
  for (var i in o) arr.push("\"" + i + "\":" + fmt(o[i]));
  return '{' + arr.join(',') + '}';
} 

module.exports = {
  formatTime: formatTime,
  formatLocation: formatLocation,
  rpc: rpc,
  strToJson: strToJson,
  json2str: json2str,
  GET:GET,
  POST:POST
}
