<template>
  <div id="app">
    <PythonEditor editorType="ace"/>
  </div>
</template>

<script>
import PythonEditor from "./components/PythonEditor";

export default {
  name: "App",
  data() {
    return {};
  },
  components: {
    PythonEditor,
  },
};
</script>

<style>
</style>
