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
