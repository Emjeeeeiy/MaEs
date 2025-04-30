<!-- <template>
  <div class="bg-black text-white rounded-full text-sm">Dyze hello</div>
  <div class="card flex justify-center">
    <Button label="Verify" />
  </div>
</template>

<script setup></script> -->

<template>
  <div id="app">
    <!-- <div>Try</div> -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<!-- <style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style> -->
