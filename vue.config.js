// vue.config.js

module.exports = {
    // 将 examples 目录添加为新的页面
    pages: {
      index: {
        // page 的入口
        entry: 'examples/main.js',
        // 模板来源
        template: 'public/index.html',
        // 输出文件名
        filename: 'index.html'
      }
    },
    // https://blog.csdn.net/xiaomajia029/article/details/88320233
    // 解决You are using the runtime-only build of Vue where the template compiler is not available
    // configureWebpack: config => {
    //   config.resolve = {
    //     extensions: [".js", ".vue", ".json", ".css"],
    //     alias: {
    //       vue$: "vue/dist/vue.esm.js"
    //     }
    //   };
    // }
  }