/* ************************************************** 键盘按下、抬起事件 ***************************************************** */

//设置快捷键调用对应的功能（1 图形 2 直线 3 画笔 4 输入框 5 橡皮擦 6 涂色板 7 撤销 8 还原 9 保存 ctrl+0 清屏）
// 矩形 r 82 横线 l 76 铅笔 p 80 输入文字 t 84 橡皮 e 69 颜色 c 67 向后撤销 z 90 向前撤下 y 89 保存 s 83 清空 d 68（目前没实现 还是 ctrl+0 要不然容易误触）
// 矩形 r 82 横线 a 65 铅笔 p 80 输入文字 t 84 橡皮 e 69 颜色 c 67 向后撤销 z 90 向前撤下 f 70 保存 s 83 清空 d 68（目前没实现 还是 ctrl+0 要不然容易误触）
// 二级选项使用 1 2 3
var wordIndex = 0;
var colorIndex = 0;
document.onkeydown = function() {
  var oEvent = window.event;

  var rect = $(".outboard-rect");
  var line = $(".outboard-line");
  var word = $(".outboard-word");
  var pencil = $(".outboard-pencil");
  var eraser = $(".outboard-eraser");
  var color = $(".outboard-color");
  var input1 = $("#textInput");

  // esc的动作 esc收回所有的选择框 取消输入框的选中 取消画笔的按住操作
  if (oEvent.keyCode == 27) {
    sel.hide();
    if (input1) {
      $("#textInput").trigger("onblur");
    }
    $scope.mouseUp();
    return;
  }
  if (!input1.size()) {
    switch (oEvent.keyCode) {
      case 82:
        $(".board-items1").trigger("click");
        break;
      case 65:
        $(".board-items3").trigger("click");
        break;
      case 80:
        $(".board-items4").trigger("click");
        break;
      case 84:
        $(".board-items5").trigger("click");
        break;
      case 69:
        $(".board-items6").trigger("click");
        break;
      case 67:
        $(".board-items7").trigger("click");
        break;
      case 90:
        $(".board-items8").trigger("click");
        break;
      case 70:
        $(".board-items9").trigger("click");
        break;
      case 83:
        $(".board-items0").trigger("click");
        break;
    }
    // 需求改成 d 68 暂未实现
    if (oEvent.keyCode == 48 && oEvent.ctrlKey) {
      $(".clearWB").click();
      return;
    }
  }

  if (rect.is(":visible")) {
    switch (oEvent.keyCode) {
      case 49:
        $(".rectType-items1").trigger("click");
        break;
      case 50:
        $(".rectType-items2").trigger("click");
        break;
    }
  }

  if (line.is(":visible")) {
    switch (oEvent.keyCode) {
      case 49:
        $(".lineType-items1").trigger("click");
        break;
      case 50:
        $(".lineType-items2").trigger("click");
        break;
      case 51:
        $(".lineType-items3").trigger("click");
        break;
    }
  }

  if (oEvent.keyCode == 37) {
    if (color.is(":visible")) {
      if (colorIndex - 1 < 0) {
        colorIndex = 0;
      } else {
        colorIndex = colorIndex - 1;
      }
      $(".drawing-tools-board .colorList>li")
        .eq(colorIndex)
        .children("div")
        .trigger("click");
    }
  }

  if (oEvent.keyCode == 38) {
    if (word.is(":visible")) {
      if (wordIndex - 1 < 0) {
        wordIndex = 0;
        return;
      } else {
        wordIndex = wordIndex - 1;
      }
      font_size = $(".drawing-tools-board .fontType .fontDrop>ul>li")
        .eq(wordIndex)
        .text();
      $(".drawing-tools-board .fontType .fontSize>span").html(font_size);
    } else if (color.is(":visible")) {
      if (colorIndex > 8) {
        colorIndex = colorIndex - 8;
      }
      $(".drawing-tools-board .colorList>li")
        .eq(colorIndex)
        .children("div")
        .trigger("click");
    }
  }

  if (oEvent.keyCode == 39) {
    if (color.is(":visible")) {
      if (colorIndex + 1 >= $(".drawing-tools-board .colorList>li").length) {
        colorIndex = $(".drawing-tools-board .colorList>li").length - 1;
      } else {
        colorIndex = colorIndex + 1;
      }
      $(".drawing-tools-board .colorList>li")
        .eq(colorIndex)
        .children("div")
        .trigger("click");
    }
  }

  if (oEvent.keyCode == 40) {
    if (word.is(":visible")) {
      if (
        wordIndex + 1 >=
        $(".drawing-tools-board .fontType .fontDrop>ul>li").length
      ) {
        wordIndex =
          $(".drawing-tools-board .fontType .fontDrop>ul>li").length - 1;
        return;
      } else {
        wordIndex = wordIndex + 1;
      }
      font_size = $(".drawing-tools-board .fontType .fontDrop>ul>li")
        .eq(wordIndex)
        .text();
      $(".drawing-tools-board .fontType .fontSize>span").html(font_size);
    } else if (color.is(":visible")) {
      if (colorIndex < 8) {
        colorIndex = colorIndex + 8;
      }
      $(".drawing-tools-board .colorList>li")
        .eq(colorIndex)
        .children("div")
        .trigger("click");
    }
  }

  if (pencil.is(":visible")) {
    switch (oEvent.keyCode) {
      case 49:
        $(".pencilType-items1").trigger("click");
        break;
      case 50:
        $(".pencilType-items2").trigger("click");
        break;
      case 51:
        $(".pencilType-items3").trigger("click");
        break;
    }
  }

  if (eraser.is(":visible")) {
    switch (oEvent.keyCode) {
      case 49:
        $(".eraserType-items1").trigger("click");
        break;
      case 50:
        $(".eraserType-items2").trigger("click");
        break;
      case 51:
        $(".eraserType-items3").trigger("click");
        break;
    }
  }
};
