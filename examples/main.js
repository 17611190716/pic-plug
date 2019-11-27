
import Marker from '../packages/index'
import Vue from 'vue'
import App from './App.vue'
// https://www.cnblogs.com/wisewrong/archive/2018/12/28/10186611.html
Vue.use(Marker)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
