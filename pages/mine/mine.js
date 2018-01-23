var app = getApp()
Page({
  data: {
    username :'',
    email: '',
    mobile: '',
    code:'',
  },
  onLoad: function (options) {
    this.code = wx.getStorageSync('code');
    if (this.code != 200){
      wx.redirectTo({
        url: '../../pages/login/login',
        success: function () {
          
        }
      });
    }else{
      var userdata = wx.getStorageSync('userdata');
      this.mobile = userdata.corp[0].mid[0].mobile;
      this.email = userdata.corp[0].mid[0].email;
      this.username = userdata.corp[0].mid[0].name;
      this.setData({
        email: this.email,
        mobile: this.mobile,
        username: this.username
      })
    }
  },
  logout: function (e) {
    wx.clearStorage()
    wx.redirectTo({
      url: '../../pages/login/login',
    });
  }
})