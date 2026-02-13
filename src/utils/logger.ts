import type { LogLevel } from '../types.js';

const LOG_LEVELS: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

export class Logger {
  private level: number;

  constructor(logLevel: LogLevel = 'info') {
    this.level = LOG_LEVELS[logLevel];
  }

  error(message: string, ...args: unknown[]): void {
    if (this.level >= LOG_LEVELS.error) {
      console.error(`[google-sheets-uploader] ERROR: ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level >= LOG_LEVELS.warn) {
      console.warn(`[google-sheets-uploader] WARN: ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level >= LOG_LEVELS.info) {
      console.log(`[google-sheets-uploader] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.level >= LOG_LEVELS.debug) {
      console.debug(`[google-sheets-uploader] DEBUG: ${message}`, ...args);
    }
  }
}
