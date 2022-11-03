<template>
  <div>
    <a-layout>
      <a-layout-header style="padding: 0; height: 50px">
        <!-- 控制按钮 -->
        <a-menu mode="horizontal" style="color: black; height: 100%">
          <a-sub-menu>
            <span slot="title" class="submenu-title-wrapper">
              <a-icon type="file" />文件
            </span>
            <a-menu-item-group>
              <a-menu-item key="setting:1">
                <a type="primary" @click="openFile">打开</a>
              </a-menu-item>
              <a-menu-item key="setting:2">
                <a type="primary" @click="saveFile">保存</a>
              </a-menu-item>
            </a-menu-item-group>
          </a-sub-menu>

          <a-menu-item>
            <a-input
              v-model="projectName"
              placeholder="请输入项目名称"
              style="width: 200px"
            ></a-input>
          </a-menu-item>
          <a-menu-item>
            <a-button type="primary" @click="submitCode">提交</a-button>
          </a-menu-item>
          <a-menu-item>
            <a-button type="primary" @click="runit"><a-icon type="play-circle"/>运行</a-button>
          </a-menu-item>
          <a-menu-item>
            <a-button type="primary" @click="clear"><a-icon type="delete"/>清空</a-button>
          </a-menu-item>
          <a-menu-item>
            <a-button type="default" @click="toHome">返回</a-button>
          </a-menu-item>
          <a-menu-item style="float: right" v-if="username">
            <div class="right-menu">
              <img :src="avatar" alt="" />
              <span>{{ username }}</span>
            </div>
          </a-menu-item>
        </a-menu>
        <input type="file" id="fileinput" style="display: none" />
      </a-layout-header>
      <a-layout>
        <a-layout-content>
          <a-form-item>
            <JCodeEditor
              v-if="editorType == 'codemirror'"
              language="python"
              v-model="code"
              :fullScreen="true"
              placeholder="请输入代码"
              ref="codeEditor"
            />
            <AceEditor
              v-if="editorType == 'ace'"
              language="python"
              v-model="code"
              :height="'calc(100vh - 74px)'"
              ref="codeEditor"
            />
          </a-form-item>
        </a-layout-content>
        <a-layout-sider :collapsible="false" :width="500" :theme="'light'">
          <!-- 画布 -->
          <div id="mycanvas"></div>
          <!-- 代码输出 -->
          <pre id="output">{{ out }}</pre>
        </a-layout-sider>
      </a-layout>
      <!-- <a-layout-footer></a-layout-footer> -->
    </a-layout>
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
      projectName: "",
      username: "",
      avatar: "./static/avatar.png",
    };
  },
  mounted() {},
  created() {
    var that = this;
    //载入网络项目
    var url = this.urlParam("url");
    if (url) {
      this.downloadFile(url);
    } else {
      this.downloadFile("./static/defaultPython.py");
    }
    //兼容载入项目事件
    window.document.addEventListener("loadPorject", function (e) {
      console.log("load project:");
      console.log(e.detail);
      that.projectName = e.detail.projectName;
      that.downloadFile(e.detail.url);
    });
    window.document.addEventListener("setUserInfo", function (e) {
      console.log("set user info:");
      console.log(e.detail);
      that.username = e.detail.username;
      if (e.detail.avatar) that.avatar = e.detail.avatar;
    });
  },
  methods: {
    runit() {
      var that = this;
      this.clear();
      Sk.pre = "output";
      Sk.configure({ output: that.terminalOut, read: that.builtinRead });
      (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";
      var myPromise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody("<stdin>", false, that.getCode(), true);
      });
      myPromise.then(
        function (mod) {
          that.$message.success("执行完毕");
        },
        function (err) {
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
      var n = new File(
        [this.code],
        (this.projectName ? this.projectName : "未命名") + ".py",
        {
          type: "text/plain;charset=utf-8",
        }
      );
      saveAs(n);
    },
    submitCode() {
      if (this.code == "") {
        this.$message.info("没有代码可以提交");
      }
      if (window.submitCode) {
        window.submitCode(this.projectName, this.getCode());
      }
    },
    setCode(code) {
      this.code = code;
      this.$refs.codeEditor.setCodeContent(code);
    },
    getCode() {
      this.code = this.$refs.codeEditor.getCodeContent();
      return this.code;
    },
    clear() {
      document.getElementById("output").innerHTML = "";
      document.getElementById("mycanvas").innerHTML = "";
    },
    terminalOut(v) {
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
    toHome(){
      window.location.href='/account/center'
    }
  },
};
</script>

<style lang="less">
.CodeMirror {
  /* Set height, width, borders, and global font properties here */
  font-family: monospace;
  height: calc(100vh - 74px) !important;
  color: black;
  direction: ltr;
}
#output {
  border: 1px solid black;
  height: 40vh;
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
  background: #dfefff !important;
}
.ant-layout-sider {
  padding: 10px;
}
.right-menu {
  // float: right;
  padding: 5px 10px;
  input {
    width: 200px;
    margin-right: 20px;
  }
  img {
    height: 30px;
    width: auto;
  }
}
</style>