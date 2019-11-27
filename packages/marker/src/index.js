/* ************************************************** Canvas定义 ***************************************************** */

//构造方法
export function Canvas() {
  this.init.apply(this, arguments);
}
//基础变量 //原型上的变量 实例会共享变量
Canvas.prototype = {
  canvasWidth: 0,
  canvasHeight: 0,
  imgObj: "",
  init: function(oCanvas) {
    this.canvas = oCanvas;
    this.context = oCanvas.getContext("2d"); //创建context对象
  }
};
var selectedIndex = null;
var selectedFont = false;
var selectedCircle = false;
//获取鼠标点
Canvas.prototype._getMouseCoords = function(evt) {
  if (!evt) return;
  var mouseX, mouseY;
  if (typeof evt.offsetX !== "undefined") {
    mouseX = evt.offsetX;
    mouseY = evt.offsetY;
  } else if (typeof evt.layerX !== "undefined") {
    mouseX = evt.layerX;
    mouseY = evt.layerY;
  } else if (typeof evt.pageX !== "undefined") {
    // var offset = $canvas.offset();
    // mouseX = evt.pageX - offset.left;
    // mouseY = evt.pageY - offset.top;
  }
  // var xRatio = 1, //attrW / realW,
  //   yRatio = 1; //attrH / realH;
  return [mouseX, mouseY];
};
//绘制：二次塞贝尔曲线
Canvas.prototype._correctBezierPoints = function(ctx, pathObj) {
  if (!ctx || !pathObj || !pathObj.points) return;
  let points = pathObj.points;
  let config = pathObj.config;
  ctx.lineWidth = config.lineWidth;
  ctx.strokeStyle = config.strokeStyle;
  // console.log("strokeStyle:", pathObj.config.strokeStyle);
  let groupNum = 0;
  if (points.length % 3) {
    groupNum = Math.floor(points.length / 3);
  } else {
    groupNum = Math.floor(points.length / 3) - 1;
  }
  let lastGroupNum = 0;
  if (points.length % 3 === 0) {
    lastGroupNum = 2;
  } else if (points.length % 3 === 2) {
    lastGroupNum = 1;
  }
  ctx.beginPath();
  for (let i = 0; i < groupNum; i++) {
    let bgx = points[i * 3][0];
    let bgy = points[i * 3][1];
    let cp1x = points[i * 3 + 1][0];
    let cp1y = points[i * 3 + 1][1];
    let cp2x = points[i * 3 + 2][0];
    let cp2y = points[i * 3 + 2][1];
    let cp3x = points[i * 3 + 3][0];
    let cp3y = points[i * 3 + 3][1];
    ctx.moveTo(bgx, bgy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cp3x, cp3y);
  }
  if (lastGroupNum) {
    for (let i = 0; i < lastGroupNum; i++) {
      let x = points[groupNum * 3 + i][0],
        y = points[groupNum * 3 + i][1];
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
};
//绘制直线
Canvas.prototype._straightPoints = function(ctx, pathObj) {
  if (!pathObj || !pathObj.points) return;
  let points = pathObj.points;
  let config = pathObj.config;
  ctx.lineWidth = config.lineWidth;
  ctx.strokeStyle = config.strokeStyle;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();
  ctx.closePath();
};
///绘制圆形
Canvas.prototype._circlePoints = function(ctx, pathObj) {
  if (!pathObj || !pathObj.points) return;
  let points = pathObj.points;
  let x = points[0][0];
  let y = points[0][1];
  let r = pathObj.r;
  // console.log("圆形绘制", pathObj);
  let config = pathObj.config;
  ctx.lineWidth = config.lineWidth;
  ctx.strokeStyle = config.strokeStyle;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
};
//绘制文字
Canvas.prototype._wordsPoints = function(ctx, pathObj) {
  if (!pathObj || !pathObj.points) return;
  let {
    points,
    config: { fontSize, lineColor, font_family, value }
  } = pathObj;
  setCanvasStyle(ctx, 3, lineColor);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = fontSize + "px " + font_family; //'bold 20px arial';
  ctx.fillStyle = lineColor;
  ctx.fillText(value, points[0][0], points[0][1] + 0.25 * fontSize + 2);
};
//绘制：重绘
Canvas.prototype._repaint = function(
  ctx,
  pathObjs,
  type = "normal",
  choosedIndex
) {
  //type 1:hover重绘 2：点击重绘,3:普通重绘 index:当前（hover或者clickd）曲线的索引值
  if (!ctx) return;
  //清空画布
  ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  ctx.drawImage(this.imgObj, 0, 0, this.canvasWidth, this.canvasHeight);
  // console.log("pathObjs", pathObjs);
  if (!pathObjs.length) return;
  pathObjs.map((item) => {
    this._print(ctx, item);
  });

  //根据交互 添加线段状态
  if (type === "hover") {
    //如果hover到某条曲线
    // 改变鼠标指针
    var cvs = document.getElementById("picanvas");
    cvs.className = "canvas_move";
    // console.log("hover重绘");
    pathObjs.map((item, i) => {
      let { points, printType } = item;
      if (choosedIndex === i) {
        //如果存在hover状态的线 绘制hover框
        if (printType === 4) {
          // console.log("hover文字框");
          // 如果是文字框则显示红色边框
          //画出hover框
          this._repaintFontBox(ctx, points);
        } else if (printType === 3) {
          // console.log("hover圆形框");
          // 如果是圆形框则显示红色边框
          //画出hover框
          //修改曲线颜色
          let newIten = {
            points,
            config: {
              lineWidth: item.config.lineWidth + 1,
              strokeStyle: "#499bea"
            },
            printType,
            r: item.r
          };
          this._print(ctx, newIten);
          // this._repaintCircleBox(ctx, points);
        } else {
          //修改曲线颜色
          let newIten = {
            points,
            config: {
              lineWidth: item.config.lineWidth + 1,
              strokeStyle: "#499bea"
            },
            printType
          };
          this._print(ctx, newIten);
          if (selectedIndex !== choosedIndex) {
            var minX = points[0][0];
            var maxX = points[0][0];
            var minY = points[0][1];
            var maxY = points[0][1];
            points.map(itemChid => {
              if (itemChid[0] < minX) {
                minX = itemChid[0];
              }
              if (itemChid[0] > maxX) {
                maxX = itemChid[0];
              }
              if (itemChid[1] < minY) {
                minY = itemChid[1];
              }
              if (itemChid[1] > maxY) {
                maxY = itemChid[1];
              }
            });
            //画出hover框
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#673ab7";
            ctx.beginPath();
            ctx.rect(minX, minY, maxX - minX, maxY - minY);
            ctx.stroke();
          }
        }
      }
    });
  } else if (type === "click") {
    //click某条 已经hover的曲线
    // console.log("click重绘");
    selectedIndex = choosedIndex;
    selectedFont = false;
    selectedCircle = false;
    pathObjs.map((item, i) => {
      let { points, printType } = item;
      if (choosedIndex === i) {
        if (printType === 4) {
          // console.log("hover文字框");
          selectedFont = true;
          // 如果是文字框则显示红色边框
          //画出hover框
          this._repaintFontBox(ctx, points);
        } else if (printType === 3) {
          // console.log("click圆形框");
          selectedCircle = true;
          // 如果是圆形框则显示红色边框
          //画出hover框
          //修改曲线颜色
          let newIten = {
            points,
            config: {
              lineWidth: item.config.lineWidth + 1,
              strokeStyle: "#499bea"
            },
            printType,
            r: item.r
          };
          this._print(ctx, newIten);
          // this._repaintCircleBox(ctx, points);
        } else {
          //如果存在click状态的线 绘制hover框
          let points = item.points;
          //修改曲线颜色
          let newIten = {
            points: points,
            config: {
              lineWidth: item.config.lineWidth,
              strokeStyle: "#499bea"
            }
          };
          this._print(ctx, newIten);
        }
      }
    });
  } else if (type === "normal") {
    // console.log("普通重绘");
  } else if (type === "cancleSelected") {
    // console.log("取消选中重绘");
    selectedIndex = null;
    //不重绘选中框
    return;
  }
  //重绘唯一的选中框
  this._repaintSelected(ctx, pathObjs);
};
//重绘选中框(仅有一个选中框)
Canvas.prototype._repaintSelected = function(ctx, pathObjs) {
  //如果没有选中框或者选中id无效 则不绘制
  if (typeof selectedIndex !== "number") return;
  //  console.log('重绘选中框choosIndex:',selectedIndex,pathObjs)
  if (!pathObjs[selectedIndex]) return;
  const { points, printType, config, r = 0 } = pathObjs[selectedIndex];
  if (selectedFont) {
    this._repaintFontBox(ctx, points);
  } else if (selectedCircle) {
    let newIten = {
      points,
      config: {
        lineWidth: config.lineWidth + 1,
        strokeStyle: "#499bea"
      },
      printType,
      r
    };
    this._print(ctx, newIten);
  } else {
    //求出hover框的四个角坐标
    var minX = points[0][0];
    var maxX = points[0][0];
    var minY = points[0][1];
    var maxY = points[0][1];
    points.map(itemChid => {
      if (itemChid[0] < minX) {
        minX = itemChid[0];
      }
      if (itemChid[0] > maxX) {
        maxX = itemChid[0];
      }
      if (itemChid[1] < minY) {
        minY = itemChid[1];
      }
      if (itemChid[1] > maxY) {
        maxY = itemChid[1];
      }
    });
    //画出选中框
    //选中框由8个正方形 和8个线段拼接组成 依次画出
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#673ab7";
    // ctx.rect(minX,minY,maxX-minX,maxY-minY)
    // 左上角点开始 顺时针绘制
    ctx.rect(minX - 2, minY - 2, 5, 5);
    ctx.rect(minX / 2 + maxX / 2 - 2, minY - 2, 5, 5);
    ctx.rect(maxX - 2, minY - 2, 5, 5);
    ctx.rect(maxX - 2, minY / 2 + maxY / 2 - 2, 5, 5);
    ctx.rect(maxX - 2, maxY - 2, 5, 5);
    ctx.rect(minX / 2 + maxX / 2 - 2, maxY - 2, 5, 5);
    ctx.rect(minX - 2, maxY - 2, 5, 5);
    ctx.rect(minX - 2, minY / 2 + maxY / 2 - 2, 5, 5);
    // 绘制线段
    ctx.moveTo(minX + 2, minY);
    ctx.lineTo(minX / 2 + maxX / 2 - 2, minY);

    ctx.moveTo(minX / 2 + maxX / 2 + 2, minY);
    ctx.lineTo(maxX - 2, minY);

    ctx.moveTo(maxX, minY + 2);
    ctx.lineTo(maxX, minY / 2 + maxY / 2 - 2);

    ctx.moveTo(maxX, minY / 2 + maxY / 2 + 2);
    ctx.lineTo(maxX, maxY - 2);

    ctx.moveTo(maxX - 2, maxY);
    ctx.lineTo(minX / 2 + maxX / 2 + 2, maxY);

    ctx.moveTo(minX / 2 + maxX / 2 - 2, maxY);
    ctx.lineTo(minX + 2, maxY);

    ctx.moveTo(minX, maxY - 2);
    ctx.lineTo(minX, minY / 2 + maxY / 2 + 2);

    ctx.moveTo(minX, minY / 2 + maxY / 2 - 2);
    ctx.lineTo(minX, minY + 2);
    // console.log('左上角点开始 顺时针绘制')

    ctx.stroke();
  }
};
//绘制文字红框
Canvas.prototype._repaintFontBox = function(ctx, points) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.rect(
    points[0][0],
    points[0][1],
    points[1][0] - points[0][0],
    points[3][1] - points[0][1]
  );
  ctx.stroke();
};
//获得选中框的拉伸图标坐标
Canvas.prototype._getSelectedBox = function(ctx, pathObjs) {
  //如果没有选中框或者选中id无效 则不绘制
  if (typeof selectedIndex !== "number" || !pathObjs[selectedIndex]) return;
  //  console.log('重绘选中框choosIndex:',selectedIndex,pathObjs)
  let { points } = pathObjs[selectedIndex];
  //求出hover框的四个角坐标
  var minX = points[0][0];
  var maxX = points[0][0];
  var minY = points[0][1];
  var maxY = points[0][1];
  points.map(itemChid => {
    if (itemChid[0] < minX) {
      minX = itemChid[0];
    }
    if (itemChid[0] > maxX) {
      maxX = itemChid[0];
    }
    if (itemChid[1] < minY) {
      minY = itemChid[1];
    }
    if (itemChid[1] > maxY) {
      maxY = itemChid[1];
    }
  });
  // ctx.rect(minX,minY,maxX-minX,maxY-minY)
  // 左上角点开始 顺时针绘制
  ctx.rect(minX - 2, minY - 2, 5, 5);
  ctx.rect(minX / 2 + maxX / 2 - 2, minY - 2, 5, 5);
  ctx.rect(maxX - 2, minY - 2, 5, 5);
  ctx.rect(maxX - 2, minY / 2 + maxY / 2 - 2, 5, 5);
  ctx.rect(maxX - 2, maxY - 2, 5, 5);
  ctx.rect(minX / 2 + maxX / 2 - 2, maxY - 2, 5, 5);
  ctx.rect(minX - 2, maxY - 2, 5, 5);
  ctx.rect(minX - 2, minY / 2 + maxY / 2 - 2, 5, 5);
  // 8个拉伸节点的坐标
  let list = [];
  list[0] = [minX - 2, minX + 3, minY - 2, minY + 3]; //上左
  list[1] = [
    minX / 2 + maxX / 2 - 2 - 2,
    minX / 2 + maxX / 2 - 2 + 3,
    minY - 2,
    minY + 3
  ]; //上中
  list[2] = [maxX - 2, maxX + 3, minY - 2, minY + 3]; //上右
  list[3] = [
    maxX - 2,
    maxX + 3,
    minY / 2 + maxY / 2 - 2,
    minY / 2 + maxY / 2 + 3
  ]; //中右
  list[4] = [maxX - 2, maxX + 3, maxY - 2, maxY + 3]; //下右
  list[5] = [
    minX / 2 + maxX / 2 - 2,
    minX / 2 + maxX / 2 + 3,
    maxY - 2,
    maxY + 3
  ]; //下中
  list[6] = [minX - 2, minX + 3, maxY - 2, maxY + 3]; //下左
  list[7] = [
    minX - 2,
    minX + 3,
    minY / 2 + maxY / 2 - 2,
    minY / 2 + maxY / 2 + 3
  ]; //中左
  return list;
};
//获得
Canvas.prototype._getSelectedEdge = function(ctx, pathObjs) {
  //如果没有选中框或者选中id无效 则不绘制
  if (typeof selectedIndex !== "number") return;
  //  console.log('重绘选中框choosIndex:',selectedIndex,pathObjs)
  let points = pathObjs[selectedIndex].points;
  //求出hover框的四个角坐标
  var minX = points[0][0];
  var maxX = points[0][0];
  var minY = points[0][1];
  var maxY = points[0][1];
  points.map(itemChid => {
    if (itemChid[0] < minX) {
      minX = itemChid[0];
    }
    if (itemChid[0] > maxX) {
      maxX = itemChid[0];
    }
    if (itemChid[1] < minY) {
      minY = itemChid[1];
    }
    if (itemChid[1] > maxY) {
      maxY = itemChid[1];
    }
  });
  return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
};
// 根据类型画图
Canvas.prototype._print = function(ctx, item) {
  switch (
    item.printType //1 直线 2、曲线 3、圆形
  ) {
    case 1:
      //绘制直线
      this._straightPoints(ctx, item);
      break;
    case 2:
      //绘制曲线
      this._correctBezierPoints(ctx, item);
      break;
    case 3:
      //绘制圆形
      this._circlePoints(ctx, item);
      break;
    case 4:
      //绘制文字
      this._wordsPoints(ctx, item);
      break;
  }
};
/* ************************************************** 绘制图形 ***************************************************** */
// 画文字区域
export var drawFont = function(
  ctx,
  beginPoint,
  clientWidth,
  clientHeight,
  fontSize,
  font_family,
  lineColor,
  value
) {
  //设置画笔 边框默认样式 宽度3 颜色为红色
  setCanvasStyle(ctx, 3, "red");
  let endPoint = [beginPoint[0] + clientWidth, beginPoint[1] + clientHeight];
  // //绘制边框
  // ctx.beginPath();
  // ctx.moveTo(beginPoint[0], beginPoint[1]);
  // ctx.lineTo(endPoint[0], beginPoint[1]);
  // ctx.lineTo(endPoint[0], endPoint[1]);
  // ctx.lineTo(beginPoint[0], endPoint[1]);
  // ctx.lineTo(beginPoint[0], beginPoint[1]);
  // ctx.stroke();
  //设置画笔 绘制文字
  setCanvasStyle(ctx, 3, lineColor);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = fontSize + "px " + font_family; //'bold 20px arial';
  ctx.fillStyle = lineColor;
  ctx.fillText(value, beginPoint[0], beginPoint[1] + 0.25 * fontSize + 2);

  //返回点集合
  let pointsList = [
    [beginPoint[0], beginPoint[1]],
    [endPoint[0], beginPoint[1]],
    [endPoint[0], endPoint[1]],
    [beginPoint[0], endPoint[1]],
    [beginPoint[0], beginPoint[1]]
  ];
  return {
    points: pointsList,
    config: {
      fontSize,
      lineColor,
      font_family,
      value
    }
  };
};
//画矩形
export var drawSquare = function(
  ctx,
  beginPoint,
  endPoint,
  lineWidth,
  lineColor,
  status
) {
  if (!status) return;
  //设置画笔
  setCanvasStyle(ctx, lineWidth, lineColor);
  //绘制矩形
  if (status === "move") {
    ctx.beginPath();
    ctx.moveTo(beginPoint[0], beginPoint[1]);
    ctx.lineTo(endPoint[0], beginPoint[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.lineTo(beginPoint[0], endPoint[1]);
    ctx.lineTo(beginPoint[0], beginPoint[1]);
    ctx.stroke();
  } else if (status === "leave") {
    //返回点集合
    let pointsList = [
      [beginPoint[0], beginPoint[1]],
      [endPoint[0], beginPoint[1]],
      [endPoint[0], endPoint[1]],
      [beginPoint[0], endPoint[1]],
      [beginPoint[0], beginPoint[1]]
    ];
    return {
      points: pointsList,
      config: {
        lineWidth: lineWidth,
        strokeStyle: lineColor
      }
    };
  }
};
//画圆
export var drawCircle = function(
  ctx,
  beginPoint,
  endPoint,
  lineWidth,
  lineColor,
  status
) {
  if (!status) return;
  //设置画笔
  setCanvasStyle(ctx, lineWidth, lineColor);
  //计算需要的参数
  if (status === "move") {
    var x = (beginPoint[0] + endPoint[0]) / 2; //圆中心点x坐标
    var y = (beginPoint[1] + endPoint[1]) / 2; //圆中心点y坐标
    //var r = Math.sqrt(Math.pow(endPoint[0]-beginPoint[0],2) + Math.pow(endPoint[1]-beginPoint[1],2));
    var r = Math.sqrt(
      (endPoint[0] - beginPoint[0]) * (endPoint[0] - beginPoint[0]) +
        (endPoint[1] - beginPoint[1]) * (endPoint[1] - beginPoint[1])
    );
    //绘制圆形
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (status === "leave") {
    //返回点集合
    let pointsCircle = [
      [
        (beginPoint[0] + endPoint[0]) / 2, //圆中心点x坐标
        (beginPoint[1] + endPoint[1]) / 2 //圆中心点y坐标
      ]
    ];
    return {
      points: pointsCircle,
      r: Math.sqrt(
        (endPoint[0] - beginPoint[0]) * (endPoint[0] - beginPoint[0]) +
          (endPoint[1] - beginPoint[1]) * (endPoint[1] - beginPoint[1])
      ), //半径
      config: {
        lineWidth: lineWidth,
        strokeStyle: lineColor
      }
    };
  }
};
//画直线
export var drawLine = function(
  ctx,
  beginPoint,
  endPoint,
  lineWidth,
  lineColor,
  status
) {
  if (!status) return;
  //设置画笔
  setCanvasStyle(ctx, lineWidth, lineColor);
  if (status === "move") {
    //绘制直线
    ctx.beginPath();
    ctx.moveTo(beginPoint[0], beginPoint[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.stroke();
  } else if (status === "leave") {
    //返回点集合
    let pointsList = [
      [beginPoint[0], beginPoint[1]],
      [endPoint[0], endPoint[1]]
    ];
    return {
      points: pointsList,
      config: {
        lineWidth: lineWidth,
        strokeStyle: lineColor
      }
    };
  }
};
//画单箭头直线
export var drawOneArrowLine = function(
  ctx,
  beginPoint,
  endPoint,
  lineWidth,
  lineColor,
  status
) {
  if (!status) return;
  //设置画笔
  setCanvasStyle(ctx, lineWidth, lineColor);
  //获取需要的参数
  var points = getStartArrowPoints(beginPoint, endPoint);
  //绘制
  if (status === "move") {
    ctx.beginPath(); //画箭头
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(beginPoint[0], beginPoint[1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.stroke();
    ctx.beginPath(); //画直线
    ctx.moveTo(beginPoint[0], beginPoint[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.stroke();
  } else if (status === "leave") {
    //返回点集合
    let pointsList = [
      [points[0][0], points[0][1]],
      [beginPoint[0], beginPoint[1]],
      [points[1][0], points[1][1]],
      [beginPoint[0], beginPoint[1]],
      [endPoint[0], endPoint[1]]
    ];
    return {
      points: pointsList,
      config: {
        lineWidth: lineWidth,
        strokeStyle: lineColor
      }
    };
  }
};
//橡皮擦功能
export var clearRect = function(
  ctx,
  pointX,
  pointY,
  eraserWidth,
  eraserHeight
) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(pointX, pointY, eraserWidth, eraserHeight);
}; //获取起始点箭头点
export var getStartArrowPoints = function(beginPoint, endPoint) {
  var angle = 48; //设置角度
  var r = 5;
  var pixelTemX, pixelTemY; //临时点坐标
  var pixelX, pixelY, pixelX1, pixelY1; //箭头两个点
  if (endPoint[0] - beginPoint[0] == 0) {
    //斜率不存在时
    pixelTemX = endPoint[0];
    if (endPoint[1] > beginPoint[1]) {
      pixelTemY = beginPoint[1] + r;
    } else {
      pixelTemY = beginPoint[1] - r;
    }
    //已知直角三角形两个点坐标及其中一个角，求另外一个点坐标算法
    pixelX = pixelTemX - r * Math.tan(angle);
    pixelX1 = pixelTemX + r * Math.tan(angle);
    pixelY = pixelY1 = pixelTemY;
  } //斜率存在时
  else {
    let delta = (endPoint[1] - beginPoint[1]) / (endPoint[0] - beginPoint[0]);
    let param = Math.sqrt(delta * delta + 1);

    if (endPoint[0] - beginPoint[0] < 0) {
      //第二、三象限
      pixelTemX = beginPoint[0] - r / param;
      pixelTemY = beginPoint[1] - (delta * r) / param;
    } else {
      //第一、四象限
      pixelTemX = beginPoint[0] + r / param;
      pixelTemY = beginPoint[1] + (delta * r) / param;
    }
    //已知直角三角形两个点坐标及其中一个角，求另外一个点坐标算法
    pixelX = pixelTemX + (Math.tan(angle) * r * delta) / param;
    pixelY = pixelTemY - (Math.tan(angle) * r) / param;

    pixelX1 = pixelTemX - (Math.tan(angle) * r * delta) / param;
    pixelY1 = pixelTemY + (Math.tan(angle) * r) / param;
  }
  return [[pixelX, pixelY], [pixelX1, pixelY1]];
};
//按住shift修改endPoint点
export var editEndPoint = function(beginPoint, endPoint) {
  var bx = beginPoint[0];
  var ex = endPoint[0];
  var by = beginPoint[1];
  var ey = endPoint[1];
  var resultPoint = [];
  if (ex == bx || ey == by) {
    return [beginPoint, endPoint];
  }
  var tanValue = Math.abs((ey - by) / (ex - bx));
  var ang = Math.atan(tanValue) / Math.PI;
  // 根据xy的关系比较是哪个象限
  // ang 与 1/8 3/8 的大小关系 判断最终的确认角度
  if (ex > bx && ey > by) {
    if (ang < 1 / 8) {
      resultPoint[0] = ex;
      resultPoint[1] = by;
    } else if (ang < 1 / 4) {
      resultPoint[0] = ex;
      resultPoint[1] = by + ex - bx;
    } else if (ang < 3 / 8) {
      resultPoint[0] = bx + ey - by;
      resultPoint[1] = ey;
    } else {
      resultPoint[0] = bx;
      resultPoint[1] = ey;
    }
  } else if (ex < bx && ey > by) {
    if (ang < 1 / 8) {
      resultPoint[0] = ex;
      resultPoint[1] = by;
    } else if (ang < 1 / 4) {
      resultPoint[0] = ex;
      resultPoint[1] = by - ex + bx;
    } else if (ang < 3 / 8) {
      resultPoint[0] = bx - ey + by;
      resultPoint[1] = ey;
    } else {
      resultPoint[0] = bx;
      resultPoint[1] = ey;
    }
  } else if (ex < bx && ey < by) {
    if (ang < 1 / 8) {
      resultPoint[0] = ex;
      resultPoint[1] = by;
    } else if (ang < 1 / 4) {
      resultPoint[0] = ex;
      resultPoint[1] = by + ex - bx;
    } else if (ang < 3 / 8) {
      resultPoint[0] = bx + ey - by;
      resultPoint[1] = ey;
    } else {
      resultPoint[0] = bx;
      resultPoint[1] = ey;
    }
  } else {
    if (ang < 1 / 8) {
      resultPoint[0] = ex;
      resultPoint[1] = by;
    } else if (ang < 1 / 4) {
      resultPoint[0] = ex;
      resultPoint[1] = by - ex + bx;
    } else if (ang < 3 / 8) {
      resultPoint[0] = bx - ey + by;
      resultPoint[1] = ey;
    } else {
      resultPoint[0] = bx;
      resultPoint[1] = ey;
    }
  }
  return [beginPoint, resultPoint];
};
//设置画笔
export var setCanvasStyle = function(cxt, lineWidth, lineColor) {
  //设置当前的线条宽度
  cxt.lineWidth = lineWidth;
  cxt.strokeStyle = lineColor; //笔触的颜色
};
//获取鼠标点位置（用于画图形）
// var getMouseCoords = function(evt) {
//   if (!evt) {
//     return;
//   }

//   var mouseX, mouseY;
//   var $canvas = this.canvas;
//   if (typeof evt.offsetX !== "undefined") {
//     mouseX = evt.offsetX;
//     mouseY = evt.offsetY;
//   } else if (typeof evt.layerX !== "undefined") {
//     mouseX = evt.layerX;
//     mouseY = evt.layerY;
//   } else if (typeof evt.pageX !== "undefined") {
//     var offset = $canvas.offset();
//     mouseX = evt.pageX - offset.left;
//     mouseY = evt.pageY - offset.top;
//   }
//   return [mouseX, mouseY];
// };

//下载文件
export var downloadFile = function(fileName, content) {
  var aLink = document.createElement("a");
  var blob = base64Img2Blob(content); //new Blob([content]);

  //var evt = document.createEvent("HTMLEvents");
  //evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错
  var event = document.createEvent("MouseEvents");
  event.initMouseEvent(
    "click",
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );

  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob);
  aLink.dispatchEvent(event);
};
//下载跨域图片
export var getBase64ByUrl = function(src, callback, outputFormat) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", src, true);

  xhr.responseType = "arraybuffer";
  xhr.onload = function() {
    alert(111);
    if (xhr.status == 200) {

      var uInt8Array = new Uint8Array(xhr.response);
      var i = uInt8Array.length;
      var binaryString = new Array(i);
      while (i--) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
      }
      var data = binaryString.join("");
      var base64 = window.btoa(data);
      var dataUrl =
        "data:" + (outputFormat || "image/png") + ";base64," + base64;
       alert(dataUrl);
      callback.call(this, dataUrl);
    }
  };

  xhr.send();
};
export var base64Img2Blob = function(code) {
  var parts = code.split(";base64,");
  var contentType = parts[0].split(":")[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

// var dataURLtoBlob = function(dataURL) {
//   var byteString = window.atob(dataURL.split(",")[1]);
//   // var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
//   var ab = new ArrayBuffer(byteString.length);
//   var ia = new Uint8Array(ab);
//   for (var i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }
//   return ab;
// };
