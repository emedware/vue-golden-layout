import 'golden-layout/src/css/goldenlayout-base.css'
import goldenLayout from './golden.vue'
import glComponent from './gl-component.vue'
import {glRow, glCol, glStack} from './gl-group'
import glRouter from './gl-router'

export {goldenLayout, glComponent, glRow, glCol, glStack, glRouter}

var components = {layoutGolden: goldenLayout, goldenLayout, glComponent, glRow, glCol, glStack, glRouter}
export default {
	install(Vue, options) {
		for(let i in components)
			Vue.component(i, components[i]);
	}
};