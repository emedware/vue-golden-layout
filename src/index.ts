import 'golden-layout/src/css/goldenlayout-base.css'
import goldenLayout from './golden.vue'
export { registerGlobalComponent } from './golden.vue'
import glComponent from './gl-component.vue'
import { glRow, glCol, glStack } from './gl-groups'
import glDstack from './gl-dstack'
import glRouter from './router/gl-router.vue'
import glRoute from './router/gl-route.vue'
import glContainerRoute from './router/gl-container-route.vue'
import glDrag from './gl-drag.vue'
export { glCustomContainer } from './roles'

var components : any = {
	goldenLayout, glComponent,
	glRow, glCol, glStack, glDstack,
	glRouter, glRoute, glContainerRoute,
	glDrag
};

export {
	goldenLayout, glComponent,
	glRow, glCol, glStack, glDstack,
	glRouter, glRoute, glContainerRoute,
	glDrag
}

export default {
	install(Vue : any) {
		for(let i in components)
			Vue.component(i, components[i]);
	}
};