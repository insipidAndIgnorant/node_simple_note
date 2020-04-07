# Error
Node.js 应用程序一般会遇到以下四类错误：
* 标准的 JavaScript 错误
* 由底层操作系触发的系统错误，例如试图打开不存在的文件、或试图使用已关闭的 socket 发送数据
* 由应用程序代码触发的用户自定义的错误。
* `AssertionError` 错误，当 Node.js 检测到不应该发生的异常逻辑时触发。这类错误通常来自 `assert` 模块

# 错误的冒泡和捕获
除了少数例外，同步的 API（任何不接受 `callback` 函数的阻塞方法，例如 `fs.readFileSync`）会使用 `throw` 报告错误。

异步的 API 中发生的错误可能会以多种方式进行报告：
* 大多数的异步方法都接受一个 `callback` 函数，该函数会接受一个 `Error` 对象传入作为第一个参数。 如果第一个参数不是 `null` 而是一个 `Error` 实例，则说明发生了错误，应该进行处理。
* 当一个异步方法被一个 `EventEmitter` 对象调用时，错误会被分发到对象的 `'error'` 事件上。
* Node.js API 中有一小部分普通的异步方法仍可能使用 `throw` 机制抛出异常，且必须使用` try…catch` 处理。 具体参阅各个方法的文档。
  
`'error'` 事件机制的使用常见于基于流和基于事件触发器的 API，它们本身就代表了一系列的异步操作

对于所有的 `EventEmitter` 对象，如果没有提供一个 `'error'` 事件句柄，则错误会被抛出，并造成 Node.js 进程报告一个未处理的异常且随即崩溃，除非： 已经注册了一个 `'uncaughtException'` 事件的句柄。

```js
const EventEmitter = require('events');
const ee = new EventEmitter();

setImmediate(() => {
  // 这会使进程崩溃，因为还为添加 'error' 事件句柄。
  ee.emit('error', new Error('这会崩溃'));
});
```
这种方式产生的错误无法使用 `try…catch` 截获，因为它们是在调用的代码已经退出后抛出的。

# 回调中的 Error 参数
大多数 Node.js 核心 API 所提供的异步方法都遵从错误信息优先的回调模式惯例，这种模式有时也称为 Node.js 式回调。在这种模式中，一个回调函数首先被作为参数传给异步方法。当该方法完成操作或产生错误时，它会调用回调函数，并将可能存在的 `Error` 对象作为第一个参数传给回调函数。如果没有错误产生，那么第一个参数为 `null`

**JavaScript的 `try…catch` 机制不能用来截获异步方法产生的错误。** 当回调函数被调用时，程序早已退出其周围的代码（包括 `try…catch` 部分）。