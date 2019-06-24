import 'golden-layout/src/css/goldenlayout-base.css'
import goldenLayout from './golden.vue'
export { registerGlobalComponent } from './golden.vue'
import glComponent from './gl-component.vue'
import { glRow, glCol, glStack } from './gl-groups'
import glDstack from './gl-dstack'
import glRouter from './router/gl-router.vue'
import glRoute from './router/gl-route.vue'
import glContainerRoute from './router/gl-container-route.vue'
export { glCustomContainer } from './roles'
export { isSubWindow } from './utils';

var components : any = {
	goldenLayout, glComponent,
	glRow, glCol, glStack, glDstack,
	glRouter, glRoute, glContainerRoute
};

export {
	goldenLayout, glComponent,
	glRow, glCol, glStack, glDstack,
	glRouter, glRoute, glContainerRoute
}

export default {
	install(Vue : any) {
		for(let i in components)
			Vue.component(i, components[i]);
	}
};