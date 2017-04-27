<template>
	<layout-golden class=".screen">
		<gl-col :closable="false">
			<gl-component title="compA">
				<h1>CompA</h1>
				<button @click="bottomSheet = !bottomSheet">Toggle</button>
			</gl-component>
			<gl-component v-if="bottomSheet">
				<h1>Bottom</h1>
			</gl-component>
		</gl-col>
	</layout-golden>
</template>
<style lang="stylus">
.lm_goldenlayout .lm_content
	overflow auto 	/* We need to be able to see the content of the items when they overflow */
body
	overflow hidden 	/* The 'light' theme let a scroll-bar on the right of the main container */
.screen
	width 100vw
	height 100vh
	display flex
	flex-direction column
</style>
<script>
import Vue = require('Vue');
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'

@Component
export default class App extends Vue {
	bottomSheet = false
}
</script>