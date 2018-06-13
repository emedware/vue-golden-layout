<template>
	<layout-golden class="screen">
		<gl-col :closable="false">
			<gl-component title="compA">
				<h1>CompA</h1>
				tab: {{selected}}
				<button @click="bottomSheet = !bottomSheet">Toggle</button>
			</gl-component>
			<gl-stack v-model="selected">
				<gl-component title="compB" tab-id="b">
					<h1>CompB</h1>
					<button @click="selected = 'c'">Toggle</button>
				</gl-component>
				<gl-component title="compC" tab-id="c">
					<h1>CompC</h1>
					<button @click="selected = 'b'">Toggle</button>
				</gl-component>
			</gl-stack>
			<gl-component v-if="bottomSheet">
				<h1>Bottom</h1>
			</gl-component>
		</gl-col>
	</layout-golden>
</template>
<style>
body {
	overflow: hidden; 	/* The 'light' theme let a scroll-bar on the right of the main container */
}
.screen {
	width: 100vw;
	height: 100vh;
}
</style>
<script lang="ts">
import Vue from 'vue'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'

@Component
export default class App extends Vue {
	bottomSheet = false
	selected: string = 'b'
}
</script>