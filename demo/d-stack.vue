<template>
	<gl-row :closable="false">
		<div slot="stackCtr" slot-scope="{ stackSub }" class="test-template">
			Added item (id: {{stackSub}})
			<button @click="remStack(stackSub)">Remove</button>
			<p><input v-model="testText" /></p>
		</div>
		<gl-component title="compA" class="test-component">
			<h1>CompA</h1>
			<button @click="toggle">Toggle</button>
			<button @click="addStack">Add</button>
			<p><input v-model="testText" /></p>
			<p>
				<router-link to="/lr">Layout-route</router-link>&nbsp;
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
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Model, Prop, Watch, Emit } from 'vue-property-decorator'
import { glCustomContainer } from 'vue-golden-layout'
import { letters } from './router'

export default class dStack extends glCustomContainer {
	/*@Persist()*/ stackSubs: number[] = [1]
	/*@Persist()*/ ssId: number = 1
	/*@Persist()*/ @Model('toggle') bottomSheet: boolean = false
	@Emit() toggle() { return !this.bottomSheet; }
	letters = letters
	testText = "testing text."
	closed(n: number) {
		var ndx = this.stackSubs.indexOf(n);
		console.assert(!!~ndx, 'Element in state array');
		this.stackSubs.splice(ndx, 1);
	}
	addStack() {
		this.stackSubs.push(++this.ssId);
	}
	remStack(id: number) {
		var ndx = this.stackSubs.indexOf(id);
		if(~ndx)
			this.stackSubs.splice(ndx, 1);
	}
}
</script>