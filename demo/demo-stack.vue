<template>
	<gl-row :closable="false">
		<gl-component title="compA" class="test-component">
			<h1>CompA</h1>
			<button @click="state.bottomSheet = !state.bottomSheet">Toggle</button>
			<button @click="addStack">Add</button>
			<p><input v-model="testText" /></p>
			<p>
				<router-link to="/lr">Layout-route</router-link>&nbsp;
				<span v-for="l in letters" :key="l">
					<router-link :to="`/${l}`">test-{{l}}</router-link>&nbsp;
				</span>
			</p>
		</gl-component>
		<gl-dstack>
			<gl-component title="Dstack demonstration" :closable="false" :reorder-enabled="false">
				This element is just present to test the ability of the d-stack if this stack happens to be popped out.
			</gl-component>
			<gl-component v-for="stackSub in state.stackSubs" :key="stackSub"
					:title="'dynamic'+stackSub"
					@destroy="remStack(stackSub)"
					:state="{stackSub}">
				Dynamic item (id: {{stackSub}})
				<button @click="remStack(stackSub)">Remove</button>
				<p><input v-model="testText" /></p>
			</gl-component>
		</gl-dstack>
	</gl-row>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Model, Prop, Watch, Emit } from 'vue-property-decorator'
import { glCustomContainer } from 'vue-golden-layout'
import { letters } from './router'

@Component
export default class demoStack extends glCustomContainer {
	@Model('changeState') state: {
		bottomSheet: boolean,
		stackSubs: number[],
		ssId: number
	}
	
	@Watch('state', {deep: true})
	@Emit() changeState() { }

	letters = letters
	testText = "testing text."
	addStack() {
		this.state.stackSubs.push(++this.state.ssId);
	}
	remStack(id: number) {
		var ndx = this.state.stackSubs.indexOf(id);
		if(~ndx)
			this.state.stackSubs.splice(ndx, 1);
	}
}
</script>