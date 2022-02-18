import Vue from 'vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue'

Vue.use(ElementUI);

Vue.config.productionTip = false

import comm from './components/index'
Vue.prototype.$comm = comm

new Vue({
  router,
  store,
  el: '#app',
  render: h => h(App)
}).$mount('#app')
