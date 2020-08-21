<template>
	<div>
		<button class="reset" @click="reset">Reset localStorage</button>
		<golden-layout class="hscreen" v-model="state" @creation-error="reset">
			<gl-col :closable="false">
				<gl-router empty-route="/a" :routes="routes">
					<template slot="route" slot-scope="{ meta }">
						<p-head :title="meta.title" />
						<main />
					</template>
				</gl-router>
				<demo-stack :state="demoStackState" />
				<gl-component title="Bottom" v-if="demoStackState.bottomSheet" @destroy="demoStackState.bottomSheet = false">
					<p>Routes: {{routes}}</p>
				</gl-component>
			</gl-col>
		</golden-layout>
	</div>
</template>
<style>
body {
	overflow: hidden; 	/* The 'light' theme let a scroll-bar on the right of the main container */
}
.hscreen {
	width: 100vw;
	height: 100vh;
}
.reset {
	position: absolute;
	bottom: 0;
	right: 0;
	float: right;
	z-index: 9000;
}
.reset:hover {
	background-color: red;
}
</style>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { letters } from './router'
import PHead from './p-head.vue'
import demoStack from './demo-stack.vue'
import Persistance from 'vue-storage-decorator'

const Persist = Persistance('browserGL');
//Persist.persisting = false;
@Component({components: {PHead, demoStack}})
export default class App extends Vue {
	@Persist() state: any = null
	@Persist() demoStackState = {
		bottomSheet: false,
		stackSubs: [1],
		ssId: 1
	}
	@Persist() routes = [{path: '/a'}]
	letters = letters

	reset() {
		delete localStorage.browserGL;
		location.reload();
	}
}
</script>