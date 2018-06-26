import Vue from 'vue';
const routes = [
	{ path: '/a', component: {template: '<p>test-A</p>'}, meta: {title: 'A-test'}},
	{ path: '/b', component: {template: '<p>test-B</p>'}, meta: {title: 'B-test'}}
];

import VueRouter from 'vue-router'

export default new VueRouter({
	mode: 'history',
	routes
})
Vue.use(VueRouter);