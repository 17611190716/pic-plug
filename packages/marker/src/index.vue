<template>
  <div
    id="whiteboard"
    class="whiteboard"
    ref="whiteboard"
    :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
  >
    <Toolbar
      @toolType="handleToolType"
      @lineType="handleLineType"
      @lineWidth="handleLineWidth"
      @fontSize="handleFontSize"
      @textType="handleTextType"
      @eraserSize="handleEraserSize"
      @lineColor="handleLineColor"
    />
  </div>
</template>
<script>
import Toolbar from "./toolbar.vue"; //工具栏组件
import {
  Canvas,
  drawSquare,
  drawCircle,
  // drawLine,
  drawFont,
  drawOneArrowLine,
  // drawTwoArrowLine,
  // getStartArrowPoints,
  editEndPoint,
  // getEndArrowPoints,
  downloadFile,
  base64Img2Blob,
  // getBase64ByUrl
} from "./index.js"; //canvas构造函数
export default {
  name:'pic-marker',
  data() {
    return {
      toolType: 0, //工具类型：0画笔，1矩形，2圆形，3单箭头，4文字,5撤销，6下载，7，返回，8保存
      lineType: 0, //线条类型：0直线，1单箭头直线，2双箭头直线
      textType: 0, //文字输入方向：0横向。2竖向
      fontSize: 16, //字体大小
      lineColor: "#000000", //画笔颜色
      pathList: [],
      whiteboard: {
        // sum: 0
      },
      tabNum: 1, //白板总编号
      canvasWidth: 0, //画布宽
      canvasHeight: 0, //画布高
      canvasAry: {}, //存放所有的canvas对象

      shapeBeginPoint: [], //图形开始点
      state: false, //鼠标按下和松开的状态：true按下，false松开
      //  moveFlag : false,//鼠标在左键按下后在页面上移动的标示：true移动过，false未移动
      candbclickFlag: false, //判断是否可以双击添加
      //默认设置
      font_family: "Arial", //字体
      config: {
        lineWidth: 3, //画笔宽度
        strokeStyle: "#000000", //画笔颜色
        backgroundColor: "rgba(255,255,255,1)" //背景颜色
      },
      preDrawAry: [], //存储当前表面状态数组-上一步
      nextDrawAry: [], //存储当前表面状态数组-下一步
      middleAry: [], //中间数组
      pathObjs: [], //路径对象数组
      aryObj: {},
      closeTabNum: 0, //待关闭的页签编号
      tabNumNow: 1, //当前选中的白板的编号
      hoverFlag: false, //hover状态标记
      zoomFlag: null, //缩放状态标记
      chooseIndex: null, //选择框索引
      moving: {
        x: 0,
        y: 0
      }, //拖动距离
      travelList: [], //时光旅行 记录撤销点
      canvasElement: null
    };
  },
  components: {
    Toolbar
  },
  props: {
    picUrl: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    changeCursor(toolType) {
      if (!toolType) toolType = this.toolType;
      // var cvs = document.getElementById("picanvas");
      if (!this.canvasElement) return;
      // console.log(`toolType=`, toolType);
      if (toolType === 0) {
        this.canvasElement.className = "canvas_pencil";
      } else if (toolType <= 3) {
        this.canvasElement.className = "canvas_crosshair";
      } else if (toolType === 4) {
        this.canvasElement.className = "canvas_text";
      } else {
        this.canvasElement.className = "";
      }
    },
    handleToolType(payload) {
      //调整鼠标指针类型
      this.changeCursor(payload);
      this.toolType = payload;
      if (payload === 5) {
        // console.log("撤销操作", this.travelList);
        let len = this.travelList.length;
        if (len > 0) {
          this.travelList.splice(len - 1, 1);
          let copy = len > 1 ? this.travelList[len - 2] : [];
          this.pathObjs = JSON.parse(JSON.stringify(copy));
          // console.log("this.pathObjs", this.pathObjs);
          this.oCanvas._repaint(this.oCanvas.context, this.pathObjs, "normal");
        }
      } else if (payload === 6) {
        //下载图片
        this.saveImage();
      } else if (payload === 7) {
        //关闭
        this.$emit("close");
      } else if (payload === 8) {
        //完成
         var canvas = document.getElementById("picanvas");
        const base64=canvas.toDataURL("image/png")
        this.$emit("copy",{base64Date:base64});
        // 复制到粘贴板
        //  this.copy2ClidBord()
      }
    },
    copy2ClidBord(){
      var canvas = document.getElementById("picanvas");
      const base64=canvas.toDataURL("image/png")

      let imgHtmlDiv= document.createElement('div')
      imgHtmlDiv.id='imgHtmlDiv'
      imgHtmlDiv.setAttribute('contenteditable','true') 

      let imgHtml= document.createElement('img')
      
      // imgHtml.src=base64
      imgHtml.src='http://pic27.nipic.com/20130313/9252150_092049419327_2.jpg'
      console.log(imgHtml.src)
      imgHtml.id='base64Img'
      
      document.body.appendChild(imgHtmlDiv)
      document.getElementById('imgHtmlDiv').appendChild(imgHtml)
      this.$nextTick(()=>{
          var range = document.createRange();  
          range.selectNode(document.getElementById('base64Img')); 
          let section= window.getSelection()
          section.removeAllRanges(); //必须先清除选中的区域
          section.addRange(range)//然后添加区域
          document.execCommand('copy')
          // console.log(document.execCommand)
      })
    },
    handleLineType(payload) {
      this.lineType = payload;
    },
    handleLineWidth(payload) {
      this.config.lineWidth = payload;
    },
    handleFontSize(payload) {
      this.fontSize = payload;
    },
    handleTextType(payload) {
      this.textType = payload;
    },
    handleEraserSize(payload) {
      this.eraserSize = payload;
    },
    handleLineColor(payload) {
      this.lineColor = payload;
    },
    init() {
      var img = new Image();
      img.crossOrigin = "Anonymous";
      // console.log(img)
      img.onload = e => {
        const width = e.path[0].width;
        const height = e.path[0].height;
        // 将图片画到canvas上面上去！
        this.canvasWidth = width; //画布宽
        this.canvasHeight = height; //画布高
        this.imgObj = img;
        var canvas = this.createCanvas(img);
        this.oCanvas = canvas;
      };
        img.onerror = ()=> {
        //  console.error(err);
        alert('图片加载失败！')
      };
      img.src = this.picUrl;
    },
    createCanvas(img) {
      //创建canvas
      var cvs = document.createElement("canvas");
      this.canvasElement = cvs;
      cvs.setAttribute("id", "picanvas");
      //设置光标样式
      this.$nextTick(() => {
        this.changeCursor();
      });
      //设置其他属性
      // console.log(cvs, this.canvasWidth, this.canvasHeight);
      cvs.width = this.canvasWidth;
      cvs.height = this.canvasHeight;
      var ctx = cvs.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);
      cvs.addEventListener("mousedown", this.handleMouseDown, false);
      cvs.addEventListener("mousemove", this.handleMouseMove, false);
      cvs.addEventListener("mouseup", this.handleMouseUp, false);
      cvs.addEventListener("mouseleave", this.handleMouseUp, false);
      cvs.addEventListener("dblclick", this.handleDblclick, false);

      cvs.addEventListener(
        "contextmenu",
        function() {
          window.event.returnValue = false;
          return false; //屏蔽右键菜单
        },
        false
      );
      //添加到页面上
      document.getElementById("whiteboard").appendChild(cvs);
      //新建一个canvas对象
      var canvas = new Canvas(cvs);
      Canvas.prototype.canvasWidth = this.canvasWidth;
      Canvas.prototype.canvasHeight = this.canvasHeight;
      Canvas.prototype.imgObj = img;
      return canvas;
    },
    drawPoint(point) {
      if (point == null) {
        return;
      }
      //获取用户对象点数组对象
      var points;
      points = this.pathList;
      this.oCanvas.context.lineWidth = this.config.lineWidth;
      this.oCanvas.context.strokeStyle = this.config.strokeStyle = this.lineColor;
      //绘制
      if (points.length == 0) {
        this.oCanvas.context.beginPath();
        this.oCanvas.context.moveTo(point[0], point[1]);
        this.oCanvas.context.stroke();
      } else {
        //数组中最后一个点
        var lastMouse = points[points.length - 1];
        if (!lastMouse) {
          return;
        }
        this.oCanvas.context.beginPath();
        this.oCanvas.context.moveTo(lastMouse[0], lastMouse[1]);
        //描绘至当前点
        this.oCanvas.context.lineTo(point[0], point[1]);
        this.oCanvas.context.closePath();
        // 设置线的圆角
        this.oCanvas.context.lineCap = "round";
        // 只针对转角处，两条线的交接点
        this.oCanvas.context.lineJoin = "round";
        this.oCanvas.context.stroke();
      }
      //将点加入数组中
      this.pathList.push([point[0], point[1]]);
    },
    //将白板内容保存为图片
    saveImage() {
      var canvas = document.getElementById("picanvas");
      var imageName = "白板" + new Date().getTime(); //图片名
      //下载
      downloadFile(imageName, canvas.toDataURL("image/png"));
    },
    //白板竖行输出
    //t:文本内容 x:x坐标 y:y坐标 w:输出框宽度 s:字号
    drawText(t, x, y, s, c) {
      var chr = t.split("");
      var row = [];
      for (var a = 0; a < chr.length; a++) {
        row.push(chr[a]);
      }
      for (var b = 0; b < row.length; b++) {
        c.fillText(row[b], x, y + b * s);
      }
    },

    /* ************************************************** 鼠标按下、拖动、抬起事件 ***************************************************** */
    handleDblclick(evt) {
      //双击事件
      let point = this.oCanvas._getMouseCoords(evt);
      const { flag, index, isFont } = this.isOnLine(point);
      if (flag && isFont) {
        //双击了文本框
        // console.log(`双击了文本框`, index);
        // 找到文本框的第一个点
        const { points, config } = this.pathObjs[index];
        this.creatInput(points[0], index, config);
        this.pathObjs.splice(index, 1);
        this.oCanvas._repaint(
          this.oCanvas.context,
          this.pathObjs,
          "cancleSelected"
        );
        this.chooseIndex = null;
      }
    },
    creatInput(point, replaceIndex = null, config = {}) {
      //创建横向文本框
      var input1 = document.createElement("input");
      input1.value = config.value ? config.value : "";
      input1.style.zIndex = 5;
      input1.setAttribute("id", "textInput");
      input1.setAttribute("type", "text");
      input1.style.fontFamily = config.font_family
        ? config.font_family
        : this.font_family;
      input1.style.fontSize = config.fontSize
        ? config.fontSize + "px"
        : this.fontSize + "px";
      input1.style.color = config.lineColor ? config.lineColor : this.lineColor;
      input1.style.border = "1px solid red";
      //设定位置
      input1.style.top = String(point[1]) + "px";
      input1.style.left = String(point[0]) + "px";
      //添加到页面上
      document.getElementById("whiteboard").appendChild(input1);
      //默认输入焦点
      // input1.focus();
      setTimeout(function() {
        input1.focus();
      }, 0);
      var f = true;
      //失去焦点事件
      input1.onblur = () => {
        // console.log(`失去焦点事件`);
        var value = input1.value;
        if (value == null || value == "") {
          if (f) {
            input1.remove(); //移除input
            this.oCanvas._window = []; //清空变量
          } else {
            input1.remove(); //移除input
            this.oCanvas._window = []; //清空变量
          }
        } else {
          //将对应的内容输出到canvas上
          // 获取文字区域
          // console.log(input1.clientWidth, input1.clientHeight);
          //添加到pathObjs
          let aline = drawFont(
            this.oCanvas.context,
            point,
            input1.clientWidth,
            input1.clientHeight,
            this.fontSize,
            this.font_family,
            this.lineColor,
            value
          );
          if (replaceIndex === 0 || replaceIndex) {
            this.pathObjs.splice(
              replaceIndex,
              1,
              Object.assign({}, aline, { printType: 4 })
            );
          } else {
            this.pathObjs.push(Object.assign({}, aline, { printType: 4 }));
          }

          //移除input
          input1.remove();
          //绘制
          // this.oCanvas._repaint(this.oCanvas.context, this.pathObjs);
          //记录时间旅行
          const copy = JSON.parse(JSON.stringify(this.pathObjs));
          this.travelList.push(copy);
          //清空变量
          this.oCanvas._window = [];
        }
      };
    },
    //鼠标按下触发
    handleMouseDown(evt) {
      //验证
      if (evt.which != 1) {
        this.state = false;
        return; //鼠标不是左键按下就返回
      }
      // if (this.toolType <= 4) {
      //获取点位置
      let point = this.oCanvas._getMouseCoords(evt);
      //修改鼠标按下标识
      this.state = true;
      // 判断是否点击在线上
      if (this.hoverFlag) {
        //如果已经处于hover状态 点击hover框
        // 如果有空input则删除
        // console.log("点击hover框");
        const { flag, index } = this.isOnLine(point);
        if (flag) {
          this.chooseIndex = index;
          this.oCanvas._repaint(
            this.oCanvas.context,
            this.pathObjs,
            "click",
            index
          );
        }
      } else if (!document.getElementById("textInput")) {
        //取消选中重绘
        // 存在input情况下
        // console.log("111", this.zoomFlag, this.chooseIndex);
        if (!this.zoomFlag && this.chooseIndex !== null) {
          this.chooseIndex = null;
          this.oCanvas._repaint(
            this.oCanvas.context,
            this.pathObjs,
            "cancleSelected"
          );
        }
        //添加文字模式
        if (this.toolType == 4) {
          //获取点位置
          this.creatInput(point);
        } else if (this.toolType > 0) {
          //添加图形模式、添加线条模式
          //创建临时canvas
          var c = document.createElement("canvas");
          c.id = "shapeCanvas";
          c.width = this.canvasWidth;
          c.height = this.canvasHeight;
          c.style.position = "absolute";
          c.style.top = "0px";
          c.style.left = "0px";
          c.addEventListener("mousemove", this.handleShapeMouseMove, false);
          c.addEventListener("mouseup", this.handleShapeMouseUp, false);
          c.addEventListener("mouseleave", this.handleShapeMouseUp, false);

          document.getElementById("whiteboard").appendChild(c); //添加到页面上
          this.shapeBeginPoint = this.oCanvas._getMouseCoords(evt); //赋值图形开始点
        } else if (this.toolType == 0) {
          //本地绘制
          this.drawPoint(point);
        }
      }
      // }
    },
    getCircleEquation(item, target) {
      //  通过圆心坐标及半径 求出圆形方程
      const { points, r } = item;
      const x = points[0][0];
      const y = points[0][1];
      const a = target[0];
      const b = target[1];

      // console.log(`求出圆形方程`, r, points);
      //x^2+y^2=r^2所表示的曲线是以O(0，0)为圆心，以r为半径的圆；

      const accuracy = Math.abs(
        Math.pow(x - a, 2) + Math.pow(y - b, 2) - Math.pow(r, 2)
      );
      if (accuracy < 1000) {
        // 在圆上
        // console.log(`accuracy`, accuracy);
        return true;
      } else {
        return false;
      }
    },
    // 通过两个点坐标 求出直线方程
    getLineEquation(point1, point2, point) {
      const pointX = point[0];
      const pointY = point[1];
      const point1X = point1[0];
      const point1Y = point1[1];
      const point2X = point2[0];
      const point2Y = point2[1];
      // console.log(point1X, point2X, pointX);
      // console.log(point1Y, point2Y, pointY);
      let slope;
      if (point1X === point2X) {
        slope = 0;
      } else {
        slope = (point1Y - point2Y) / (point1X - point2X);
      }

      let flag = false;
      // console.log(`point`, pointX, point1X, point2X);
      // 先判断是否在两点上
      if (Math.abs(point1X - pointX) <= 3 && Math.abs(point1Y - pointY) <= 3) {
        return true;
      } else if (
        Math.abs(point2X - pointX) <= 3 &&
        Math.abs(point2Y - pointY) <= 3
      ) {
        return true;
      }
      if (point1X - point2X == 0) {
        //竖向线段
        if (Math.abs(pointX - point1X) <= 3) {
          if (
            (point1Y >= pointY && pointY >= point2Y) ||
            (point1Y <= pointY && pointY <= point2Y)
          ) {
            flag = true;
          }
        }
      } else if (point1X - point2X < 0) {
        // console.log(`point2`, pointX, point1X, point2X);
        // console.log(point, point1, point2);
        if (pointX >= point1X && pointX <= point2X) {
          //x在范围内
          let y = (pointX - point1X) * slope + point1Y;
          // console.log(`y`, y, pointY);
          if (Math.abs(pointY - y) <= 3) {
            flag = true;
          }
        }
      } else {
        if (pointX >= point2X && pointX <= point1X) {
          //x在范围内
          let y = (pointX - point1X) * slope + point1Y;
          if (Math.abs(pointY - y) <= 3) {
            flag = true;
          }
        }
      }
      return flag;
    },
    //判断点是否在线段上或者文字区域内
    isOnLine(point) {
      var flag = false;
      var index = null;
      var isFont = false;
      this.pathObjs.some((item, i) => {
        if (item.printType == 1) {
          //直线
          // 通过直线方程判断是否在线上
          let points = item.points;
          points.some((itemChild, idx) => {
            if (idx >= points.length - 1) return true;
            // console.log(itemChild[0], points[idx + 1][0], point[0]);
            if (this.getLineEquation(itemChild, points[idx + 1], point)) {
              flag = true;
              index = i;
              return true;
            }
          });
        } else if (item.printType == 2) {
          //曲线
          item.points.map(itemChild => {
            if (
              Math.abs(point[0] - itemChild[0]) < 10 &&
              Math.abs(point[1] - itemChild[1]) < 10
            ) {
              flag = true;
              index = i;
              return true;
            }
          });
        } else if (item.printType == 3) {
          //圆形
          // 通过圆形方程判断是否在线上
          if (this.getCircleEquation(item, point)) {
            flag = true;
            index = i;
            return true;
          }
        } else if (item.printType == 4) {
          // console.log("文字");
          //文字
          const limit = item.points;
          const left = limit[0][0];
          const top = limit[0][1];
          const right = limit[2][0];
          const bottom = limit[2][1];
          if (
            point[0] > left &&
            point[0] < right &&
            point[1] > top &&
            point[1] < bottom
          ) {
            //在文字框范围内
            flag = true;
            isFont = true;
            index = i;
            return true;
          }
        }
      });
      return { flag, index, isFont };
    },
    //鼠标在画板上移动触发
    handleMouseMove(evt) {
      //获取点位置
      var point = this.oCanvas._getMouseCoords(evt);
      //验证
      if (!this.state) {
        //鼠标松开状态下的移动
        /*判断是否hover了某条线段 开始*/
        const { flag, index } = this.isOnLine(point);
        if (flag) {
          //如果鼠标靠近了某条曲线 或者在文字框内 则显示hover框
          this.hoverFlag = true;
          //重绘所有曲线
          this.oCanvas._repaint(
            this.oCanvas.context,
            this.pathObjs,
            "hover",
            index
          );
        } else {
          //当鼠标远离任何曲线时 取消hover框 重绘所有曲线
          if (this.hoverFlag) {
            //只有this.hoverFlag第一次改变时 重绘一次 避免一直重绘
            this.hoverFlag = !this.hoverFlag;
            this.oCanvas._repaint(
              this.oCanvas.context,
              this.pathObjs,
              "normal"
            );
            this.changeCursor();
          }
        }
        /*判断是否hover了某条线段 结束*/
        /*判断是否hover了选择框 开始*/
        if (this.chooseIndex !== null) {
          let list = this.oCanvas._getSelectedBox(
            this.oCanvas.context,
            this.pathObjs
          );
          this.zoomFlag = null;
          list.forEach((item, i) => {
            if (
              point[0] - item[0] >= 0 &&
              point[0] - item[1] <= 0 &&
              point[1] - item[2] >= 0 &&
              point[1] - item[3] <= 0
            ) {
              //hover在选择框区域 从左上角依次
              //标记缩放状态
              this.zoomFlag = i;

              let cursor = null;
              switch (i) {
                case 0:
                  cursor = "nw-resize";
                  break;
                case 1:
                  cursor = "n-resize";
                  break;
                case 2:
                  cursor = "ne-resize";
                  break;
                case 3:
                  cursor = "w-resize";
                  break;
                case 4:
                  cursor = "se-resize";
                  break;
                case 5:
                  cursor = "s-resize";
                  break;
                case 6:
                  cursor = "sw-resize";
                  break;
                case 7:
                  cursor = "w-resize";
                  break;
              }
              document.getElementById("picanvas").style.cursor = cursor;
            }
          });
          if (this.zoomFlag === null) {
            if (document.getElementById("picanvas").style.cursor) {
              //取消缩放鼠标指针
              // console.log("取消缩放鼠标指针");
              document.getElementById("picanvas").style.cursor = "";
              this.changeCursor();
            }
          }
        }
        /*判断是否hover了选择框 结束*/
      } else {
        //鼠标按下左键状态的移动
        if (
          this.hoverFlag &&
          this.chooseIndex != null &&
          this.zoomFlag === null
        ) {
          // console.log("移动选择框");
          let point = this.oCanvas._getMouseCoords(evt);
          var distance = {
            x: 0,
            y: 0
          };
          if (this.moving.x === 0) {
            //刚开始移动 记录初始点
            this.moving.x = point[0];
            this.moving.y = point[1];
          } else {
            //拖动选择框的距离
            distance.x = point[0] - this.moving.x;
            distance.y = point[1] - this.moving.y;
            this.moving.x = point[0];
            this.moving.y = point[1];
            // console.log("distance:", distance.x, distance.y);
            this.pathObjs[this.chooseIndex].points.map(item => {
              item[0] += distance.x;
              item[1] += distance.y;
            });
            //普通重绘
            this.oCanvas._repaint(
              this.oCanvas.context,
              this.pathObjs,
              "hover",
              this.chooseIndex
            );
          }
        } else if (this.zoomFlag !== null) {
          // console.log("拉伸选择框");
          //拉伸框计算
          this.handleZoom(this.zoomFlag, point);
          return;
        } else {
          //绘制
          this.drawPoint(point);
        }
        // }
      }
    },
    //鼠标松开触发
    handleMouseUp() {
      if (!this.state) {
        return;
      }
      //重置变量
      this.state = false;
      //画笔模式
      // if (this.toolType == 0) {
      if (this.moving.x > 0) {
        //拖动状态结束 重置变量
        this.moving.x = 0;
        this.moving.y = 0;
      } else if (this.pathList.length && this.pathList.length > 1) {
        //新建图形结束
        const points = this.pathList;
        const config = JSON.parse(JSON.stringify(this.config));
        this.pathObjs.push({
          points: points,
          config: config,
          printType: 2
        });
        // console.log('this.config.lineWidth:',this.config.lineWidth)
        this.oCanvas._repaint(this.oCanvas.context, this.pathObjs, "normal");
        this.changeCursor();
        //记录时间旅行
        const copy = JSON.parse(JSON.stringify(this.pathObjs));
        this.travelList.push(copy);
      }
      this.pathList = [];
      this.oCanvas._window = [];
      // }
    },

    //图形canvas上的mousemove事件触发
    handleShapeMouseMove(evt) {
      //获取点位置
      var point = this.oCanvas._getMouseCoords(evt);
      //获取画笔对象
      var c = document.getElementById("shapeCanvas");
      var ctx = c.getContext("2d");
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight); //清空原来的
      if (this.toolType == 1) {
        //矩形
        drawSquare(
          ctx,
          this.shapeBeginPoint,
          point,
          this.config.lineWidth,
          this.lineColor,
          "move"
        ); //绘制
      } else if (this.toolType == 2) {
        //圆形
        drawCircle(
          ctx,
          this.shapeBeginPoint,
          point,
          this.config.lineWidth,
          this.lineColor,
          "move"
        );
      } else if (this.toolType == 3) {
        //判断是否是按住shift
        // if (evt.shiftKey) {
        //   point = editEndPoint(this.shapeBeginPoint, point)[1];
        // }
        //单箭头直线
        drawOneArrowLine(
          ctx,
          point,
          this.shapeBeginPoint,
          this.config.lineWidth,
          this.lineColor,
          "move"
        );
      }
    },

    Circle(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      // 存储当前圆是否被选中
      this.isSelected = false;
      // 存储当前圆是否可以拖动
      this.isDragging = false;
    },
    //图形canvas上的mouseup事件触发
    handleShapeMouseUp(evt) {
      //获取点位置
      var point = this.oCanvas._getMouseCoords(evt);
      //移除图形canvas
      var c = document.getElementById("shapeCanvas");
      c.remove();
      if (this.toolType == 1) {
        //矩形
        let aline = drawSquare(
          this.oCanvas.context,
          this.shapeBeginPoint,
          point,
          this.config.lineWidth,
          this.lineColor,
          "leave"
        ); //绘制
        this.pathObjs.push(Object.assign({}, aline, { printType: 1 }));
        //绘制
        this.oCanvas._repaint(this.oCanvas.context, this.pathObjs);
      } else if (this.toolType == 2) {
        //圆形
        let aline = drawCircle(
          this.oCanvas.context,
          this.shapeBeginPoint,
          point,
          this.config.lineWidth,
          this.lineColor,
          "leave"
        );
        this.pathObjs.push(Object.assign({}, aline, { printType: 3 }));
        //绘制
        this.oCanvas._repaint(this.oCanvas.context, this.pathObjs);
      } else if (this.toolType == 3) {
        //判断是否是按住shift
        if (evt.shiftKey) {
          point = editEndPoint(this.shapeBeginPoint, point)[1];
        }
        let aline = {};
        //单箭头直线
        aline = drawOneArrowLine(
          this.oCanvas.context,
          point,
          this.shapeBeginPoint,
          this.config.lineWidth,
          this.lineColor,
          "leave"
        );
        this.pathObjs.push(Object.assign({}, aline, { printType: 1 }));
        //绘制
        this.oCanvas._repaint(this.oCanvas.context, this.pathObjs);
      }

      //记录时间旅行
      const copy = JSON.parse(JSON.stringify(this.pathObjs));
      this.travelList.push(copy);
      //当前绘图表面进栈
      // this.oCanvas._pushAry(this.oCanvas.context);
    },
    handleZoom(zoomFlag, point) {
      //处理拉伸操作
      //获得选中框的四边坐标
      const edgeList = this.oCanvas._getSelectedEdge(
        this.oCanvas.context,
        this.pathObjs
      );
      const { minX, maxX, minY, maxY } = edgeList;
      // 构建移动系数
      // maxX轴 移动系数
      let xr = (point[0] - maxX) / (maxX - minX);
      // minX轴 动系数
      let xl = -((point[0] - minX) / (maxX - minX));
      // maxY轴 移动系数
      let yb = (point[1] - maxY) / (maxY - minY);
      // minY轴 动系数
      let yt = -((point[1] - minY) / (maxY - minY));
      let newPoints = [];
      let newcoordinate = function(oldCoordinate, coefficient, center) {
        let newcoordinate =
          oldCoordinate + coefficient * (oldCoordinate - center);
        return newcoordinate;
      };
      let newPointsFn = (coefficientX, centerX, coefficientY, centerY) => {
        this.pathObjs[this.chooseIndex].points.map(item => {
          let x = item[0];
          let y = item[1];
          if (centerX) {
            x = newcoordinate(item[0], coefficientX, centerX);
          }
          if (centerY) {
            y = newcoordinate(item[1], coefficientY, centerY);
          }
          newPoints.push([x, y]);
        });
        this.$set(this.pathObjs[this.chooseIndex], "points", newPoints);
        this.oCanvas._repaint(this.oCanvas.context, this.pathObjs, "normal");
      };
      switch (zoomFlag) {
        case 0:
          // 以maxY maxX为轴拉伸
          newPointsFn(xl, maxX, yt, maxY);
          break;
        case 1:
          // 以maxY为轴拉伸
          newPointsFn(null, null, yt, maxY);
          break;
        case 2:
          newPointsFn(xr, minX, yt, maxY);
          break;
        case 3:
          // 以minX为轴拉伸
          newPointsFn(xr, minX, null, null);
          break;
        case 4:
          newPointsFn(xr, minX, yb, minY);
          break;
        case 5:
          // 以minY为轴拉伸
          newPointsFn(null, null, yb, minY);
          break;
        case 6:
          newPointsFn(xl, maxX, yb, minY);
          break;
        case 7:
          newPointsFn(xl, maxX, null, null);
          break;
      }
      newPoints = [];
    }
  }
};
</script>
<style>
@import url("./css/icon_font/iconfont.css");
@import url("./css/whiteboard.css");
</style>
