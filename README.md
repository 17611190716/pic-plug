# pic-plug
A Tool for Marking Pictures. 
Similar to editing after screenshots.
Now,only for Vue


## Installation 
Install from GitHub via NPM
```bash
npm install pic-plug
```
## Usage

To use `pic-plug`, simply import it and the `css` file, and call `Vue.use()` to install.

```html
<template>
  <div id="app">
    <!-- component -->
     <pic-plug 
       :picUrl="picUrl" //图片地址
       @close="handelClose" //点击关闭图标的回调
       @complete="handelComplete"//点击完成图标的回调
     />
  </div>
</template>
```

main.js
```javascript
import Vue from 'vue'
import Marker from 'pic-plug'
import 'pic-plug/lib/pic-plug.css'
Vue.use(Marker)

new Vue({
  router,
  store,
  components: { App },
  template: '<App/>',
}).$mount('#app')
```
