<template>
  <div id="player">
    <PythonPlayer editorType="ace"/>
  </div>
</template>

<script>
import PythonPlayer from "./components/PythonPlayer";

export default {
  name: "AppPlayer",
  data() {
    return {};
  },
  components: {
    PythonPlayer,
  },
};
</script>

<style>
</style>
