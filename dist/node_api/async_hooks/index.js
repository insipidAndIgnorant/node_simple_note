"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var async_hooks_1 = __importDefault(require("async_hooks"));
var fs_1 = __importDefault(require("fs"));
var net_1 = __importDefault(require("net"));
var logPath = './files/async_hooks/log.txt';
var fd;
if (fs_1.default.existsSync(logPath)) {
    fs_1.default.unlinkSync(logPath);
    fd = fs_1.default.openSync(logPath, "w+");
}
var indent = 0;
// AsyncHook.executionAsyncId(): number 返回当前执行上下文
var eid = async_hooks_1.default.executionAsyncId();
// AsyncHook.triggerAsyncId(): number 负责调用当前正在执行的回调的资源ID。
var tid = async_hooks_1.default.triggerAsyncId();
// init(asyncId,type,triggerAsyncId,resource)
// asyncId <number> 异步资源的唯一ID
// type <string> 异步资源的类型
// triggerAsyncId <number> 在这个异步资源被创建的执行上下文中的异步资源唯一ID
// resource <Object> 代表异步操作的资源的引用，需要在销毁过程中释放
// 当一个类被创建的时候被调用，可能会发射一个异步事件。这并不意味着before/after必须在destroy之前被调用，只是存在这种可能
// 每一个新的资源在当前的Node.js实例中都被指派了一个唯一ID
var init = function (asyncId, type, triggerAsyncId, resource) {
    var eid = async_hooks_1.default.executionAsyncId();
    var indentStr = ' '.repeat(indent);
    fs_1.default.writeSync(fd, "" + indentStr + type + "(" + asyncId + "):" +
        (" trigger: " + triggerAsyncId + " execution: " + eid + "\n"));
};
// 当一个异步操作开始（比如，一个TCP服务器接收到一个新链接）或者结束（例如写数据到磁盘）的时候，
// 会调用一个回调通知用户。before回调是刚才说的开始时的回调。asyncId执行回调函数的资源的唯一标识。
// before回调将会被调用0到N次。before回调被调用0次的典型例子是，异步操作被取消，例如，没有一个TCP服务器接收链接。
// 像TCP服务器这样的持久异步资源会调用before回调多次，像fs.open()这样的操作只会调用一次。
var before = function (asyncId) {
    var indentStr = ' '.repeat(indent);
    fs_1.default.writeSync(fd, indentStr + "before: " + asyncId + "\n");
    indent += 2;
};
// before的回调结束后，立即调用。
// 如果一个未捕获的异常在执行回调时抛出，则after会在’uncaughtException’事件被发射，或者一个domain的句柄运行之后执行。
var after = function (asyncId) {
    indent -= 2;
    var indentStr = ' '.repeat(indent);
    fs_1.default.writeSync(fd, indentStr + "after:  " + asyncId + "\n");
};
// 当asyncId标识的资源被销毁时调用。它同样被嵌入器API emitDestroy()异步调用。
// 有些资源依赖垃圾收集进行清理，所以如果一个引用是把resource对象传递到init，则有可能destroy将永远不会被调用，会在应用中导致一个内存溢出。
// 如果资源不依赖垃圾回收，则这不是一个问题。
var destroy = function (asyncId) {
    var indentStr = ' '.repeat(indent);
    fs_1.default.writeSync(fd, indentStr + "destroy: " + asyncId + "\n");
    // fs.close(fd, () => {});
};
var promiseResolve = function (asyncId) {
    //
};
// AsyncHook.createHook(HookCallbacks:{init?; before?, after?, destroy? promiseResolve?}): <AsyncHook>用于禁用和启用hook的实例
// 注册每个异步操作的不同生存期事件要调用的函数。
// 异步操作(如console.log)将导致调用AsyncHooks回调,在AsyncHooks回调函数中使用异步操作将导致无限递归
var hooks = async_hooks_1.default.createHook({
    init: init,
    before: before,
    after: after,
    destroy: destroy,
    promiseResolve: promiseResolve // 只有Promise会引起调用,(promise状态为resloved时触发)
});
// 从要执行的全局回调池中禁用给定实例的回调。禁用挂钩之后，除非启用挂钩，否则不会再次调用它。
hooks.disable();
// 启用给定AsyncHook实例的回调。如果未提供回调，则启用空操作。
hooks.enable();
exports.TestAsyncHooks = function () { return net_1.default.createServer(function (socket) { }).listen(8080, function () {
    setTimeout(function () {
        console.log('>>>', async_hooks_1.default.executionAsyncId());
    }, 100);
}); };
//# sourceMappingURL=index.js.map