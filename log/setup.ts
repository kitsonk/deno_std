// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.

import type { BaseHandler } from "./base_handler.ts";
import { DEFAULT_CONFIG, DEFAULT_LEVEL } from "./_config.ts";
import { type LogConfig, Logger } from "./logger.ts";
import { state } from "./_state.ts";

/** Setup logger config. */
export function setup(config: LogConfig) {
  state.config = {
    handlers: { ...DEFAULT_CONFIG.handlers, ...config.handlers },
    loggers: { ...DEFAULT_CONFIG.loggers, ...config.loggers },
  };

  // tear down existing handlers
  state.handlers.forEach((handler) => {
    handler.destroy();
  });
  state.handlers.clear();

  // setup handlers
  const handlers = state.config.handlers ?? {};

  for (const [handlerName, handler] of Object.entries(handlers)) {
    handler.setup();
    state.handlers.set(handlerName, handler);
  }

  // remove existing loggers
  state.loggers.clear();

  // setup loggers
  const loggers = state.config.loggers ?? {};
  for (const [loggerName, loggerConfig] of Object.entries(loggers)) {
    const handlerNames = loggerConfig.handlers ?? [];
    const handlers: BaseHandler[] = [];

    handlerNames.forEach((handlerName) => {
      const handler = state.handlers.get(handlerName);
      if (handler) {
        handlers.push(handler);
      }
    });

    const levelName = loggerConfig.level ?? DEFAULT_LEVEL;
    const logger = new Logger(loggerName, levelName, { handlers: handlers });
    state.loggers.set(loggerName, logger);
  }
}

setup(DEFAULT_CONFIG);
