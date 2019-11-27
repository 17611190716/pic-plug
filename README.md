# pic-marker
A Tool for Marking Pictures. 
Similar to editing after screenshots.
Now,only for Vue

[![npm version](https://badge.fury.io/js/pic-marker.svg)](https://badge.fury.io/js/pic-marker)
![Image text](https://github.com/yujiant/pic-marker/blob/master/examples/assets/marked.png)


## Installation 
Install from GitHub via NPM
```bash
npm install pic-marker
```
## Usage

To use `pic-marker`, simply import it and the `css` file, and call `Vue.use()` to install.

```html
<template>
  <div id="app">
    <!-- component -->
     <pic-marker 
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
import Marker from 'pic-marker'
import 'pic-marker/lib/pic-marker.css'
Vue.use(Marker)

new Vue({
  router,
  store,
  components: { App },
  template: '<App/>',
}).$mount('#app')
```
