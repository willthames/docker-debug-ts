import { LoggerFactoryOptions, LogGroupRule, LogLevel, LoggerFactory, LFService } from 'typescript-logging';

const options = new LoggerFactoryOptions();
options.addLogGroupRule(new LogGroupRule(new RegExp('.+'), LogLevel.Info));

export const factory: LoggerFactory = LFService.createLoggerFactory(options);
