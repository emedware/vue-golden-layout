import Vue from 'vue'
import vgl from 'vue-golden-layout'
import 'golden-layout/src/css/goldenlayout-light-theme.css'
Vue.use(vgl)

import App from './app.vue'
import router from './router'

new App({router, el: 'app'});