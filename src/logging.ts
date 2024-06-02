import pino, { Logger } from 'pino';

export const baseLogger = pino({
timestamp: pino.stdTimeFunctions.isoTime,
transport: {
    target: 'pino-pretty',
    options: {
        colorize: true,
        ignore: "pid,hostname,context"
    },
},
hooks: {
    // after args, tags can be added to the log message
    logMethod(args, method, level) {
        if(args.length >= 2) {
            
            const tags = [this.bindings().context, ...args[1]].filter(tag => tag !== undefined);
            const prefix = generateTagString(tags);
            const newMsg = ` ${prefix}:${args[0]}`;
            return method.apply(this, [newMsg]);
        }
        const context = this.bindings().context;
        if (context) {
            const prefix = generateTagString([context]);
            return method.apply(this, [`${prefix}${args[0]}`]);
        }
        return method.apply(this, args);
    },
}
});

function generateTagString(tags?: string[]) {
    if(tags === undefined || tags.length === 0) {
        return '';
    }
    return tags.map(tag => `[${tag}]`).join('');
}

// decorator to log method calls
export function logMethodCalls(tags: string[] = []) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        const className = target.constructor.name;
        const prefix = generateTagString([className, key, ...tags]);
        descriptor.value = function (...args: any[]) {
            baseLogger.info(`${prefix}Calling ${key}` +  (args.length ? `with ${args}`: ''));
            return original.apply(this, args);
        }
    }
}



class TestClass {
    @logMethodCalls()
    testMethod() {
        baseLogger.info('testMethod called');
    }

    @logMethodCalls(['tag1', 'tag2'])
    testMethod2(...args: any[]) {
        baseLogger.info('using vals ' + args.join(', '));
    }
}
// const newLogger = logger.child({context: 'test'});
// newLogger.info('teasdfst', ['tag1', 'tag2']);
// const test = new TestClass();
// test.testMethod();
// test.testMethod2('val3', 'val4');