import { EventEmitter } from 'angular2/core';

export interface ResultInterface {
	type: string;
	text: string[];
	displayed?: boolean;
	output?: boolean;
	breakLine?: boolean;
}

export class Result implements ResultInterface {
	type: string = '';
	text: string[] = [];
	displayed: boolean = false;
	output: boolean = false;
	breakLine: boolean = false;

	constructor(obj: Result|ResultInterface) {
		if (!('type' in obj || 'text' in obj)) throw new Error('Result must have at least a type and text.');
		this.type = obj.type;
		this.text = obj.text;
		if ('displayed' in obj) this.displayed = obj.displayed;
		if ('output' in obj) this.output = obj.output;
		if ('breakLine' in obj) this.breakLine = obj.breakLine;
	}

	toObject(): ResultInterface { return this; }
}

export class ResultList {
	private static _instance: ResultList = new ResultList();
	private _results: Result[] = [];
	changeEmitter: EventEmitter<Result[]> = new EventEmitter();

	constructor() {
		if (ResultList._instance) {
			throw new Error("ResultList is a singleton. Use ResultList.getInstance() instead.");
		}
		ResultList._instance = this;
	}

	public static getInstance(): ResultList { return ResultList._instance; }

	update() {
		this.changeEmitter.next(this._results);
	}
	
	get results(): Result[] { return this._results; }
	set results(v: Result[]) {
		this._results = v;
		this.update();
	}

	get length(): number { return this._results.length; }
	get isEmpty(): boolean { return this._results.length === 0; }
	toString(): string { return this._results.toString(); }
	get(i: number): Result { return this._results[i]; }

	push(...v: ResultInterface[]): number {
		let res: Result[] = [];
		for (let resI of v) {
			res.push(new Result(resI));
		}
		this._results.push(...res);
		this.update();
		return this.length;
	}

	splice(start: number, deleteCount?: number, ...items: Result[]): Result[] {
		let res: Result[] = this._results.splice(start, deleteCount, ...items);
		this.update();
		return res;
	}

	empty(): Result[] {
		return this.splice(0, this.length);
	}
}