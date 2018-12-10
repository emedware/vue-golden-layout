import 'golden-layout/src/css/goldenlayout-base.css'
import goldenLayout, {registerGlobalComponent} from './golden.vue'
import glComponent from './gl-component.vue'
import {glRow, glCol, glStack} from './gl-groups'
import glDstack from './gl-dstack'
import glRouter, { glRoute } from './gl-router'

export {goldenLayout, registerGlobalComponent, glComponent, glRow, glCol, glStack, glRouter, glRoute, glDstack}

var components : any = {layoutGolden: goldenLayout, goldenLayout, glComponent, glRow, glCol, glStack, glRouter, glRoute, glDstack}
export default {
	install(Vue : any, options : any) {
		for(let i in components)
			Vue.component(i, components[i]);
	}
};