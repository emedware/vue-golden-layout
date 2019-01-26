import Vue from 'vue';
export const letters = 'abcdef';
const routes = [];
for(let l of letters) {
	let L = l.toUpperCase();
	routes.push({
		name: `r-${l}`,
		path: `/${l}`,
		component: {template: `<p>test-${L}</p>`},
		meta: {title: `${L}-test`}
	});
}

import VueRouter from 'vue-router'

export default new VueRouter({
	mode: 'history',
	routes
})
Vue.use(VueRouter);