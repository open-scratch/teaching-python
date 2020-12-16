// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import AppPlayer from './AppPlayer'

import Antd, { version } from 'ant-design-vue'
// import 'ant-design-vue/dist/antd.less';
import 'ant-design-vue/dist/antd.css';

Vue.config.productionTip = false

Vue.use(Antd)


/* eslint-disable no-new */
new Vue({
  el: '#player',
  components: { AppPlayer },
  template: '<AppPlayer/>'
})
