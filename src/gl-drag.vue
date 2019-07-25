<template>
  <div class="glDrag" ref="handle">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { ComponentConfig } from "golden-layout";

// finds the nearest parent that has a layout object
function getGLO(component: any): any {
  if (component.layout && component.layout.glo) {
    return component.layout.glo;
  } else {
    if (component.$parent) {
      return getGLO(component.$parent);
    } else {
      return null;
    }
  }
}

function getGLRoot(component:any) : any {
  let comp : any = component;
  while(comp) {
    if(comp.registerComponent) return comp;
    comp = comp.$parent;
  };
  return null;
}

@Component
export default class glDrag extends Vue {
  @Prop() component: string;
  @Prop() data: any;
  dragSource: any = null;
  constructor() {
    super();
  }

  async mounted() {
    const handle: HTMLElement = <HTMLElement>this.$refs.handle;
    const lm = await getGLO(this);
    console.log(this)
    console.log(lm)
    const glr = getGLRoot(this);
    console.log(glr)

    this.dragSource = lm.createDragSource(handle, <ComponentConfig>{
      type: "component",
      componentName: this.component,
      componentState: this.data
    });
  }

  async beforeDestroy() {
    this.dragSource._dragListener.destroy();
  }
}
</script>