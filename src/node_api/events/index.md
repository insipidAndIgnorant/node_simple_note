# event 事件触发器
大多数 Node.js 核心 API 构建于惯用的异步事件驱动架构，其中某些类型的对象（又称触发器，`Emitter`）会触发命名事件来调用函数（又称监听器，`Listener`）。

所有能触发事件的对象都是 `EventEmitter` 类的实例。 这些对象有一个 `eventEmitter.on()` 函数，用于将一个或多个函数绑定到命名事件上。 事件的命名通常是驼峰式的字符串，但也可以使用任何有效的 JavaScript 属性键。   

当 `EventEmitter` 对象触发一个事件时，所有绑定在该事件上的函数都会被同步地调用。 被调用的监听器返回的任何值都将会被忽略并丢弃。

## 监听器函数的this
* 使用 `function` 时, `this` 会被指向监听器所绑定的 `EventEmitter` 实例。
* 使用 ES6 的箭头函数作为监听器。`this` 指向定义时
  
## 异步 VS 同步
`EventEmitter` 以**注册的顺序同步**地调用所有监听器。 这样可以确保事件的正确排序，并有助于避免竞态条件和逻辑错误。 当适当时，监听器函数可以使用 `setImmediate()` 和 `process.nextTick()` 方法切换到异步的操作模式：
```js
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
  setImmediate(() => {
    console.log('异步地发生');
  });
});
myEmitter.emit('event', 'a', 'b');
```

## 错误事件
当 `EventEmitter` 实例出错时，应该触发 `'error'` 事件。 这些在 Node.js 中被视为特殊情况。

如果没有为 `'error'` 事件注册监听器，则当 `'error'` 事件触发时，会抛出错误、打印堆栈跟踪、并退出 Node.js 进程。
<br/><br/><br/>

## EventEmitter 类
`EventEmitter` 类由 `events` 模块定义和公开

当添加新的监听器时，所有 `EventEmitter` 都会触发 `'newListener'` 事件；当移除现有的监听器时，则触发 `'removeListener'` 事件。

它支持以下选项：
* `captureRejections` &nbsp;&nbsp; `<boolean>` 它可以自动捕获 `promise` 的`reject`。 默认值：`false`。

### **'newListener' 事件 (eventName, listener )**
* `eventName` &nbsp;&nbsp; `<string> | <symbol>` &nbsp;&nbsp; 事件的名称。
* `listener` &nbsp;&nbsp; `<Function>` &nbsp;&nbsp; 事件的句柄函数。

`EventEmitter` 实例在新的监听器被添加到其内部监听器数组之前，会触发自身的 `'newListener'` 事件

在添加监听器之前触发事件的事实具有微妙但重要的副作用：在 `'newListener'` 回调中注册到相同 `name` 的任何其他监听器将**插入到正在添加的监听器之前**。

### **'removeListener' 事件**
* `eventName` &nbsp;&nbsp; `<string> | <symbol>` &nbsp;&nbsp; 事件的名称。
* `listener` &nbsp;&nbsp; `<Function>` &nbsp;&nbsp; 事件的句柄函数。

`'removeListener'` 事件在 `listener` 被**移除后触发**。

### **EventEmitter.defaultMaxListeners: number**
默认情况下，每个事件可以注册最多 `10` 个监听器。 可以使用 `emitter.setMaxListeners(n)` 方法改变单个 `EventEmitter` 实例的限制。 可以使用 `EventEmitter.defaultMaxListeners` 属性改变所有 `EventEmitter` 实例的默认值。 如果此值不是一个正数，则抛出 `TypeError`。

设置 `EventEmitter.defaultMaxListeners` 要谨慎，因为会影响所有 `EventEmitter` 实例，**包括之前创建的**。 因而，优先使用 `emitter.setMaxListeners(n)` 而不是 `EventEmitter.defaultMaxListeners`。

**限制不是硬性的**。 `EventEmitter` 实例可以添加超过限制的监听器，但会向 `stderr` 输出跟踪警告，表明检测到可能的内存泄漏。 对于单个 `EventEmitter` 实例，可以使用 `emitter.getMaxListeners()` 和` emitter.setMaxListeners()` 暂时地消除警告：
```js
emitter.setMaxListeners(emitter.getMaxListeners() + 1);
emitter.once('event', () => {
  // 做些操作
  emitter.setMaxListeners(Math.max(emitter.getMaxListeners() - 1, 0));
});
```
触发的警告可以通过 `process.on('warning')` 进行检查，并具有附加的 `emitter`、 `type` 和 `count` 属性，分别指向事件触发器实例、事件名称、以及附加的监听器数量。 其 `name` 属性设置为 `'MaxListenersExceededWarning'`。

### **emitter.addListener(event: string | symbol, listener: (...args: any[]) => void): this**
`emitter.on(eventName, listener)` 的别名。

### **emitter.emit(event: string | symbol, ...args: any[]): boolean**
按照监听器注册的顺序，同步地调用每个注册到名为 `eventName` 的事件的监听器，并传入提供的参数。

