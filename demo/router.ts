import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
export const letters = 'abcdef';
import layoutRoute from './layout-route.vue';
const routes: RouteConfig[] = [{
		name: 'spec-lr',
		path: '/lr',
		component: layoutRoute,
		meta: {title: 'Layout route'}
}];
for(let l of letters) {
	let L = l.toUpperCase();
	routes.push({
		name: `r-${l}`,
		path: `/${l}`,
		component: {template: `<p>test-${L}</p>`},
		meta: {title: `${L}-test`}
	});
}

export default new VueRouter({
	mode: 'hash',
	routes
})
Vue.use(VueRouter);