<template>
<div>
	<button class="reset" @click="reset">Reset localStorage</button>
	<golden-layout class="hscreen" v-model="state" @sub-window="subWindow">
		<template slot="bottom">
			Bottom
		</template>
		<gl-col :closable="false">
			<gl-router>
				<gl-route name="r-a" />
				<template slot="route" slot-scope="{ meta }">
					<p-head :title="meta.title" />
					<main />
				</template>
			</gl-router>
			<d-stack v-model="dstackState" />
			<gl-component v-if="dstackState.bottomSheet" template="bottom" @destroy="dstackState.bottomSheet = false" />
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
import { Component, Inject, Model, Prop, Watch } from 'vue-property-decorator'
import { letters } from './router'
import PHead from './p-head.vue'
import dStack from './d-stack.vue'
import Persistance from 'vue-storage-decorator'

const Persist = Persistance('browserGL');
@Component({components: {PHead, dStack}})
export default class App extends Vue {
	@Persist() state: any = null
	@Persist() dstackState = {
		bottomSheet: false,
		stackSubs: [1],
		ssId: 1
	}
	letters = letters

	subWindow(is: boolean) {
		Persist.persisting = !is;
	}
	reset() {
		delete localStorage.browserGL;
		location.reload();
	}
}
</script>