如果事件有监听器，则返回 `true`，否则返回 `false`。

### **emitter.eventNames(): (string | symbol)[]**
返回已注册监听器的事件名数组。 数组中的值为字符串或 `Symbol`。

### **emitter.getMaxListeners(): number**
返回 `EventEmitter` 当前的监听器最大限制数的值，该值可以使用 `emitter.setMaxListeners(n)` 设置或默认为 `EventEmitter.defaultMaxListeners`。

### **emitter.listenerCount(eventName): number**
返回正在监听的名为 `eventName` 的事件的监听器的数量。

### **emitter.listeners(eventName): Function[]**
返回名为 eventName 的事件的监听器数组的**副本**。

### **emitter.off(eventName, listener): this**
`emitter.removeListener()` 的别名。

### **emitter.on(eventName, listener): tihs**
添加 `listener` 函数到名为 `eventName` 的事件的监听器数组的末尾。 不会检查 `listener` 是否已被添加。 多次调用并传入相同的 `eventName` 与 `listener` 会导致 `listener` 会被添加多次。

默认情况下，事件监听器会按照添加的顺序依次调用。 `emitter.prependListener()` 方法可用于将事件监听器添加到监听器数组的开头。
```js
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// 打印:
//   b
//   a
```

### **emitter.once(eventName, listener): this**
添加单次监听器 `listener` 到名为 `eventName` 的事件。 当 `eventName` 事件下次触发时，监听器会先被移除，然后再调用。

默认情况下，事件监听器会按照添加的顺序依次调用。 `emitter.prependOnceListener()` 方法可用于将事件监听器添加到监听器数组的开头。

### **emitter.prependListener(eventName, listener): this**
添加 `listener` 函数到名为 `eventName` 的事件的监听器数组的**开头**。 不会检查 `listener` 是否已被添加。 多次调用并传入相同的 `eventName` 和 `listener` 会导致 `listener` 被添加多次。

### **emitter.prependOnceListener(eventName, listener): this**
添加单次监听器 `listener` 到名为 `eventName` 的事件的监听器数组的开头。 当 `eventName` 事件下次触发时，监听器会先被移除，然后再调用。

### **emitter.removeAllListeners([eventName]): this**
移除全部监听器或指定的 `eventName` 事件的监听器。

删除代码中其他位置添加的监听器是不好的做法，尤其是当 `EventEmitter` 实例是由某些其他组件或模块（例如 `socket` 或 `stream`）创建时。

### **emitter.removeListener(eventName, listener): this**
从名为 `eventName` 的事件的监听器数组中移除指定的 `listener`。

`removeListener()` **最多只会从监听器数组中移除一个监听器**。 如果监听器被多次添加到指定 `eventName` 的监听器数组中，则必须多次调用 `removeListener()` 才能移除所有实例。

一旦事件被触发，所有绑定到该事件的监听器都会按顺序依次调用。 这意味着，在事件触发之后、且最后一个监听器执行完成之前， `removeListener()` 或 `removeAllListeners()` 不会从 `emit()` 中移除它们。

因为监听器是使用内部数组进行管理的，所以调用它将更改在删除监听器后注册的任何监听器的位置索引。 这不会影响调用监听器的顺序，但这意味着需要重新创建由 e`mitter.listeners()` 方法返回的监听器数组的任何副本。

如果单个函数作为处理程序多次添加为单个事件，则 `removeListener()` 将删除**最近添加的实例**。 

### **emitter.setMaxListeners(n: number): this**
默认情况下，如果为特定事件添加了超过 `10` 个监听器，则 `EventEmitter` 会打印一个警告。 这有助于发现内存泄露。 但是，并不是所有的事件都要限制 `10` 个监听器。 `emitter.setMaxListeners()` 方法可以为指定的 `EventEmitter` 实例修改限制。 值设为 `Infinity`（或 `0`）表示不限制监听器的数量。

### **emitter.rawListeners(eventName): this**
返回 `eventName` 事件的监听器数组的拷贝，包括封装的监听器（例如由 `.once()` 创建的）。


### **events.once(emitter, name): Promise<any[]>**
创建一个 `Promise`，当 `EventEmitter` 触发给定的事件时则会被`reslove`，当 `EventEmitter` 触发 `'error'` 时则会被`reject`。 解决 `Promise` 时将会带上触发到给定事件的所有参数的数组。

**该接口没有特殊的 `'error'` 事件语义且不监听 `'error'` 事件。**

### **events.on(emitter, eventName): Promise<any[]>**


Returns an AsyncIterator that iterates eventName events. It will throw if the EventEmitter emits 'error'. It removes all listeners when exiting the loop. The value returned by each iteration is an array composed of the emitted event arguments.

返回迭代 `eventName` 事件的异步迭代器。如果 `ventEmitter` 发出 `'error'`，它将抛出`Error`。在退出循环时**移除所有`listene`**。每次迭代返回的值是由发出的事件参数组成的数组。

