// pages/login/login.js
Page({
  data: {
    email: '',
    password: ''
  },
  bindEmailInput: function (e) {
    this.setData({ email: e.detail.value })
  },
  bindPasswordInput: function (e) {
    this.setData({ password: e.detail.value })
  },
  login: function (e) {
    // wx.showToast({ title: '登录请求中', icon: 'loading', duration: 1000 });
    var app = getApp()
    var socketOpen = app.globalData.socketOpen
    if (socketOpen) {
      wx.closeSocket()
      app.globalData.socketOpen = false
    }
    if (!socketOpen) {
      wx.connectSocket({
        url: 'wss://www.datahunter.cn/ws/rpc',
      })
      //获得表单数据
      // var objData = e.detail.value;
      var that = this
      if (that.data.email && that.data.password) {
        // 同步方式存储表单数据
        wx.setStorageSync('userName', that.data.email);
        wx.setStorageSync('userPassword', that.data.password);
        wx.onSocketOpen(function (res) {
          app.globalData.socketOpen = true
          console.log('WebSocket连接已打开！', res);
          wx.sendSocketMessage({
            data: "{\"act\":\"user/login\",\"args\":{\"email\":\"" + that.data.email + "\",\"password\":\"" + that.data.password + "\"}}"
          })
        })

        //接收数据
        wx.onSocketMessage(function (res) {
          var objData = JSON.parse(res.data);
          console.log(objData);
          wx.setStorageSync('code', objData.code);
          wx.setStorageSync('userdata', objData);
          wx.setStorageSync('auth', objData.auth);
          wx.setStorageSync('cid', objData.cid);
          if (objData.code == 200) {
            wx.switchTab({
              url: '../../pages/mine/mine',
            });
          } else {
            wx.showModal({
              title: '登录失败', content: objData.msg, showCancel: false, success: function (res) {
              }
            });
          }
        })
        wx.onSocketError(function (res) {
          console.log('WebSocket连接打开失败，请检查！')
        })
      }
    }
  },
  //加载完后，处理事件 
  // 如果有本地数据，则直接显示
  onLoad: function (options) {
    //获取本地数据
    var userName = wx.getStorageSync('userName');
    var userPassword = wx.getStorageSync('userPassword');
    console.log(userName);
    console.log(userPassword);
    if (userName) {
      this.setData({ userName: userName });
    }
    if (userPassword) {
      this.setData({ userPassword: userPassword });
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})
