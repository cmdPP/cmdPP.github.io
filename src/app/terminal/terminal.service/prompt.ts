import { EventEmitter } from 'angular2/core';

interface PromptInterface {
	user?: string;
	path?: string;
	separator?: string;
	end?: string;
	cursor?: string;
}

export class Prompt {
	private static _instance: Prompt = new Prompt();
	changeEmitter: EventEmitter<Prompt> = new EventEmitter();

	user: string = 'anon';
	path: string = '\\';
	separator: string = '@';
	end: string = ':>';
	cursor: string = '_';

	constructor() {
		if (Prompt._instance) {
			throw new Error("Prompt is a singleton. Use Prompt.getInstance() instead.");
		}
		Prompt._instance = this;
	}

	public static getInstance(): Prompt { return Prompt._instance; }

	update() {
		this.changeEmitter.next(this);
	}

	get text(): string {
		return this.user + this.path + this.separator + this.end;
	}

	// get user(): string { return this._user; }
	// set user(v: string) {
	// 	this._user = v;
	// 	// this.update();
	// }

	// get path(): string { return this._path; }
	// set path(v: string) {
	// 	this._path = v;
	// 	// this.update();
	// }

	// get separator(): string { return this._separator; }
	// set separator(v: string) {
	// 	this._separator = v;
	// 	// this.update();
	// }

	// get end(): string { return this._end; }
	// set end(v: string) {
	// 	this._end = v;
	// 	// this.update();
	// }

	// get cursor(): string { return this._cursor; }
	// set cursor(v: string) {
	// 	this._end = v;
	// 	// this.update();
	// }

	set(v: PromptInterface) {
		Object.assign(this, v);
		this.update();
	}
}