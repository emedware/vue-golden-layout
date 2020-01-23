import 'golden-layout/src/css/goldenlayout-base.css'
import goldenLayout from './golden.vue'
export { registerGlobalComponent } from './golden.vue'
import glComponent from './gl-component.vue'
import { glRow, glCol, glStack } from './gl-groups'
import glDstack from './gl-dstack'
import glRouter from './router/gl-router.vue'
import glRoute from './router/gl-route.vue'
export { glCustomContainer } from './roles'
export { isSubWindow } from './utils';
import Vue, { VueConstructor } from 'vue'

var components : any = {
	goldenLayout, glComponent,
	glRow, glCol, glStack, glDstack,
	glRouter, glRoute
};

export {
	goldenLayout, glComponent,
	glRow, glCol, glStack, glDstack,
	glRouter, glRoute
}

/**
 * Vue plugin installation
 */
export default {
	install(vue : VueConstructor<Vue>) {
		for(let i in components)
			vue.component(i, components[i]);
	}
};