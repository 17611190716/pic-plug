// function(){
//      //这是网上的一张图片链接
//     var url="http://p1.pstatp.com/large/435d000085555bd8de10";
//         getBase64(url)
//             .then(function(base64){
//                   console.log(base64);//处理成功打印在控制台
//             },function(err){
//                   console.log(err);//打印异常信息
//             });                        
//     }    

    //传入图片路径，返回base64
 export var getBase64 = function (img){
        function getBase64Image(img,width,height) {//width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
          var canvas = document.createElement("canvas");
          canvas.width = width ? width : img.width;
          canvas.height = height ? height : img.height;
 
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          var dataURL = canvas.toDataURL();
          return dataURL;
        }
        var image = new Image();
        image.crossOrigin = '';
        image.src = img;
        var deferred=$.Deferred();
        if(img){
          image.onload =function (){
            deferred.resolve(getBase64Image(image));//将base64传给done上传处理
          }
          return deferred.promise();//问题要让onload完成后再return sessionStorage['imgTest']
        }
      }