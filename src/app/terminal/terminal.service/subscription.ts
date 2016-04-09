import { Result } from './results';
import { Prompt } from './prompt';

export interface SubFunc<T> {
	(data: T): void;
}

export interface Sub<T> {
	onNext?: SubFunc<T>;
	onError?: SubFunc<T>;
	onComplete?: SubFunc<T>;
}

export interface Subscription {
	input?: any,
	output?: any,
	prompt?: any,
	results?: any,
	power?: any
}

export interface Subscriber {
	input?: Sub<{ command: string }>,
	output?: Sub<Result>,
	prompt?: Sub<Prompt>,
	results?: Sub<Result[]>,
	power?: Sub<boolean>
}