var palette: string[] = [
	'#ffe0b7', '#fca570', '#fff089', '#f8f644',
	'#d5dc1d', '#c4f129', '#d0ffea', '#97edca',
	'#f1f2ff', '#c9d4fd', '#f6d896', '#fcf7be',
	'#ecebe7', '#e3cddf', '#dceaee', '#f8e398'
];
var allocations = new Array(palette.length).fill(false);

const fallBack = '#fff';

export function allocateColor(): string {
	var rv = allocations.findIndex(a=>!a);
	if(!~rv) return fallBack;
	allocations[rv] = true;
	return palette[rv];
}

export function freeColor(c: string): void {
	if(c===fallBack) return;
	var ndx = palette.indexOf(c);
	console.assert(~ndx, 'Specified color exists in palette');
	allocations[ndx] = false;
}