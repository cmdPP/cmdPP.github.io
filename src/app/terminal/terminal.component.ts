/// <reference path="../../../typings/browser/ambient/jquery/index.d.ts" />

import { Component, EventEmitter, ElementRef, OnDestroy } from 'angular2/core';
import { Http } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import { TerminalService, Prompt, ResultList, Result } from './terminal.service';
import { re as nonPrintable } from './nonprint';

declare var jQuery: JQueryStatic;

interface TypeEffect {
	(): void;
}
@Component({
	selector: 'terminal',
	styles: [ require('./terminal.scss') ],
	template: require('./terminal.html')
})

export class Terminal implements OnDestroy {
	http: Http;
  termService: TerminalService;

  termCursor: boolean = false;
  mouseOver: boolean = false;
  termFocused: boolean = false;

  commandLine: string = '';

  commandHistory: Array<any> = [];
  commandIndex: number = -1;
  el: any;
  outputDelay: number = 0;
  showPrompt: boolean = true;
  cursor: string = '_';
  oldResults: Result[] = [];
  resultBacklog: Result[] = [];

  currentPrompt: string = '';

  power: boolean = false;
  notFirstBoot: boolean = false;
  
  typeAudio: HTMLAudioElement;
  startAudio: HTMLAudioElement;

  typeAudioContainer: JQuery;
  startAudioContainer: JQuery;

  contentID: string;

	constructor(el: ElementRef, http: Http, termService: TerminalService) {
    console.log(el);
    this.el = el.nativeElement;
    console.log(this.el);
    console.log(this.el.attributes);
    this.termService = termService;
    this.outputDelay = this.termService.outputDelay;
    console.log(this.outputDelay);
    console.log(this.outputDelay ? 'adf' : 'blah');
    console.log('TerminalService:', termService);
    this.http = http;
    
    this.termService.subscribe({
    	prompt: {
    		onNext: (data: Prompt) => {
    			this.cursor = data.cursor;
    			this.currentPrompt = data.text;
    		}
    	},
    	results: {
    		onNext: (data: Result[]) => {
    			if (this.power) {
	    			this.updateResults(this.oldResults, data);
	    			this.oldResults = data;
	    		} else {
	    			this.resultBacklog.push(...data);
	    		}
    		}
    	}
    });
    this.cursor = this.termService.prompt.cursor;
    this.currentPrompt = this.termService.prompt.text;

    setInterval((() => this.termCursor = !this.termCursor), 500);
    
    if (this.termService.typeSoundURL) {
    	this.typeAudio = new Audio(this.termService.typeSoundURL);
    	this.typeAudioContainer = jQuery(this.typeAudio).appendTo('body');
    }
    if (this.termService.startSoundURL) {
    	this.startAudio = new Audio(this.termService.startSoundURL);
    	this.startAudioContainer = jQuery(this.startAudio).appendTo('body');
    }
	}

	eHandle(eName: string, ...args: any[]) {
		switch (eName) {
			case "mouse":
				if (args[0]) {
					this.mouseOver = args[0];
				}
				break;
			case "focus":
				if (args[0]) {
					if (args[1]) {
						args[1].focus();
						this.termFocused = true;
					} else {
						throw new Error('Focus event requires an element when args[0] is true.');
					}
				} else {
					if (!this.mouseOver) {
						this.termFocused = false;
					}
				}
				break;
			case "keypress":
				if (this.showPrompt) {
					this.keypress(args[0].which);
				}
				break;
			case "keydown":
				switch (args[0].keyCode) {
					case 8:
						this.backspace();
						break;
					case 9:
						// console.log('Tab pressed.');
						let val: string = jQuery('.terminal-target').val();
						// console.log('Target val:', val);
						let poss: string[] = this.getComplete(val);
						if (poss.length === 1) {
							jQuery('.terminal-target').val(poss[0]);
							this.setCommandLine(poss[0]);
						} else if (poss.length > 1) {
							let tabbedPos: string[] = [''];
							for (let possible of poss) {
								tabbedPos.push(`\t${possible}`);
							}
							this.termService.output.next({
								output: true,
								text: tabbedPos
							});
						}
						break;
					case 13:
						this.execute();
						break;
					case 38:
						this.previousCommand();
						break;
					case 40:
						this.nextCommand();
						break;
				}
				let codeList = [8, 9, 38, 40];
				if (codeList.indexOf(args[0].keyCode) !== -1) {
					args[0].preventDefault();
				}
				break;
			case "power":
				if (!this.power) {
					this.startAudio.play();
					let inputTarget = jQuery('input.terminal-target');
					console.log('Input target:', inputTarget);
					inputTarget.focus();
					if (this.resultBacklog.length !== 0) {
						this.updateResults(this.oldResults, this.resultBacklog);
						this.resultBacklog = [];
					}
				}
				this.power = !this.power;
				this.termService.powerEmitter.next(this.power);
				this.notFirstBoot = true;

				break;
			case "scroll":
				// console.log('Scroll event handler!');
				break;
		}
	}

