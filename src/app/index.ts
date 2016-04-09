// App
export * from './app.component';
export * from './app.service';
export * from './terminal/terminal.service';

import {AppState} from './app.service';
import { TerminalService } from './terminal';

// Application wide providers
export const APP_PROVIDERS = [
  AppState,
  TerminalService,
];
