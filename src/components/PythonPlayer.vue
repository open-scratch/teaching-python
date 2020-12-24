<template>
  <div>
    <!-- 控制按钮 -->
    <div class="control">
      <input type="file" id="fileinput" style="display: none" />
      <a-button type="primary" @click="runit">运行</a-button>
      <a-button type="primary" @click="clear">清空</a-button>
    </div>
    <!-- 画布 -->
    <div id="mycanvas"></div>
    <!-- 代码输出 -->
    <pre id="output">{{ out }}</pre>
    <a-form-item>
      <JCodeEditor
        v-if="editorType == 'codemirror'"
        language="python"
        v-model="code"
        :fullScreen="true"
        readOnly="true"
        placeholder="请输入代码"
        ref="codeEditor"
      />
      <AceEditor
        v-if="editorType == 'ace'"
        language="python"
        v-model="code"
        readOnly="true"
        :height="500"
        ref="codeEditor"
      />
    </a-form-item>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import JCodeEditor from "./JCodeEditor";
import AceEditor from "./AceEditor";
import "../python/skulpt.min.js";
import "../python/skulpt-stdlib.js";

import axios from "axios";

const Sk = window.Sk;

export default {
  name: "PythonEditor",
  components: {
    JCodeEditor,
    AceEditor,
  },
  props: {
    editorType: {
      type: String,
      default: "ace", //ace codemirror
    },
  },
  data() {
    return {
      code: "",
      out: "",
    };
  },
  mounted() {
    var url = this.urlParam("url");
    if (url) {
      this.downloadFile(url);
    }
  },
  created() {},
  methods: {
    runit() {
      var that = this;
      this.clear();
      Sk.pre = "output";
      Sk.configure({ output: that.outf, read: that.builtinRead });
      (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";
      var myPromise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody("<stdin>", false, that.code, true);
      });
      myPromise.then(
        function (mod) {
          that.$message.success("执行完毕");
        },
        function (err) {
          console.log(err);
          that.$message.error(err.toString());
        }
      );
    },
    downloadFile(url) {
      var that = this;
      axios.get(url).then((res) => {
        that.setCode(res.data);
      });
    },
    openFile() {
      var that = this;
      var fileInput = document.getElementById("fileinput");
      fileInput.addEventListener("change", function (e) {
        const reader = new FileReader();
        const thisFileInput = e.target;
        reader.onload = function () {
          that.setCode(this.result);
          that.code = this.result;
        };
        reader.readAsText(thisFileInput.files[0]);
      });
      fileInput.click();
    },
    saveFile() {
      var n = new File([this.code], "python项目.py", {
        type: "text/plain;charset=utf-8",
      });
      saveAs(n);
    },
    submitCode() {
      if (window.submitCode) {
        window.submitCode(this.code);
      }
    },
    setCode(code) {
      this.code = code;
      this.$refs.codeEditor.setCodeContent(code);
    },
    clear() {
      document.getElementById("output").innerHTML = "";
      document.getElementById("mycanvas").innerHTML = "";
    },
    outf(v) {
      var mypre = document.getElementById("output");
      mypre.innerHTML = mypre.innerHTML + v;
    },
    builtinRead(n) {
      if (
        Sk.builtinFiles === undefined ||
        Sk.builtinFiles.files[n] === undefined
      )
        throw `File not found: '${n}'`;
      return Sk.builtinFiles.files[n];
    },
    urlParam(name) {
      var results = new RegExp("[\\?&]" + name + "=([^&#]*)").exec(
        window.location.href
      );
      if (!results) {
        return 0;
      }
      return results[1] || 0;
    },
  },
};
</script>

<style lang="less">
.CodeMirror {
  /* Set height, width, borders, and global font properties here */
  font-family: monospace;
  // height: calc(100vh) !important;
  color: black;
  direction: ltr;
}
#output {
  border: 1px solid black;
  height: 10rem;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}

#mycanvas {
  border: 1px solid black;
  height: 40vh;
  width: 100%;
}
.control {
  margin: 10px;
  button {
    margin: 10px 0;
  }
}
.ant-layout-header {
  background: #dfefff;
}
.ant-layout-sider {
  padding: 10px;
}
</style>