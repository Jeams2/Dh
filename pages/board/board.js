// pages/board/board.js
var common = require('../../utils/util.js');
var wxCharts = require('../../utils/wxcharts.js');
var auth = wx.getStorageSync("auth")

Page({
  data: {
      array:[],
      canvas_id:[]
  },
  onLoad: function (option) {
    var data = {
      act: "boardgroup/get",
      args: {
        auth: auth,
        cid: option.cid,
        _id: option._id,
      }
    }
    this.setdata(data) 
  },

  onReady: function (e) {
   
  },

  setdata: function (data){
    var that = this
    common.POST(
      {
        params: data,
        success: function (res) {
          var objData = res.data;
          if (objData.msg.did.length == 0) {
            //todo
          } else {
            var did = objData.msg.did
            var obj = []
            for (var i = 0; i < did.length; i++) {
              var a = {
                "name": did[i].name,
                "cid": did[i].uid,
                "_id": did[i]._id,
              }
              obj.push(a)
            }
            that.setData({
              array: obj
            })
          }
        },
      })
  },

  getBroad:function(e){
    var that = this
    var ds = e.currentTarget.dataset;
    var auth = wx.getStorageSync("auth")
    var data = {
      act: "dashboard/get",
      args:{
        auth: auth,
        cid: ds.cid,
        _id: ds.id ,
      }
    }
 
    common.POST(
      {
        params: data,
        success: function (res) {
          var objData = res.data;
          var widget = objData.msg.widget
          var arra = []
          for (var i = 0; i < objData.msg.widget.length; i++) {  
            var con =common.strToJson(objData.msg.widget[i].config) 
            var a ={
              id: objData.msg.widget[i]._id,
              type: con.type
            }          
            arra.push(a)          
          }
          that.setData({
            canvas_id: arra
          })
          for (var i = 0; i < objData.msg.widget.length; i++) {
            var canvas = objData.msg.widget[i]._id
            var config = common.strToJson(objData.msg.widget[i].config)       
            if (config.type == "Bar") {
              config.type = "column"
              that.toColum(config, ds.cid, config.sid,canvas)
            } else if (config.type == "Pie"){
              if (config.option.pieType == "circle"){
                config.type = "ring"
              }else{
                config.type = "pie"
              }
              that.toPie(config, ds.cid, config.sid, canvas)
            } else if (config.type == "Line") {
              config.type = "line"
              that.toLine(config, ds.cid, config.sid, canvas)
            } else if (config.type == "Area"){
              config.type = "area"
              that.toColum(config, ds.cid, config.sid, canvas)
            } else if (config.type == "Number"){
              that.toNumber(config, ds.cid, config.sid, canvas)
            }
          } 
        },
      })
  },
  toNumber: function (config, cid, _id, canvas){
    var data = this.forData(config, cid, _id, canvas)
    common.POST(
      {
        params: data,
        success: function (res) {
          var objData = res.data;
          var numbers
          var myjson =objData.msg[0]
          for (var p in myjson) {
            numbers = myjson[p]
          }
          console.log("aaaaa",numbers)
        }
      })
  },

  toLine: function (config, cid, _id, canvas){
    var data = this.forData(config, cid, _id, canvas)
    common.POST(
      {
        params: data,
        success: function (res) {
          var objData = res.data;
          var windowWidth = 320;
          try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
          } catch (e) {
            console.error('getSystemInfoSync failed!');
          }


          var json = objData.msg[0]
          var keys = []
          for (var p in json) {
            keys.push(p)
          }


          var series = []
          var categories = []
          for (var j = 0; j < keys.length - 1; j++) {
            var data = []
            var name = []
            for (var i = 0; i < objData.msg.length; i++) {
              var myjson = objData.msg[i]
              var a = keys[keys.length - 1]
              var b = keys[j]
              name.push(myjson[a])
              data.push(myjson[b])

            }
            if (j == 0) {
              categories = name
            }
            var a = {
              name: name,
              data: data,
              format: function (val, name) {
                val = val / 1000000
                return val.toFixed(0) + 'M';
              }
            }
            series.push(a)
          }
          new wxCharts({
            canvasId: canvas,
            type: "line",
            animation: true,
            categories: categories,
            series: series,
            yAxis: {
              format: function (val) {
                val = val / 1000000
                return val.toFixed(0) + 'M';
              },
              title: config.metric[0].name,
              min: 0
            },
            xAxis: {
              disableGrid: false,
              type: 'calibration'
            },
            extra: {
              lineStyle: config.option.lineType,
              column: {
                width: 15
              }
            },
            width: windowWidth,
            height: 200,
          });
        }
      })
  },

  toPie: function (config, cid, _id, canvas) {
    var data = this.forData(config, cid, _id, canvas)
    common.POST(
      {
        params: data,
        success: function (res) {
          var objData = res.data;
          var windowWidth = 320;
          try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
          } catch (e) {
            console.error('getSystemInfoSync failed!');
          }

          var data = []
          var json = objData.msg[0]
          var keys = []
          for (var p in json) {
            keys.push(p)
          }
          for (var i = 0; i < objData.msg.length; i++) {
            var myjson = objData.msg[i]
            var a = keys[0]
            var b = keys[1]
            var c = {
              name: myjson[b],
              data: myjson[a]
            }
            data.push(c)
          }
          new wxCharts({
            animation: true,
            canvasId: canvas,
            type: config.type,
            series: data,
            width: windowWidth,
            height: 300,
            dataLabel: true,
          });
          
        }
      })
  },
  toColum: function (config, cid, _id,canvas){
    var data = this.forData(config, cid, _id, canvas)
    common.POST(
      {
        params: data,
        success: function (res) {
          var objData = res.data;
          var windowWidth = 320;
          try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
          } catch (e) {
            console.error('getSystemInfoSync failed!');
          }

          
          var json = objData.msg[0]
          var keys = []
          for (var p in json) {
            keys.push(p)
          }


          var series = []
          var categories = []
          for (var j = 0; j < keys.length - 1; j++) {
            var data = []
            var name = []
            for (var i = 0; i < objData.msg.length; i++) {
              var myjson = objData.msg[i]
              var a = keys[keys.length-1]
              var b = keys[j]
              name.push(myjson[a])
              data.push(myjson[b])
              
            }
            if (j == 0) {
              categories = name
            }
            var a = {
              name: name,
              data: data,
              format: function (val, name) {
                val = val / 1000000
                return val.toFixed(0) + 'M';
              }
            }
            series.push(a)
          }
          new wxCharts({
            canvasId: canvas,
            type: config.type,
            animation: true,
            categories: categories,
            series: series,
            yAxis: {
              format: function (val) {
                val = val / 1000000
                return val.toFixed(0) + 'M';
              },
              title: config.metric[0].name,
              min: 0
            },
            xAxis: {
              disableGrid: false,
              type: 'calibration'
            },
            extra: {
              column: {
                width: 15
              }
            },
            width: windowWidth,
            height: 200,
          });
        }
     })
  },
  forData:function(config, cid, _id,canvas){
    var field = []
    var metric = config.metric
    var dimension = config.dimension
    for (var i = 0; i < metric.length; i++) {
      var met = {
        o: metric[i].field,
        table: metric[i].table,
        itemKey: metric[i].key,
        as: metric[i].table + "_" + metric[i].key,
        func: metric[i].func,
      }
      field.push(met)
    }
    for (var i = 0; i < dimension.length; i++) {
      if (dimension[i].type=="date"){
        var date = dimension[i].date
        dimension[i].func = "to_char"
        if (date == "year"){
          dimension[i].param = "YYYY年"
        }else if (date == "month"){
          dimension[i].param = "YYYY年MM月"
        }else if (date == "day") {
          dimension[i].param = "YYYY年MM月DD日"
        }else if (date == "hour") {
          dimension[i].param = "YYYY年MM月DD日 HH:00"
        }else if (date == "minute") {
          dimension[i].param = "YYYY年MM月DD日 HH:00:MI"
        }else if (date == "second") {
          dimension[i].param = "YYYY年MM月DD日 HH:00:MI"
        }
      }
      var dim = {
        o: dimension[i].field,
        table: dimension[i].table,
        order: dimension[i].order,
        itemKey: dimension[i].key,
        as: dimension[i].table + "_" + dimension[i].key,
        func: dimension[i].func,
        group: dimension[i].condition.length,
        param: dimension[i].param,
      }
      if (dim["order"] == "default") {
        dim["order"] = '';
      }
      field.push(dim)
    }
   
    var data = {
      act: "datasource/data",
      args: {
        auth: auth,
        cid: cid,
        _id: _id,
        where: [],
        logic: null,
        join: [],
        token: "",
        field: field
      }
    }
    return data
  }
})

