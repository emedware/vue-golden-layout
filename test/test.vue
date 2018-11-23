<template>
<div>
	<button class="reset" @click="reset">Reset localStorage</button>
	<golden-layout class="hscreen" @state="changedState" :state="state">
		<div slot="stackCtr" slot-scope="{ stackSub }" class="test-template">
			Added item (id: {{stackSub}})
			<button @click="remStack(stackSub)">Remove</button>
		</div>
		<template slot="bottom">
			Bottom
		</template>
		<gl-col :closable="false">
			<gl-router>
				<template slot="route" slot-scope="{ meta }">
					<p-head :title="meta.title" />
					<main />
				</template>
			</gl-router>
			<gl-row :closable="false">
				<gl-component title="compA" class="test-component">
					<h1>CompA</h1>
					<button @click="bottomSheet = !bottomSheet">Toggle</button>
					<button @click="addStack">Add</button>
					<p>
						<span v-for="l in letters" :key="l">
							<router-link :to="`/${l}`">test-{{l}}</router-link>&nbsp;
						</span>
					</p>
				</gl-component>
				<gl-dstack ref="myStack" dstack-id="dynamics">
					<gl-component title="Dstack demonstration" :closable="false" :reorder-enabled="false">
						This element is just present to test the ability of the d-stack if this stack happens to be popped out.
					</gl-component>
					<gl-component v-for="stackSub in stackSubs" :key="stackSub"
						:title="'dynamic'+stackSub"
						@destroy="closed(stackSub)"
						template="stackCtr" :state="{stackSub}" />
				</gl-dstack>
			</gl-row>
			<gl-component v-if="bottomSheet" template="bottom" @destroy="bottomSheet = false" />
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
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import {letters} from './router'
import PHead from './p-head.vue'

var stored = localStorage.browserGL;
stored = stored ? JSON.parse(stored) : {
	state: null,
	stackSubs: [1],
	ssId: 1,
	bottomSheet: false
};

@Component({components: {PHead}})
export default class App extends Vue {
	bottomSheet = stored.bottomSheet
	stackSubs: number[] = stored.stackSubs
	ssId: number = stored.ssId
	devWarned = false
	state = stored.state
	letters = letters

	changedState(state) {
		localStorage.browserGL = JSON.stringify({
			state,
			stackSubs: this.stackSubs,
			ssId: this.ssId,
			bottomSheet: this.bottomSheet
		});
	}
	reset() {
		delete localStorage.browserGL;
		location.reload();
	}
	closed(n) {
		var ndx = this.stackSubs.indexOf(n);
		console.assert(!!~ndx, 'Element in state array');
		this.stackSubs.splice(ndx, 1);
	}
	addStack() {
		this.stackSubs.push(++this.ssId);
	}
	remStack(id) {
		var ndx = this.stackSubs.indexOf(id);
		if(~ndx)
			this.stackSubs.splice(ndx, 1);
	}
}
</script>