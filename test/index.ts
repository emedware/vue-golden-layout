import * as Vue from 'vue'
import wgl from '../src'
Vue.use(wgl)

import App from './test.vue'

new Vue({
	el: 'app',
	components: {
		App: <typeof Vue>App
	}
});