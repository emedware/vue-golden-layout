<template>
	<div>
		<golden-layout class="hscreen" ref="topGl" @state="changedState" :state="state">
			<template slot="stackCtr" slot-scope="{ stackSub }">
				Added item (id: {{stackSub}})
				<button @click="remStack(stackSub)">Remove</button>
			</template>
			<template slot="bottom">
				Bottom
			</template>
			<gl-col :closable="false">
                <gl-router>
                    <div slot-scope="{ meta }">
                        <div> Title: {{meta && meta.title}} </div>
                        <main />
                    </div>
                </gl-router>
				<gl-row :closable="false">
					<gl-component title="compA">
						<h1>CompA</h1>
						<button @click="bottomSheet = !bottomSheet">Toggle</button>
						<button @click="addStack">Add</button>
                        <p>
                            <span v-for="l in letters" :key="l">
                                <router-link :to="`/${l}`">test-{{l}}</router-link>&nbsp;
                            </span>
						</p>
					</gl-component>
					<gl-stack ref="myStack">
						<gl-component v-for="stackSub in stackSubs" :key="stackSub"
							:title="'dynamic'+stackSub"
                            @destroy="closed(stackSub)"
							template="stackCtr" :state="{stackSub}" />
					</gl-stack>
				</gl-row>
				<gl-component v-if="bottomSheet" template="bottom" />
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
import {letters} from './router'

var stored = localStorage.browserGL;
stored = stored ? JSON.parse(stored) : {
    state: null,
    stackSubs: [1],
    ssId: 1
};

@Component
export default class App extends Vue {
	bottomSheet = false
	stackSubs: number[] = stored.stackSubs
	ssId: number = stored.ssId
	devWarned = false
	state = stored.state
	letters = letters

	changedState(state) {
		localStorage.browserGL = JSON.stringify({
            state,
            stackSubs: this.stackSubs,
            ssId: this.ssId
        });
	}
    closed(n) {
        var ndx = this.stackSubs.indexOf(n);
        console.assert(!!~ndx, 'Element in state array');
        this.stackSubs.splice(ndx, 1);
    }
	addStack() {
		//this.$refs.myStack.addGlChild(...)
		this.stackSubs.push(++this.ssId);
	}
	remStack(id) {
		var ndx = this.stackSubs.indexOf(id);
		if(~ndx)
			this.stackSubs.splice(ndx, 1);
	}
	// this.$refs.topGl.gl is the golden-layout object
}
</script>