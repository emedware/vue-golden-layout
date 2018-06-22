import Vue from 'vue';
const routes = [
	{ path: '/a', component: {template: '<p>test-A</p>'}},
	{ path: '/b', component: {template: '<p>test-B</p>'}}
];

import VueRouter from 'vue-router'

export default new VueRouter({
  routes
})
Vue.use(VueRouter);