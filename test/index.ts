import * as Vue from 'vue'
import vgl from '../dist/vue-golden-layout'
//import vgl from '../src'
Vue.use(<any>vgl)

import App from './test.vue'

new Vue({
	el: 'app',
	components: {
		App: <typeof Vue>App
	}
});