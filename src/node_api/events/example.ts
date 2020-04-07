import { EventEmitter, once } from 'events';

/**
 * newListener
 */
const emitter = new EventEmitter();
// 只处理一次，避免无限循环。
emitter.once('newListener', (event, listener) => {
  if (event === 'event') {
    // 在前面插入一个新的监听器。
    emitter.on('event', () => {
      console.log('B');
    });
  }
});
emitter.on('event', () => {
  console.log('A');
});
emitter.emit('event');
// 打印:
//   B
//   A




/**
 * emitter.emit
 */
const myEmitter = new EventEmitter();

// 第一个监听器。
myEmitter.on('event', function firstListener() {
  console.log('第一个监听器');
});
// 第二个监听器。
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`第二个监听器中的事件有参数 ${arg1}、${arg2}`);
});
// 第三个监听器
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`第三个监听器中的事件有参数 ${parameters}`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// 第一个监听器
// 第二个监听器中的事件有参数 1、2
// 第三个监听器中的事件有参数 1, 2, 3, 4, 5



/**
 * emitter.eventNames
 */
const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// 打印: [ 'foo', 'bar', Symbol(symbol) ]





/**
 * removeListene
 */
const myEmitter1 = new EventEmitter();
const callbackA = () => {
  console.log('A');
  myEmitter1.removeListener('event', callbackB);
};

const callbackB = () => {
  console.log('B');
};

myEmitter1.on('event', callbackA);

myEmitter1.on('event', callbackB);

// callbackA 移除了监听器 callbackB，但它依然会被调用。
// 触发时内部的监听器数组为 [callbackA, callbackB]
myEmitter1.emit('event');
// 打印:
//   A
//   B

// callbackB 现已被移除。
// 内部的监听器数组为 [callbackA]
myEmitter1.emit('event');
// 打印:
//   A






/**
 * 
 */
const emitter1 = new EventEmitter();
emitter1.once('log', () => console.log('只记录一次'));

// 返回一个数组，包含了一个封装了 `listener` 方法的监听器。
const listeners = emitter1.rawListeners('log');
const logFnWrapper = listeners[0];

// 打印 “只记录一次”，但不会解绑 `once` 事件。
// @type/node会提示没有.listener是因为认为返回类型时Function[], 但实际上once封装了.listener
(<any>logFnWrapper).listener();

// 打印 “只记录一次”，且移除监听器。
logFnWrapper();

emitter1.on('log', () => console.log('持续地记录'));
// 返回一个数组，只包含 `.on()` 绑定的监听器。
const newListeners = emitter1.rawListeners('log');

// 打印两次 “持续地记录”。
newListeners[0]();
emitter1.emit('log');




/**
 * once
 */
async function run() {
    const ee = new EventEmitter();

    process.nextTick(() => {
        ee.emit('myevent', 42);
    });

    const [value] = await once(ee, 'myevent');
    console.log(value);

    const err = new Error('错误信息');
    process.nextTick(() => {
        ee.emit('error', err);
    });

    try {
        await once(ee, 'myevent');
    } catch (err) {
        console.log('出错', err);
    }
}

run();
// 42
// 出错
// Error: 错误信息