	keypress(keyCode: number) {
		if (this.commandLine.length < 80) {
			let str = this.commandLine + String.fromCharCode(keyCode);
			this.setCommandLine(str);
		}
	}

	setCommandLine(str: string) {
		this.commandIndex = -1;
		this.commandLine = str;
	}

	clearNonPrint(v: string): string {
		return v.replace(nonPrintable, '');
	}

	backspace() {
		this.commandLine = this.commandLine.substr(0, this.commandLine.length - 1);
	}

	execute() {
		let command = this.clearNonPrint(this.commandLine);
		this.commandLine = '';
		jQuery('.terminal-target').val('');
		if (!command) return;
		if (this.commandHistory.length > 10) {
			this.commandHistory.splice(0, 1);
		}

		if (command !== this.commandHistory[this.commandHistory.length-1]) {
			this.commandHistory.push(command);
		}
		this.termService.resultList.push({ type: 'text', text: [this.termService.prompt.text + command] });
		this.termService.input.next({ command });
	}

	previousCommand() {
		if (this.commandIndex === -1) {
			this.commandIndex = this.commandHistory.length;
		}
		if (this.commandIndex === 0) return;

		this.commandLine = this.commandHistory[--this.commandIndex];
	}

	nextCommand() {
		if (this.commandIndex === -1) return;

		if (this.commandIndex < this.commandHistory.length - 1) {
			this.commandLine = this.commandHistory[++this.commandIndex];
		} else {
			this.commandLine = '';
		}
	}

	updateResults(oldValues: Result[], newValues: Result[]) {
		var results = jQuery('.terminal-results');
		var consoleView = jQuery('.terminal-viewport');
		if (oldValues.length && !newValues.length) {
			results.empty();
		}

		this.showPrompt = false;

		var f = [
			() => {
				this.showPrompt = true;
				consoleView.scrollTop(consoleView.prop('scrollHeight'));
			}
		];

		var type = (input: JQuery, line: string, i: number, endCallback: () => void) => {
			setTimeout(() => {
				this.typeAudio.play();
				let oldText = input.text();
				let inputText: string = oldText + (i < line.length ? line[i] : '');
				input.text(inputText);
				// input.attr('data-text', inputText);
				if (i < line.length - 1) {
					this.typeAudio.play();
					type(input, line, i + 1, endCallback);
				} else if (endCallback) {
					endCallback();
				}
			}, this.outputDelay);
		}

		for (let j = 0; j < newValues.length; j++) {
			var newValue = newValues[j];
			// console.log('New Value:', newValue);
			if (newValue.displayed) continue;
			newValue.displayed = true;

			if (this.outputDelay) {
				for (let i = newValue.text.length - 1; i >= 0; i--) {
					let line = jQuery('<pre />', {
						class: 'terminal-line',
					}).css({
						padding: '0px'
					});

					let textLine = newValue.text[i];
					if (this.outputDelay && newValue.output) {
						line.text('  ');
						let fi = f.length - 1;
						let wrapper = () => {
							var wline = line;
							var wtextLine = textLine;
							var wf = f[fi];
							var wbreak = i == newValue.text.length - 1 && newValue.breakLine;
							f.push(() => {
								results.append(wline);
								type(wline, wtextLine, 0, wf);
								consoleView.scrollTop(consoleView.prop('scrollHeight'));
								if (wbreak) {
									let breakLine = jQuery('<br />');
									results.append(breakLine);
								}
							});
						};
						wrapper();
					} else {
						line.text(textLine);
						results.append(line);
					}
				}
			} else {
				for (var i = 0; i < newValue.text.length; i++) {
					let lineStr: string = `${newValue.output ? '  ' : ''}${newValue.text[i]}`
					let line = jQuery('<pre />', { class: 'terminal-line' })
						.css({ padding: '0px' })
						.text(lineStr);
						// .attr('data-text', lineStr);
					results.append(line);
				}
				if (!!newValue.breakLine) {
					jQuery('<br />').appendTo(results);
				}
			}
		}
		f[f.length - 1]();
	}

	ngOnDestroy() {

	}

	getComplete(str: string): string[] {
		let strLen = str.length;
		let poss = [];
		if (!str || str === "" || this.termService.commands.length === 0) {
			return poss;
		}
		for (let possible of this.termService.commands) {
			if (possible.toLowerCase().slice(0, strLen) === str.toLowerCase()) {
				poss.push(possible);
			}
		}
		return poss;
	}
}