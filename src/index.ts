import 'golden-layout/src/css/goldenlayout-base.css'
import goldenLayout from './golden.vue'
import glComponent from './gl-component.vue'
import {glRow, glCol, glStack} from './gl-groups'
import glDstack from './gl-dstack'
import glRouter from './gl-router'

export {goldenLayout, glComponent, glRow, glCol, glStack, glRouter, glDstack}

var components = {layoutGolden: goldenLayout, goldenLayout, glComponent, glRow, glCol, glStack, glRouter, glDstack}
export default {
	install(Vue, options) {
		for(let i in components)
			Vue.component(i, components[i]);
	}
};