export const isSubWindow = /[?&]gl-window=/.test(window.location.search);
export type Dictionary<T = any> = {[key: string]: T}
import * as GoldenLayout from 'golden-layout'

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
		this.emit(queryEvent, queryId, name, ...args);
		return rv;
	},
	response: function(name: string, cb: responseCallBack) {
		console.assert(!queryCallBacks[name], `Query ${name} defined only once.`);
		queryCallBacks[name] = cb;
	}
});

/// Equivalent of `obj instanceOf name` but accepting cross-windows classes.
// Ex: A popup and the main window buth have an `Array` class defined - and they are different
//  Therefore `x instanceOf Array` will return false if the Array class is from the other window
export function xInstanceOf(obj: any, name: string) {
	var browser = obj.constructor;
	while(browser.name !== name && browser.super)
		browser = browser.super;
	return browser.name === name;
}

export function localWindow(obj: any) {
	if(!obj || 'object'!= typeof obj)
		return obj;
	var rv = xInstanceOf(obj, 'Array') ? [] : {};
	for(let i in obj) rv[i] = localWindow(obj[i]);
	return rv;
}

export var poppingOut = false;
// hook `createPopout` to give objects instead of destroying then on-destroy
var oldCreatePopout = lm.LayoutManager.prototype.createPopout;
lm.LayoutManager.prototype.createPopout = function(item) {
	poppingOut = true;
	item.emit('beforePopOut', item);
	var rv = oldCreatePopout.apply(this, arguments);
	poppingOut = false;
	if(item[0]) item = item[0];
	var rootPaths = {}, gl = this.vueObject;
	function ref(path) { rootPaths[path] = gl.getChild(path); }
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
	rv.getWindow().poppedoutVue = {
		layout: gl,
		path: rootPaths
	};
	rv.getWindow().addEventListener('beforeunload', ()=> {
		for(let p in rootPaths) rootPaths[p].delete();
	});
	return rv;
}

var bp = lm.controls.BrowserPopout.prototype;

export var poppingIn = false;
// hook `createPopout` to give objects instead of destroying then on-destroy
var oldPopIn = bp.popIn;
bp.popIn = function() {
	poppingIn = true;
	this.emit('beforePopIn');
	// GL bug-fix: poping-in empty window
	var rv = this.getGlInstance().root.contentItems.length ?
		oldPopIn.apply(this, arguments) :
		this.close();
	poppingIn = false;
	return rv;
}

export var unloading = false;
window.addEventListener('beforeunload', ()=> { unloading = true; });