var common = require('../../utils/util.js');
Page({
  data: {
    array: [],
    objectArray: [],
    index: 0,
    boardgroup: [],
  },
  bindPickerChange: function (e) {
    var auth = wx.getStorageSync("auth") 
    var cid = this.data.objectArray[e.detail.value].cid
    var data = {
      act: "boardgroup/list",
      args: {
        auth: auth,
        cid: cid,
      }
    }
    this.setdata(data)
 },
  onLoad: function (e) {
    this.code = wx.getStorageSync('code');
    if (this.code != 200) {
      wx.redirectTo({
        url: '../../pages/login/login',
        success: function () {

        }
      });
    }
    var corp = wx.getStorageSync("userdata").corp
    var obj = []
    var arr = []
    
    for (var i = 0; i < corp.length; i++) {
      var cid
      cid = corp[i]._id
      var name = corp[i].name
      var a = {
        "cid": cid,
        "name": name
      }
      arr.push(name)
      obj.push(a)
    }
    this.setData({
      array: arr,
      objectArray: obj,
    })
    var auth = wx.getStorageSync("auth")
    var cid = this.data.objectArray[0].cid
    var data = {
      act: "boardgroup/list",
      args: {
        auth: auth,
        cid: cid,
      }
    }
    this.toPost(data)
  },

  toPost:function(data){
    var that = this
    common.POST(
      {
        params: data,
        success: function (res) {
          var objData = res.data;
          
          var list = objData.msg.list
          var obj = []
          for (var i = 0; i < list.length; i++) {
            var cid = list[i].cid
            var _id = list[i]._id
            if (typeof (_id) == "undefined") {
              _id = 0
            }
            var name = list[i].name
            if (list[i].default == 1) {
              name = "默认分组"
            }
            var len = list[i].did.length
            var a = {
              "_id": _id,
              "cid": cid,
              "name": name,
              "len": len
            }
            obj.push(a)
          }
          that.setData({
            boardgroup: obj,
          })
        },
      })
  },
  toBoard:function(e){
    var ds = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../../pages/board/board?_id='+ ds.id+"&cid="+ds.cid,
      success: function (res) {
        console.log(res)
      },
      fail: function (err) {
        console.log(err)
      }
    });
  }
})
