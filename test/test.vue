<template>
	<div>
		<layout-golden class="hscreen">
			<gl-col :closable="false">
				<gl-row :closable="false">
					<gl-component title="compA">
						<h1>CompA</h1>
						<button @click="bottomSheet = !bottomSheet">Toggle</button>
						<button @click="addStack">Add</button>
						<p>
							<router-link to="/a">test-a</router-link>
							<router-link to="/b">test-b</router-link>
						</p>
					</gl-component>
					<gl-stack ref="myStack">
						<gl-component v-for="stackSub in stackSubs" :key="stackSub" :title="'dynamic'+stackSub">
							Added item (id: {{stackSub}})
							<button @click="remStack(stackSub)">Remove</button>
						</gl-component>
					</gl-stack>
				</gl-row>
				<gl-component v-if="bottomSheet">
					Bottom
				</gl-component>
			</gl-col>
		</layout-golden>
		<golden-router class="hscreen" />
	</div>
</template>
<style>
body {
	overflow: hidden; 	/* The 'light' theme let a scroll-bar on the right of the main container */
}
.hscreen {
	width: 100vw;
	height: 50vh;
}
/* This is a hack to remove when fuse-box has a well-set npm mode */
.glComponent {
	width: 100%;
	height: 100%;
	overflow: auto;
}
</style>
<script lang="ts">
import Vue from 'vue'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'

@Component
export default class App extends Vue {
	bottomSheet = false
	stackSubs = [1]
	ssId: number = 1
	addStack() {
		//this.$refs.myStack.addGlChild(...)
		this.stackSubs.push(++this.ssId);
	}
	remStack(id) {
		var ndx = this.stackSubs.indexOf(id);
		if(~ndx)
			this.stackSubs.splice(ndx, 1);
	}
}
</script>