export const isSubWindow = /[?&]gl-window=/.test(window.location.search);
import { goldenItem, goldenChild } from "./roles";
export type Dictionary<T = any> = {[key: string]: T}
import * as GoldenLayout from 'golden-layout'
import * as $ from 'jquery'

export function newSemaphore<T>(): Semaphore<T> {
	var access, rv = new Promise<T>(function(resolve, reject) {
		access = {resolve, reject};
	});
	Object.assign(rv, access);
	return <Semaphore<T>>rv;
}

export interface Semaphore<T> extends Promise<T> {
	resolve: (arg?: T)=> void;
	reject: (arg?: T)=> void;
}

type responseCallBack = (...params: any[])=> any;
const queryCallBacks: Dictionary<responseCallBack> = {};
const queryEvent = '$$query';
const responseEvent = '$$response';
const errorEvent = '$$error';
var queryId = 0;
const queries: Dictionary<Semaphore<any>> = {}

declare global {
	interface Document {
		createEventObject(): any;
	}
	interface Window {
		fireEvent(event: string, object: any): void;
	}
}

function sendResponse(queryId: number, name: string, sub: Window, result: any, failure?: boolean) {
	var event, eventName = failure?errorEvent:responseEvent;

	if(document.createEvent) {
		event = sub.document.createEvent('HTMLEvents');
		event.initEvent(eventName, true, true);
	} else {
		event = sub.document.createEventObject();
		event.eventType = eventName;
	}

	event.eventName = eventName;
	event.queryId = queryId;
	event.result = result;

	if(document.createEvent) {
		sub.dispatchEvent(event);
	} else {
		sub.fireEvent('on' + event.eventType, event);
	}
}
var lm = (<any>GoldenLayout).__lm;
Object.assign(lm.utils.EventHub.prototype, {
	query: async function(name: string, ...args: any[]) {
		var rv = newSemaphore<any>();
		queries[++queryId] = rv;
		(<any>this).emit(queryEvent, queryId, name, ...args);
		return rv;
	},
	response: function(name: string, cb: responseCallBack) {
		console.assert(!queryCallBacks[name], `Query ${name} defined only once.`);
		queryCallBacks[name] = cb;
	}
});

/// Equivalent of `obj instanceof name` but accepting cross-windows classes.
// Ex: A popup and the main window buth have an `Array` class defined - and they are different
//  Therefore `x instanceof Array` will return false if the Array class is from the other window
export function xInstanceOf(obj: any, name: string) {
	var browser = obj.constructor;
	while(browser.name !== name && browser.super)
		browser = browser.super;
	return browser.name === name;
}

export function localWindow(obj: any): any {
	if(!obj || 'object'!= typeof obj)
		return obj;
	var rv: Dictionary = xInstanceOf(obj, 'Array') ? [] : {};
	for(let i in obj) rv[i] = localWindow(obj[i]);
	return rv;
}

export var statusChange = {
	poppingOut: false,
	poppingIn: false,
	unloading: false
};

// hook `createPopout` to give objects instead of destroying then on-destroy
var oldCreatePopout = lm.LayoutManager.prototype.createPopout;
lm.LayoutManager.prototype.createPopout = function(item: any) {
	var rv: any;
	statusChange.poppingOut = true;
	try {
		item.emit && item.emit('beforePopOut', item);
		if(!(item.contentItems || item[0].content).length) return null;
		rv = oldCreatePopout.apply(this, arguments);
	} finally {
		statusChange.poppingOut = false;
	}
	item.emit && item.emit('poppedOut', rv);
	if(item[0]) item = item[0];
	var rootPaths: Dictionary<goldenChild> = {}, gl = this.vueObject;
	function ref(path: string) { rootPaths[path] = gl.getChild(path); }
	if(item.content) {	//config
		if(item.vue) ref(item.vue);
		for(let i=0; item.content[i]; ++i)
			ref(item.content[i].vue);
	} else {	//item
		var obj = item.vueObject;
		if(obj && obj.nodePath) rootPaths[obj.nodePath] = obj;
		for(let sub of item.contentItems) {
			obj = sub.vueObject;
			rootPaths[obj.nodePath] = obj;
		}
	}
	var ppWindow = rv.getWindow();
	ppWindow.poppedoutVue = {
		layout: gl,
		path: rootPaths
	};
	ppWindow.addEventListener('beforeunload', ()=> {
		if(!rv.poppedIn) for(let p in rootPaths) rootPaths[p].delete();
	});
	rv.on('initialised', ()=> {
		var ppGl = rv.getGlInstance(), emptyCheck: ReturnType<typeof setTimeout>|null = null;
		//Automatically closes the window when there is no more tabs
		ppGl.on('itemDestroyed', ()=> {
			if(!emptyCheck) emptyCheck = setTimeout(()=> {
				emptyCheck = null;
				if(!ppGl.root.contentItems.length)
					ppWindow.close();
			});
		});
	});
	return rv;
}

var bp = lm.controls.BrowserPopout.prototype;

// hook `createPopout` to give objects instead of destroying then on-destroy
var oldPopIn = bp.popIn;
bp.popIn = function() {
	var rv;
	statusChange.poppingIn = true;
	// GL bug-fix: poping-in empty window
	try {
		this.emit('beforePopIn');
		this.poppedIn = true;
		rv = this.getGlInstance().root.contentItems.length ?
			oldPopIn.apply(this, arguments) :
			this.close();
	} finally {
		statusChange.poppingIn = false;
	}
	return rv;
}

window.addEventListener('beforeunload', ()=> { statusChange.unloading = true; });

export function isDragging(): boolean {
	return $('body').hasClass('lm_dragging');
}
