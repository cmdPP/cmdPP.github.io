
export interface SubFunc {
	(data: any): void;
}

export interface Sub {
	onNext?: SubFunc;
	onError?: SubFunc;
	onComplete?: SubFunc;
}

export interface Subscription {
	input?: any,
	output?: any,
	prompt?: any,
	results?: any
}

export interface Subscriber {
	input?: Sub,
	output?: Sub,
	prompt?: Sub,
	results?: Sub
}