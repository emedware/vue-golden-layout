import Vue = require('vue')
import wgl from '../src'
Vue.use(wgl)

import App = require('./test.vue');

new Vue({
	el: 'body',
	components: {
		App
	}
});