import Vue from 'vue'
import vgl from '../dist/vue-golden-layout.js'
//import vgl from '../src'
Vue.use(<any>vgl)

import App from './test.vue'

new App({el: 'app'});