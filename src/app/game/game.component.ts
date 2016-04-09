/// <reference path="cmdpp-core/index.d.ts" />
import cmdPP = require("cmdpp-core");
import { Component, EventEmitter, OnDestroy } from 'angular2/core';
import { Terminal, TerminalService } from '../terminal';

interface DataSize {
	value: number;
	unit: string;
}

@Component({
	selector: 'game',
	directives: [ Terminal ],
	styles: [ require('./game.scss') ],
	template: require('./game.html')
})

export class Game implements OnDestroy {
	
	termService: TerminalService;
	termData: any = 0;

	cmd: cmdPP.CMD;

	version: string;

	// data: string;
	data: DataSize = { value: 0, unit: "KB" };
	money: number = 0;
	// storage: string;
	storage: DataSize = { value: 0, unit: "KB" };
	// power: boolean = false;

	constructor(termService: TerminalService) {
		this.termService = termService;
		this.termService.outputDelay = 10;
		this.termService.typeSoundURL = "assets/wav/type.wav";
		this.termService.startSoundURL = "assets/wav/start.wav";
		this.cmd = new cmdPP.CMD(
			(...txt) => {
				console.log('Game output:', txt);
				this.termService.output.next({
					output: true,
					text: [...txt],
					breakLine: true
				});
			},
			(saveObj) => {
				// for (let i in saveObj) {
				// 	localStorage.setItem(i, JSON.stringify(saveObj[i]));
				// }
				localStorage.setItem('cmdPP-data', JSON.stringify(saveObj));
			},
			() => {
				return JSON.parse(localStorage.getItem('cmdPP-data'));
			},
			(cmdObj) => {
				// this.data = cmdObj.formatBytes();
				let dataStrs: string[] = cmdObj.formatBytes().split(' ');
				this.data = { value: parseInt(dataStrs[0]), unit: dataStrs[1] };
				this.money = cmdObj.money;
				let storStrs: string[] = cmdObj.formatter(cmdObj.storage.capacity).split(' ');
				this.storage = { value: parseInt(storStrs[0]), unit: storStrs[1] };
			},
			function() {
				// TODO: Implement color schemes.
				return {};
			},
			(err) => console.error(err),
			true
		);
		let cmdList = [];
		for (let commandName in this.cmd._commands) {
			cmdList.push(commandName);
		}
		this.termService.commands = cmdList;

		this.version = 'v'+this.cmd.version;

		this.termService.subscribe({
			input: {
				onNext: (data: { command: string }) => {
					this.cmd.command(data.command);
				}
			},
			power: {
				onNext: (data: boolean) => {
					console.log('Power:', data);
					// if (data) {
					// 	if (!this.cmd) {
					// 		this.createCMD();
					// 	}
					// } else {
					// 	this.cmd.save();
					// 	this.cmd = null;
					// }
				}
			}
		});

		setTimeout(() => {
			this.termService.output.next({
				output: true,
				text: [
					'Welcome to CMD++',
					'This is a demo.',
					'Have fun!\n\n',
					'Please type "help" to open a list of commands.'
				]
			});
		});
	}

	createCMD() {
		this.cmd = new cmdPP.CMD(
			(...txt) => {
				console.log('Game output:', txt);
				this.termService.output.next({
					output: true,
					text: [...txt],
					breakLine: true
				});
			},
			(saveObj) => {
				localStorage.setItem('cmdPP-data', JSON.stringify(saveObj));
			},
			() => JSON.parse(localStorage.getItem('cmdPP-data')),
			(cmdObj) => {
				// this.data = cmdObj.formatBytes();
				let dataStrs: string[] = cmdObj.formatBytes().split(' ');
				this.data = { value: parseInt(dataStrs[0]), unit: dataStrs[1] };
				this.money = cmdObj.money;
				let storStrs: string[] = cmdObj.formatter(cmdObj.storage.capacity).split(' ');
				this.storage = { value: parseInt(storStrs[0]), unit: storStrs[1] };
			},
			function() {
				// TODO: Implement color schemes.
				return {};
			},
			(err) => console.error(err),
			true
		);
		let cmdList = [];
		for (let commandName in this.cmd._commands) {
			cmdList.push(commandName);
		}
		this.termService.commands = cmdList;

		this.version = 'v'+this.cmd.version;
	}

	ngOnDestroy() {
		console.log('Game is being destroyed.');
		this.termService.resultList.empty();
		console.log('Current Results:', this.termService.resultList.results);
	}

	// eHandle(event: string, ...args: any[]): void {
	// 	switch (event) {
	// 		case "power":
	// 			this.power = !this.power;
	// 	}
	// }
}