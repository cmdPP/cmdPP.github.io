declare module "cmdpp-core" {

	interface Storage {
		new(name: string, idx: number, prev?: string);

		name: string;
		idx: number;
		capacity: number;
		price: number;
		prev?: string;
	}

	interface StorageCollection {
		[name: string]: Storage;
	}

	interface StorageContainer {
		new(storages: string[]);

		name: string;
		capacity: number;
		price: number;
		idx: number;
		current: Storage;
		upgrade: Storage;
		
		otherNames: string[];
		others: StorageCollection;

		allNames: string[];
		all: StorageCollection;

		checkStorage(data: number, increment: number): boolean;
	}

	interface CMDSaveObject {
		data: number;
		money: number;
		increment: number;
		autoIncrement: number;
		storage: string;
		unlocked: string[];
	}

	interface CommandFunc { (...args: any[]): void; }
	interface EmptyFunc { (): void; }

	interface Command {
		func: CommandFunc;
		desc: string|EmptyFunc;
		usage?: string|EmptyFunc;
		price?: number;
	}

	interface CommandProvider { [name: string]: Command; }

	interface RespondCB { (...txt: any[]): void; }
	interface SaveCB { (cmdData: CMDSaveObject): void|Error; }
	interface LoadCB { (): CMDSaveObject; }
	interface UpdateCB { (cmdObj: CMD): void; }
	interface CommandProviderCB { (): CommandProvider; }
	interface ErrorHandlerCB { (err: Error): void; }

	export class CMD {
		constructor(
			respond: RespondCB,
			save: SaveCB,
			load: LoadCB,
			update: UpdateCB,
			commandProvider?: CommandProviderCB,
			errorHandler?: ErrorHandlerCB,
			debug?: boolean
		);

		version: string;
		money: number;
		increment: number;
		autoIncrement: number;
		isAutoMining: boolean;
		data: number;
		counter: number;
		debug: boolean;

		storage: StorageContainer;

		_commands: CommandProvider;

		gameLoop(): void;
		respond(...txt: string[]): void;
		checkStorage(increment?: number): boolean;
		command(str: string): void;
		runCommand(cmd: string): void;
		update(): void;
		save(): void;
		load(): void;
		addData(amt: number): boolean;
		removeData(amt: number): boolean;
		addMoney(amt: number): void;
		removeMoney(amt: number): boolean;
		formatBytes(): string;
		formatter(size: number): string;
		reset(): void;
	}

}