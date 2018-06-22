import 'golden-layout/src/css/goldenlayout-base.css'
import layoutGolden from './golden.vue'
import glComponent from './gl-component.vue'
import {glRow, glCol, glStack} from './gl-group'
import goldenRouter from './router.vue'

export {layoutGolden, glComponent, glRow, glCol, glStack, goldenRouter}

var components = {layoutGolden, glComponent, glRow, glCol, glStack, goldenRouter}
export default {
	install(Vue, options) {
		for(let i in components)
			Vue.component(i, components[i]);
	}
};