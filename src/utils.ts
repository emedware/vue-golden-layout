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

	if( document.createEvent ) {
		event = sub.document.createEvent('HTMLEvents');
		event.initEvent(eventName, true, true);
	} else {
		event = sub.document.createEventObject();
		event.eventType = eventName;
	}

	event.eventName = eventName;
	event.queryId = queryId;
	event.queryName = name;
	event.result = result;

	if(document.createEvent) {
		sub.dispatchEvent(event);
	} else {
		sub.fireEvent('on' + event.eventType, event);
	}
}

Object.assign((<any>GoldenLayout).__lm.utils.EventHub.prototype, {
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

if(isSubWindow) {
	window.addEventListener(responseEvent, function() {
		var queryId = (<any>event).queryId;
		queries[queryId].resolve((<any>event).result);
		delete queries[queryId];
	});
	window.addEventListener(errorEvent, function() {
		debugger;
	});
} else {
	window.addEventListener('gl_child_event', function() {
		if(queryEvent=== (<any>event).__glArgs[0]) {
			var [_, queryId, name, ...params] = (<any>event).__glArgs, rv,
				sub = (<any>event).__gl.container.ownerDocument.defaultView.window;
			try {
				rv = queryCallBacks[name](...params);
			} catch(e) {
				return sendResponse(queryId, name, sub, e, true);
			}
			if(rv instanceof Promise)
				rv
					.then(x=> sendResponse(queryId, name, sub, x))
					.catch(x=> sendResponse(queryId, name, sub, x, true));
			else
				sendResponse(queryId, name, sub, rv);
		}
	});
}