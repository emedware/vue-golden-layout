<template>
	<gl-row :closable="false">
		<div slot="stackCtr" slot-scope="{ stackSub }" class="test-template">
			Added item (id: {{stackSub}})
			<button @click="remStack(stackSub)">Remove</button>
			<p><input v-model="testText" /></p>
		</div>
		<gl-component title="compA" class="test-component">
			<h1>CompA</h1>
			<button @click="state.bottomSheet = !state.bottomSheet">Toggle</button>
			<button @click="addStack">Add</button>
			<gl-drag :component="DragTest" componentName="DragTest" :data="{}">
				<button>Drag</button>
			</gl-drag>
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
			<gl-component v-for="stackSub in state.stackSubs" :key="stackSub"
				:title="'dynamic'+stackSub"
				@destroy="closed(stackSub)"
				template="stackCtr" :state="{stackSub}" />
		</gl-dstack>
	</gl-row>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Model, Prop, Watch, Emit } from 'vue-property-decorator'
import { glCustomContainer, glDrag } from 'vue-golden-layout'
import { letters } from './router'
import DragTest from './dragTest.vue'

@Component({
	components: {
		glDrag, DragTest
	}
})
export default class demoStack extends glCustomContainer {
	DragTest : any = DragTest;

	@Model('changeState') state: {
		bottomSheet: boolean,
		stackSubs: number[],
		ssId: number
	}
	
	@Watch('state', {deep: true})
	@Emit() changeState() { }

	letters = letters
	testText = "testing text."

	closed(n: number) {
		var ndx = this.state.stackSubs.indexOf(n);
		console.assert(!!~ndx, 'Element in state array');
		this.state.stackSubs.splice(ndx, 1);
	}
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