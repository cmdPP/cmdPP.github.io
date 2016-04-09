import { Injectable, EventEmitter } from 'angular2/core';
import { Prompt } from './prompt';
import { ResultInterface, Result, ResultList } from './results';
import { SubFunc, Sub, Subscription, Subscriber } from './subscription';

@Injectable()
export class TerminalService {
	input: EventEmitter<any> = new EventEmitter();

  // private _outputBacklog: Result[] = [];
	output: EventEmitter<Result> = new EventEmitter();

  typeSoundURL: string = null;
  startSoundURL: string = null;

  outputDelay: number = 0;

	private _prompt: Prompt = Prompt.getInstance();
  private _resultList: ResultList = ResultList.getInstance();

  commands: string[] = [];

  constructor() {
    this.subscribe({
      output: {
        onNext: (data: Result) => {
          this.resultList.push(data);
        }
      }
    });
  }

  get prompt(): Prompt { return this._prompt; }
  get resultList(): ResultList { return this._resultList; }

  private makeSub<T>(target: EventEmitter<T>, sub: Sub): any {
  	let defSubFunc: SubFunc = (data) => {};
  	let onNext: SubFunc = 'onNext' in sub ? sub.onNext : defSubFunc;
  	let onError: SubFunc = 'onError' in sub ? sub.onError : defSubFunc;
  	let onComplete: SubFunc = 'onComplete' in sub ? sub.onComplete : defSubFunc;
  	// return { onNext, onError, onComplete };
  	return target.subscribe(onNext, onError, onComplete);
  }

	subscribe(subber: Subscriber): Subscription {
		let subs: Subscription = {};
		if ('input' in subber) subs.input = this.makeSub<any>(this.input, subber.input);
  	if ('output' in subber) subs.output = this.makeSub<any>(this.output, subber.output);
  	if ('prompt' in subber) subs.prompt = this.makeSub<Prompt>(this._prompt.changeEmitter, subber.prompt);
  	if ('results' in subber) subs.results = this.makeSub<Result[]>(this._resultList.changeEmitter, subber.results);
  	return subs;
	}
}