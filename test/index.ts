import Vue from 'vue'
import vgl from 'vue-golden-layout'
import 'golden-layout/src/css/goldenlayout-light-theme.css'
Vue.use(<any>vgl)

import App from './test.vue'
import router from './router'

new App({
	router,
	el: 'app'
});