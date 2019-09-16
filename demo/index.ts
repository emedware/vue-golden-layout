import Vue from 'vue'
import vgl from 'vue-golden-layout'
import 'golden-layout/src/css/goldenlayout-light-theme.css'
Vue.use(vgl)

import App from './app.vue'
import router from './router'

// If you want to debug the loading code of a popup, set this to true.
// It will cause popups to wait for devtools to be opened before actually loading
var debuggingPopoutLoading = false,
	waiter = debuggingPopoutLoading && /[?&]gl-window=/.test(window.location.search) ?
		new Promise(function(resolve, _) {
// https://stackoverflow.com/questions/7798748/find-out-whether-chrome-console-is-open/7814241#7814241
			var element = new Image();
			Object.defineProperty(element, 'id', {
				get:function() {
					setTimeout(resolve, 500);
					throw new Error("Dev tools checker");
				}
			});
			console.dir(element);
		}) :
		Promise.resolve();

async function load() {
	await waiter;

	new App({router, el: 'app'});
}
load();