<template>
  <div id="app">
    <pic-plug :picUrl="picUrl"/>
    <!-- <img crossorigin="Anonymous" :src="picUrl" alt=""> -->
    </div>
</template>

<script>
export default {
  name: 'app',
  data(){
    return{
      picUrl:require('./assets/Irving1.jpg')
      // picUrl:'http://occ-download.oss-cn-beijing.aliyuncs.com/__vipserver/img/201910/13839055961_1570863941609_163910.jpeg?Expires=1571047243&OSSAccessKeyId=LTAIIQe3js7pLBW4&Signature=Jw7DNODqWSHcLE0ZEOFij6ELALs%3D&x-oss-process=image%2Fresize%2Ch_675%2Cw_1200'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
