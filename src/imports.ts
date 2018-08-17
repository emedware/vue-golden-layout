//TODO: TS errors on types
import VueType, * as vue, { VueConstructor } from 'vue'
export const Vue: VueConstructor<VueType> = VueType || <any>vue;
