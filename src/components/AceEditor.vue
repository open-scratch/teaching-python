<template>
  <div>
    <editor
      v-model="code"
      @init="editorInit"
      :options="options"
      :lang="language"
      theme="monokai"
      :height="height"
      ref="aceEditor"
    />
  </div>
</template>

<script>
import ace from "brace";
export default {
  name: "AceEditor",
  components: {
    editor: require("vue2-ace-editor"),
  },
  props: {
    // 外部传入的内容，用于实现双向绑定
    value: {
      type: String,
      default: "",
    },
    //是否只读
    readOnly: {
      type: [Boolean, String],
      default: false,
    },
    // 外部传入的语法类型
    language: {
      type: String,
      default: "python",
    },
    height: {
      type: [Number, String],
      default: 800,
    },
  },
  data() {
    return {
      options: {
        readOnly: this.readOnly,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        // enableBasicAutocompletion: [{
        //     getCompletions: (editor, session, pos, prefix, callback) => {
        //     // note, won't fire if caret is at a word that does not have these letters
        //     callback(null, [
        //         {name: 'hello', value: 'hello', score: 1, meta: 'some comment'},
        //         {name: 'world', value: 'world', score: 1, meta: 'some other comment'},
        //         ]);
        //         },
        // }],
      },
      code: "",
      editor: null,
    };
  },
  mounted() {
    this.setCodeContent(this.value || this.code);
    console.log(this.editor.completers);
    // 加入自定义语法提示
  },
  methods: {
    editorInit(editor) {
      require("brace/ext/language_tools");
      require("brace/mode/python");
      require("brace/theme/tomorrow_night_blue");
      require("brace/theme/monokai");
      require("brace/snippets/python");

      // editor.on('change', this.change);
      //   editor.commands.addCommand({
      //     name: "save",
      //     bindKey: { win: "Ctrl-S", mac: "Command-S" },
      //     exec: (editor) => this.$emit("save-change", this.value, editor),
      //   });
      //   editor.commands.addCommand({
      //     name: "formatter",
      //     bindKey: { win: "Ctrl-Shift-F", mac: "Command-Shift-F" },
      //     exec: () => this.$emit("formatter", this.editor),
      //   });
      let that = this;
      let langTools = ace.acequire("ace/ext/language_tools");
      var customCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
          that.setCompletions(editor, session, pos, prefix, callback);
        },
      };
      langTools.addCompleter(customCompleter);

      this.editor = editor;
    },
    setCompletions(editor, session, pos, prefix, callback) {
      // ace自定义提示文字列表
      let data = [
        { caption: "test", meta: "解释：测试关键词", value: "testKeyWord" },
      ];
      if (prefix.length == 0) {
        return callback(null, []);
      } else {
        return callback(null, data);
      }
    },
    getCodeContent() {
      return this.code;
    },
    setCodeContent(val) {
      this.code = val;
    },
  },
};
</script>

<style>
</style>