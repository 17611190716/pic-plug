// packages/Marker/index.js

// 导入组件，组件必须声明 name
import Marker from './src/index.vue'
// 为组件添加 install 方法，用于按需引入
Marker.install = function (Vue) {
    Vue.component(Marker.name, Marker)
}

export default Marker