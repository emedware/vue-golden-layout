import 'golden-layout/src/css/goldenlayout-base.css'
import goldenLayout from './golden.vue'
export { registerGlobalComponent } from './golden.vue'
import glComponent from './gl-component.vue'
import { glRow, glCol, glStack } from './gl-groups'
import glDstack from './gl-dstack'
import glRouter from './router/gl-router'
import glRoute from './router/gl-route'
export { glCustomContainer } from './roles'

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

export default {
	install(Vue : any, options : any) {
		for(let i in components)
			Vue.component(i, components[i]);
	}
};