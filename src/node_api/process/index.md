# process
`process` 对象是一个全局变量，它提供有关当前 Node.js 进程的信息并对其进行控制。 作为一个全局变量，它始终可供 Node.js 应用程序使用，无需使用 `require()`。 它也可以使用 `require()` 显式地访问

### 进程事件
`process` 对象是 `EventEmitter` 的实例

#### **'beforeExit' 事件 (code: number) => void**
当 Node.js 清空其事件循环并且没有其他工作要安排时，会触发 'beforeExit' 事件。 通常，Node.js 进程将在没有调度工作时退出，但是在 'beforeExit' 事件上注册的监听器可以进行异步调用，从而导致 Node.js 进程继续。

调用监听器回调函数时会将 `process.exitCode` 的值作为唯一参数传入。

对于导致显式终止的条件，不会触发 `'beforeExit'` 事件，例如调用 `process.exit()` 或未捕获的异常。

除非打算安排额外的工作，否则不应将 `'beforeExit'` 用作 `'exit'` 事件的替代方案。
```js
process.on('beforeExit', (code) => {
  console.log('进程 beforeExit 事件的代码: ', code);
});

process.on('exit', (code) => {
  console.log('进程 exit 事件的代码: ', code);
});

console.log('此消息最新显示');

// 打印:
// 此消息最新显示
// 进程 beforeExit 事件的代码: 0
// 进程 exit 事件的代码: 0
```

#### **'disconnect' 事件 () => void**
如果使用 IPC 通道衍生 Node.js 进程（参见子进程和集群文档），则在 IPC 通道关闭时将触发 `'disconnect'` 事件。

#### **'exit' 事件 (code: number) => void**
当 Node.js 进程因以下原因之一即将退出时，则会触发 `'exit'` 事件：
* 显式调用 `process.exit()` 方法；
* Node.js 事件循环不再需要执行任何其他工作。
  
此时无法阻止退出事件循环，并且一旦所有 `'exit'` 事件的监听器都已完成运行时，Node.js 进程将终止。

使用 `process.exitCode` 属性指定的退出码或传给 `process.exit()` 方法的 `exitCode` 参数调用监听器回调函数。

监听器函数必须只执行同步操作。 在调用 `'exit'` 事件监听器之后，Node.js 进程将立即退出，从而导致在事件循环中仍排队的任何其他工作被放弃。 例如，在以下示例中，定时器中的操作不会发生：
```js
process.on('exit', (code) => {
  setTimeout(() => {
    console.log('此处不会运行');
  }, 0);
});
```

#### **'message' 事件 (message: any, sendHandle: any) => void**
* message 已解析的 JSON 对象或可序列化的原始值。
* sendHandle 一个 `net.Server` 或 `net.Socket` 对象，或未定义

如果使用 IPC 通道衍生 Node.js 进程（参见child_process和cluster文档），则只要子进程收到父进程使用 `childprocess.send()` 发送的消息，就会触发 `'message'` 事件。

消息会进行序列化和解析。 生成的消息可能与最初发送的消息不同。

如果在衍生进程时使用了 `serialization` 选项设置为 `'advanced'`，则 `message` 参数可以包含 `JSON` 无法表示的数据。 有关更多详细信息，请参见 child_process 的高级序列化。

#### **'multipleResolves' 事件 (type: MultipleResolveType, promise: Promise<any>, value: any) => void**
* type &nbsp;&nbsp;  错误类型。`'resolve'` 或 `'reject'` 之一。
* promise &nbsp;&nbsp;  不止一次`'resolve'`或`'reject'`的 `Promise`。
* value &nbsp;&nbsp;  在原始解析后`'resolve'`或`'reject'`的 `Promise` 的值。

只要 `Promise` 有以下情况，就会触发 `'multipleResolves'` 事件：
* resolve不止一次。
* reject不止一次。
* resolve后reject。
* reject后resolve。

这对于在使用 `Promise` 构造函数时跟踪应用程序中的潜在错误非常有用，因为会以静默方式吞没多个解决。 但是，此事件的发生并不一定表示错误。 例如，`Promise.race()` 可以触发 `'multipleResolves'` 事件。
```js
process.on('multipleResolves', (type, promise, reason) => {
  console.error(type, promise, reason);
  setImmediate(() => process.exit(1));
});

async function main() {
  try {
    return await new Promise((resolve, reject) => {
      resolve('第一次调用');
      resolve('吞没解决');
      reject(new Error('吞没拒绝'));
    });
  } catch {
    throw new Error('失败');
  }
}

main().then(console.log);
// resolve: Promise { '第一次调用' } '吞没解决'
// reject: Promise { '第一次调用' } Error: 吞没拒绝
//     at Promise (*)
//     at new Promise (<anonymous>)
//     at main (*)
// 第一次调用
```

#### **'rejectionHandled' 事件 (promise: Promise<any>) => void**
* promise &nbsp;&nbsp; 最近处理的 `Promise`

每当 `Promise` 被拒绝并且错误处理函数附加到它（例如，使用 `promise.catch()`）晚于一个 Node.js 事件循环时，就会触发 `'rejectionHandled'` 事件。

`Promise` 对象之前已经在 `'unhandledRejection'` 事件中触发，但在处理过程中获得了拒绝处理函数。

`Promise` 链中没有顶层的概念，总是可以处理拒绝。 本质上自身是异步的，可以在未来的某个时间点处理 `Promise` 拒绝，可能比触发 `'unhandledRejection'` 事件所需的事件循环更晚。

另一种表述的方式就是，与同步代码中不断增长的未处理异常列表不同，使用 `Promise` 可能会有一个不断增长和缩小的未处理拒绝列表。

在同步代码中，当未处理的异常列表增长时，会触发 `'uncaughtException'` 事件。

在异步代码中，当未处理的拒绝列表增长时会触发 `'unhandledRejection'` 事件，并且当未处理的拒绝列表缩小时会触发 `'rejectionHandled'` 事件。
```js
const unhandledRejections = new Map();
process.on('unhandledRejection', (reason, promise) => {
  unhandledRejections.set(promise, reason);
});
process.on('rejectionHandled', (promise) => {
  unhandledRejections.delete(promise);
});
```
在这个例子中， `unhandledRejections` 的 Map 将随着时间的推移而增长和缩小，反映出拒绝开始未处理然后被处理。 可以定期地（这对可能长时间运行的应用程序最好）或进程退出时（这对脚本来说可能是最方便的）在错误日志中记录此类错误。

#### **'uncaughtException' 事件 (error: Error, origin: string) => void**
* err &nbsp;&nbsp; 未捕获的异常。
* origin &nbsp;&nbsp; 表明异常是来自未处理的拒绝还是来自同步的错误。 可以是 `'uncaughtException'` 或 `'unhandledRejection'`。

当未捕获的 JavaScript 异常一直冒泡回到事件循环时，会触发 `'uncaughtException'` 事件。 默认情况下，Node.js 通过将堆栈跟踪打印到 stderr 并使用退出码 1 来处理此类异常，从而覆盖任何先前设置的 `process.exitCode`。 为 `'uncaughtException'` 事件添加处理程序会覆盖此默认行为。 或者，更改 `'uncaughtException'` 处理程序中的 `process.exitCode`，这将导致进程退出并提供退出码。 否则，在存在这样的处理程序的情况下，进程将以 0 退出。
```js
process.on('uncaughtException', (err, origin) => {
  fs.writeSync(
    process.stderr.fd,
    `捕获的异常: ${err}\n` +
    `异常的来源: ${origin}`
  );
});

setTimeout(() => {
  console.log('这里仍然会运行');
}, 500);

// 故意引起异常，但不要捕获它。
nonexistentFunc();
console.log('这里不会运行');
```
通过安装 `'uncaughtExceptionMonitor'` 监听器，可以监视 `'uncaughtException'` 事件，而不会覆盖默认行为以退出该进程。

#### 正确地使用 'uncaughtException'
如果打算使用 `'uncaughtException'` 事件作为异常处理的最后补救机制，这是非常粗糙的设计方式。 此事件不应该当作 `On Error Resume Next`（出了错误就恢复让它继续）的等价机制。 未处理异常本身就意味着应用已经处于了未定义的状态。如果基于这种状态，尝试恢复应用正常进行，可能会造成未知或不可预测的问题。

此事件的监听器回调函数中抛出的异常，不会被捕获。为了避免出现无限循环的情况，进程会以非零的状态码结束，并打印堆栈信息。

如果在出现未捕获异常时，尝试去恢复应用，可能出现的结果与电脑升级时拔掉电源线出现的结果类似。 10次中有9次不会出现问题。 但是第10次可能系统会出现错误。

正确使用 `'uncaughtException'` 事件的方式，是用它在进程结束前执行一些已分配资源（比如文件描述符，句柄等等）的同步清理操作。 触发 `'uncaughtException'` 事件后，用它来尝试恢复应用正常运行的操作是不安全的。

想让一个已经崩溃的应用正常运行，更可靠的方式应该是启动另外一个进程来监测/探测应用是否出错， 无论 `uncaughtException` 事件是否被触发，如果监测到应用出错，则恢复或重启应用。

#### **'uncaughtExceptionMonitor' 事件 (error: Error, origin: string) => void**
add in v13.7.0
* err &nbsp;&nbsp; 未捕获的异常。
* origin &nbsp;&nbsp; 表明异常是来自未处理的拒绝还是来自同步的错误。 可以是 `'uncaughtException'` 或 `'unhandledRejection'`。
  
在发出`'uncaughtExceptionMonitor'`事件或通过`process.setUncaughtExceptionCaptureCallback()`安装挂钩之前，将发出`'uncaughtExceptionMonitor'`事件。

#### **'unhandledRejection' 事件 (reason: {} | null | undefined, promise: Promise<any>) => void**
* reason &nbsp;&nbsp; 此对象包含了 `promise` 被拒绝的相关信息（通常是一个 Error 对象）。
* promise &nbsp;&nbsp; 被拒绝的 `promise` 对象。

如果在事件循环的一次轮询中，一个 `Promise` 被拒绝，并且此 `Promise` 没有绑定错误处理器， `'unhandledRejection'` 事件会被触发。 当使用 `Promise` 进行编程时，异常会以被拒绝的 `promise` 的形式封装。 拒绝可以被 `promise.catch()` 捕获并处理，并且在 `Promise` 链中传播。`'unhandledRejection'` 事件在探测和跟踪 `promise` 被拒绝，并且拒绝未被处理的场景中是很有用的。
```js
process.on('unhandledRejection', (reason, promise) => {
  console.log('未处理的拒绝：', promise, '原因：', reason);
  // 记录日志、抛出错误、或其他逻辑。
});

somePromise.then((res) => {
  return reportToUser(JSON.pasre(res)); // 故意输错 (`pasre`)。
}); // 没有 `.catch()` 或 `.then()`。


// 如下代码也会触发'unhandledRejection'事件：
function SomeResource() {
  // 将 loaded 的状态设置为一个拒绝的 promise。
  this.loaded = Promise.reject(new Error('错误信息'));
}
const resource = new SomeResource();
// resource.loaded 上没有 .catch 或 .then。
```

#### **'warning' 事件 (warning: Error) => void**
* warning
  * name &nbsp;&nbsp; 警告的名称。默认值: `'Warning'`
  * message &nbsp;&nbsp; 系统提供的对此警告的描述。
  * stack &nbsp;&nbsp; 当警告触发时，包含代码位置的堆栈信息。

任何时候 Node.js 触发进程警告，都会触发 `'warning'` 事件。

进程警告与进程错误的相似之处，在于两者都描述了需要引起用户注意的异常条件。 区别在于，警告不是 Node.js 和 Javascript 错误处理流程的正式组成部分。 一旦探测到可能导致应用性能问题，缺陷或安全隐患相关的代码实践，Node.js 就可发出警告。

默认Node.js会打印进程警告到stderr。使用`--no-warnings`的命令行选项可以阻止默认从console输出信息， 但是`'warning'`事件仍然会被`process`对象发出。

`--trace-warnings`命令行选项可以让默认的控制台输出警告信息时，包含警告的全部堆栈信息。  
使用`--throw-deprecation`命令行选项标志启动Node.js，会使得自定义的弃用警告作为异常信息抛出来。  
使用`--trace-deprecation`命令行选项标志，会使得自定义的弃用警告打印到stderr，包括其堆栈信息。  
使用`--no-deprecation`命令行选项标志，会阻止报告所有的自定义的弃用警告。  
`*-deprecation` 命令行选项标志，只会影响使用名字为 `'DeprecationWarning'` 的警告。

#### 触发自定义的告警
查看`process.emitWarning()`的描述，其中包含关于触发定制警告或特定应用警告的信息。

### 信号事件
当 Node.js 进程接收到一个信号时，会触发信号事件。 signal(7) 列出了标准POSIX的信号名称列表，例如 `'SIGINT'`、 `'SIGHUP'` 等等。（[OS信号常量]()）

信号在 `Worker` 线程上不可用。

信号处理程序将会接收信号的名称（`'SIGINT'`， `'SIGTERM'` 等）作为第一个参数。

每个事件名称，以信号名称的大写表示 (比如事件 `'SIGINT'` 对应信号 `SIGINT`)。

* `'SIGUSR1'` 被 Node.js 保留用于启动调试器。可以为此事件绑定一个监听器，但是即使这样做也不会阻止调试器的启动。
* `'SIGTERM'` 和 `'SIGINT'` 在非 Windows 平台绑定了默认的监听器，这样进程以代码 128 + signal number 结束之前，可以重置终端模式。  如果这两个事件任意一个绑定了新的监听器，原有默认的行为会被移除（Node.js 不会结束）。
* `'SIGPIPE'` 默认会被忽略。可以给其绑定监听器。
* `'SIGHUP'` 在 Windows 平台中当控制台窗口被关闭时会触发它，在其他平台中多种相似的条件下也会触发，查看 signal(7)。 可以给其绑定监听器，但是 Windows 下 Node.js 会在它触发后 10 秒钟无条件关闭。 在非 Windows 平台， SIGHUP 默认的绑定行为是结束 Node.js，但是一旦给它绑定了新的监听器，默认行为会被移除。
* `'SIGTERM'` 在 Windows 中不支持，可以给其绑定监听器。
* `'SIGINT'` 在终端运行时，可以被所有平台支持，通常可以通过 Ctrl+C 触发（虽然这是可以配置的）。 当终端运行在原始模式，它不会被触发。
* `'SIGBREAK`' 在 Windows 中按下 Ctrl+Break 会被触发，非 Windows 平台中可以为其绑定监听器，但是没有方式触发或发送此事件。
* `'SIGWINCH'` 当控制台被调整大小时会触发。Windows 中只有当光标移动并写入到控制台、或者以原始模式使用一个可读 tty 时，才会触发
* `'SIGKILL'` 不能绑定监听器，所有平台中出现此事件，都会使得 Node.js 无条件终止。
* `'SIGSTOP'` 不能绑定监听器。
* `'SIGBUS'`、 '`SIGFPE'`、 `'SIGSEGV'` 和 `'SIGILL'`, 如果不是通过 kill(2) 产生，默认会使进程停留在某个状态，在此状态下尝试调用 JS 监听器是不安全的。 如果尝试调用 JS 监听器可能会导致进程在无限循环中挂死，因为使用 `process.on()` 附加的监听器是以异步的方式被调用，因此不能纠正隐含的问题。
* 可以发送 0 来测试某个进程是否存在，如果该进程存在则没有影响，但是如果该进程不存在则会抛出错误。

Windows 不支持信号，因此没有等效物来通过信号终止，但是 Node.js 提供了一些 `process.kill()` 和 `subprocess.kill()` 的模拟：
* 发送 `SIGINT`、 `SIGTERM` 和 `SIGKILL` 会导致目标进程被无条件地终止，然后子进程会报告该进程已被信号终止。
* 发送信号 0 可以用作与平台无关的方式来测试进程的存在性。

### **process.abort()**
`process.abort()` 方法会使 Node.js 进程立即结束，并生成一个核心文件。

`Worker` 线程中没有此特性。

### **process.allowedNodeEnvironmentFlags: ReadonlySet<string>**
`process.allowedNodeEnvironmentFlags` 属性是 NODE_OPTIONS 环境变量中允许的特殊只读标志的 `Set`。

`process.allowedNodeEnvironmentFlags` 扩展了 `Set`，但重写了 `Set.prototype.has` 以识别几种不同的可能标志的表示。 在以下情况下， `process.allowedNodeEnvironmentFlags.has()` 将会返回 `true`：
* 标志可以省略前导单（-）或双（--）破折号。例如， `inspect-brk` 用于 `--inspect-brk`，或 `r` 用于 `-r`。
* 传给 V8 的标志（如 `--v8-options` 中所列）可以替换下划线的一个或多个非前导短划线，反之亦然。例如， `--perf_basic_prof`、 `--perf-basic-prof`、 `--perf_basic-prof` 等。
* 标志可以包含一个或多个等号（=）字符。包含第一个等号后的所有字符都将被忽略。例如， `--stack-trace-limit=100`。
* 在 NODE_OPTIONS 中必须允许标志。

当迭代 `process.allowedNodeEnvironmentFlags` 时，标志只出现一次。 每个都将会以一个或多个破折号开头。 传给 V8 的标志将包含下划线而不是非前导破折号：
```js
process.allowedNodeEnvironmentFlags.forEach((flag) => {
  // -r
  // --inspect-brk
  // --abort_on_uncaught_exception
  // ...
});
```
`process.allowedNodeEnvironmentFlags` 的 `add()`、 `clear()` 和 `delete()` 方法不执行任何操作，并且将会以静默方式失败。

如果在没有 `NODE_OPTIONS` 支持的情况下编译 Node.js（在 `process.config` 中显示），则 `process.allowedNodeEnvironmentFlags` 将会包含允许的内容。

### **process.arch: string**
为其编译 Node.js 二进制文件的操作系统的 CPU 架构。 可能的值有：`'arm'`、 `'arm64'`、 `'ia32'`、 `'mips'`、 `'mipsel'`、 `'ppc'`、 `'ppc64'`、 `'s390'`、 `'s390x'`、 `'x32'` 和 `'x64'`。

### **process.argv: string[]**
`process.argv` 属性返回一个数组，其中包含当启动 Node.js 进程时传入的命令行参数。 第一个元素是` process.execPath`。 如果需要访问 `argv[0]` 的原始值，参见 `process.argv0`。 第二个元素将是正在执行的 JavaScript 文件的路径。 其余元素将是任何其他命令行参数。
```js
// $ node process-args.js one two=three four

// 0: /usr/local/bin/node
// 1: /Users/mjr/work/node/process-args.js
// 2: one
// 3: two=three
// 4: four
```

### **process.argv0: string**
`process.argv0` 属性保存当 Node.js 启动时传入的 `argv[0]` 的原始值的只读副本。
```
$ bash -c 'exec -a customArgv0 ./node'
> process.argv[0]
'/Volumes/code/external/node/out/Release/node'
> process.argv0
'customArgv0'
```

### **process.channel**
如果 Node.js 进程是由 IPC 通道（参见子进程文档）方式创建的， `process.channel` 属性保存 IPC 通道的引用。 如果 IPC 通道不存在，则此属性值为 undefined。

### **process.channel.ref()**
如果以前调用过`.unref()`，此方法使IPC通道保持进程的事件循环。

通常，这是通过流程对象上的`'disconnect'`”和`'message'`侦听器来管理的。但是，此方法可用于显式请求特定行为。

This method makes the IPC channel keep the event loop of the process running if .unref() has been called before.

Typically, this is managed through the number of 'disconnect' and 'message' listeners on the process object. However, this method can be used to explicitly request a specific behavior.

### **process.channel.unref()**
这种方法使得IPC通道不能保持进程的事件循环运行，即使在通道打开的情况下也能让它完成。

通常，这是通过流程对象上的`'disconnect'`”和`'message'`侦听器来管理的。但是，此方法可用于显式请求特定行为。

This method makes the IPC channel not keep the event loop of the process running, and lets it finish even while the channel is open.

Typically, this is managed through the number of 'disconnect' and 'message' listeners on the process object. However, this method can be used to explicitly request a specific behavior.

### **process.chdir(directory: string)**
`process.chdir()` 方法变更 Node.js 进程的当前工作目录，如果变更目录失败会抛出异常（例如，如果指定的 `directory` 不存在）。

此特性在 `Worker` 线程中不可用。
```js
console.log(`Starting directory: ${process.cwd()}`);
try {
  process.chdir('/tmp');
  console.log(`New directory: ${process.cwd()}`);
} catch (err) {
  console.error(`chdir: ${err}`);
}
```

### **process.config**
```ts
config: {
            target_defaults: {
                cflags: any[];
                default_configuration: string;
                defines: string[];
                include_dirs: string[];
                libraries: string[];
            };
            variables: {
                clang: number;
                host_arch: string;
                node_install_npm: boolean;
                node_install_waf: boolean;
                node_prefix: string;
                node_shared_openssl: boolean;
                node_shared_v8: boolean;
                node_shared_zlib: boolean;
                node_use_dtrace: boolean;
                node_use_etw: boolean;
                node_use_openssl: boolean;
                target_arch: string;
                v8_no_strict_aliasing: number;
                v8_use_snapshot: boolean;
                visibility: string;
            };
};
```

`process.config` 属性返回一个 Object，其中包含用于编译当前 Node.js 可执行文件的配置选项的 JavaScript 表示形式。 这与运行 ./configure 脚本时生成的 config.gypi 文件相同

`process.config` 属性值不是只读的，在 Node.js 生态系统中已经有模块扩展、修改或完全替换了 `process.config` 的值。

### **process.connected: boolean**
如果 Node.js 进程是由 IPC 通道的方式创建，则只要 IPC 通道保持连接， `process.connected` 属性就会返回 true。 `process.disconnect()` 被调用后，此属性会返回 false。

一旦 `process.connected` 为 false，则不能通过 IPC 通道使用 `process.send()` 发送信息。

### **process.cpuUsage(previousValue?: CpuUsage): CpuUsage**
* `previousValue`  上一次调用 `process.cpuUsage()` 的返回值。
  * user: number
  * system: number

`process.cpuUsage()` 方法返回包含当前进程的用户 CPU 时间和系统 CPU 时间的对象。 此对象包含 `user` 和 `system` 属性，属性值的单位都是微秒（百万分之一秒）。 用户和系统的属性值分别计算了执行用户程序和系统程序的时间，如果此进程在执行任务时是基于多核 CPU，值可能比实际花费的时间要大。

上一次调用 `process.cpuUsage()` 方法的结果，可以作为参数值传递给此方法，得到的结果是与上一次的差值。
```js
const startUsage = process.cpuUsage();
// { user: 38579, system: 6986 }

// 将 CPU 旋转 500 毫秒。
const now = Date.now();
while (Date.now() - now < 500);

console.log(process.cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```

### **process.cwd(): string**
`process.cwd()` 方法返回 Node.js 进程的当前工作目录。

### **process.debugPort: number**
Node.js 调试器使用的端口。

### **process.disconnect()**
如果 Node.js 进程是从 IPC 通道衍生出来的，则 `process.disconnect()` 函数会关闭到父进程的 IPC 通道，以允许子进程一旦没有其他链接来保持活跃就优雅地关闭。

调用 `process.disconnect()` 的效果和父进程调用 `ChildProcess.disconnect()` 的一样。

如果 Node.js 进程不是从 IPC 通道衍生出来的，则调用 `process.disconnect()` 将会返回 `undefined`。

### **process.dlopen(module: Object, filename: string, flags?: os.constants.dlopen)**
`process.dlopen()` 方法允许动态加载共享对象。 它主要由 `require()` 用于加载 C++ 插件，除特殊情况外，不应直接使用。 换句话说，除非有特殊原因，否则 `require()` 应优先于 `process.dlopen()`。

flags 参数是一个允许指定 dlopen 行为的整数。 有关详细信息，请参见 `os.constants.dlopen` 文档。

如果有特定原因要使用 `process.dlopen()`（例如，指定 dlopen 标志），使用 `require.resolve()` 来查找模块的路径通常很有用。

调用 `process.dlopen()` 时的一个重要缺点是必须传入 `module` 实例。 可以通过 `module.exports` 访问 C++ 插件导出的函数。
```js
// 下面的示例显示了如何加载导出 `foo` 函数的名为 `binding` 的 C++ 插件。 通过传入 RTLD_NOW 常量，将在调用返回之前加载所有符号。 在此示例中，假定常量可用。

const os = require('os');
process.dlopen(module, require.resolve('binding'),
               os.constants.dlopen.RTLD_NOW);
module.exports.foo();
```
### **process.emitWarning(warning: string | Error, options?: Object)**
* warning &nbsp;&nbsp; 触发的警告
* options
  * type &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 当 `warning` 是一个 `String` 时，则 `type` 是用于被触发的警告类型的名称。 默认值: `'Warning'`。
  * code &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 要触发的警告实例的唯一标识符。
  * ctor &nbsp;&nbsp; `<Function>` &nbsp;&nbsp; 当 `warning` 是一个 `String` 时，则 `ctor` 是一个可选的函数，用于限制生成的堆栈信息。默认值: `process.emitWarning`。
  * detail &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 错误的附加信息。

`process.emitWarning()` 方法可用于触发自定义或应用特定的进程警告。 可以通过给 `'warning'` 事件增加处理程序来监听这些警告。

如果 `warning` 是一个 `Error` 对象，则 `options` 参数会被忽略。


### **process.emitWarning(warning: string | Error, name?: string, ctor?: Function)**
如果 warning 是一个 Error 对象，则它将会被透传给 'warning' 事件处理程序（并且将会忽略可选的 type、 code 和 ctor 参数）

如果警告的 type 是 `'DeprecationWarning'`，则会涉及如下额外的处理：
是否采用`--throw-deprecation`, `--no-deprecation`, `--trace-deprecation`命令行标识。
具体与`'warnning事件'`处理相同

### **避免重复告警**
作为最佳实践，警告应该在每个进程中最多发出一次。 为了达到上述的要求，推荐在使用`emitWarning()`之前用一个简单的布尔值做判断，如下例所示：
```js
function emitMyWarning() {
  if (!emitMyWarning.warned) {
    emitMyWarning.warned = true;
    process.emitWarning('只警告一次');
  }
}
emitMyWarning();
// 触发: (node: 56339) Warning: 只警告一次
emitMyWarning();
// 什么都没触发。
```

### **process.env: ProcessEnv**
`process.env` 属性返回包含用户环境的对象。
```js
{
  TERM: 'xterm-256color',
  SHELL: '/usr/local/bin/bash',
  USER: 'maciej',
  PATH: '~/.bin/:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin',
  PWD: '/Users/maciej',
  EDITOR: 'vim',
  SHLVL: '1',
  HOME: '/Users/maciej',
  LOGNAME: 'maciej',
  _: '/usr/local/bin/node'
}
```
可以修改此对象，但这些修改不会反映到 Node.js 进程之外，或者（除非明确请求）反映到其他 Worker 线程。 换句话说，以下示例不起作用
```
$ node -e 'process.env.foo = "bar"' && echo $foo
```
以下示例则起作用：
```js
process.env.foo = 'bar';
console.log(process.env.foo);
```
在 `process.env` 上分配属性将隐式地将值转换为字符串。 不推荐使用此行为。 当值不是字符串、数字或布尔值时，Node.js 的未来版本可能会抛出错误。

在 Windows 操作系统上，环境变量不区分大小写。

除非在创建 `Worker` 实例时明确指定，否则每个 `Worker` 线程都有自己的 `process.env` 副本，基于其父线程的 `process.env`，或者指定为 `Worker` 构造函数的 `env` 选项的任何内容。 对于 `process.env` 的更改将在 `Worker` 线程中不可见，并且只有主线程可以进行对操作系统或本机加载项可见的更改。

### **process.execArgv: string[]**
`process.execArgv` 属性返回当 Node.js 进程被启动时，Node.js 特定的命令行选项。 这些选项在 `process.argv` 属性返回的数组中不会出现，并且这些选项中不会包括 Node.js 的可执行脚本名称或者任何在脚本名称后面出现的选项。 这些选项在创建子进程时是有用的，因为他们包含了与父进程一样的执行环境信息。
```
$ node --harmony script.js --version
```
```js
// process.execArgv
['--harmony']

// process.argv
['/usr/local/bin/node', 'script.js', '--version']
```

### **process.execPath: string**
`process.execPath` 属性返回启动 Node.js 进程的可执行文件的绝对路径名。

### **process.exit(code?: number)**
`process.exit()` 方法以退出状态 `code` 指示 Node.js 同步地终止进程。 如果省略 `code`，则使用成功代码 `0` 或 `process.exitCode` 的值（如果已设置）退出。 在调用所有的 `'exit'` 事件监听器之前，Node.js 不会终止。

执行 Node.js 的 shell 应该得到的退出码为 1。

调用 `process.exit()` 将强制进程尽快退出，即使还有尚未完全完成的异步操作，包括对 `process.stdout` 和 `process.stderr` 的 I/O 操作。

在大多数情况下，实际上不必显式地调用` process.exit()`。 如果事件循环中没有待处理的额外工作，则 Node.js 进程将自行退出。 `process.exitCode` 属性可以设置为告诉进程当进程正常退出时使用哪个退出码。

例如，以下示例说明了 process.exit() 方法的错误用法，该方法可能导致打印到 stdout 的数据被截断和丢失：
```js
// 这是一个错误用法的示例：
if (someConditionNotMet()) {
  printUsageToStdout();
  process.exit(1);
}
```
这是有问题的原因是因为对 Node.js 中的 `process.stdout` 的写入有时是**异步**的，并且可能发生在 Node.js 事件循环的多个时间点中。 但是，调用 `process.exit()` 会强制进程退出，然后才能执行对 `stdout` 的其他写入操作。

代码不应直接调用 `process.exit()`，而应设置 `process.exitCode` 并允许进程自然退出，避免为事件循环调度任何其他工作：
```js
// 如何正确设置退出码，同时让进程正常退出。
if (someConditionNotMet()) {
  printUsageToStdout();
  process.exitCode = 1;
}
```
如果由于错误条件而需要终止 Node.js 进程，则抛出未被捕获的错误并允许进程相应地终止，这比调用 `process.exit()` 更安全。

在 `Worker` 线程中，此函数将停止当前**线程**而不是当前**进程**。

### **process.exitCode**
当进程正常退出，或通过 `process.exit()` 退出且未指定退出码时，此数值将作为进程的退出码。

指定 `process.exit(code)` 的退出码将覆盖 `process.exitCode` 的原有设置。

### **process.getegid(): number**
`process.getegid()` 方法返回 Node.js 进程的有效数字标记的组身份

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。

### **process.geteuid(): number**
`process.geteuid()` 方法返回 Node.js 进程的有效数字标记的用户身份

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。

### **process.getgid(): number**
`process.getgid()` 方法返回 Node.js 进程的数字标记的组身份

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。

### **process.getgroups(): number[]**
`process.getgroups()` 方法返回数组，其中包含了补充的组 ID。 如果包含有效的组 ID，则 POSIX 会将其保留为未指定状态，但 Node.js 会确保它始终处于状态。

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。

### **process.getuid(): number**
`process.getuid()` 方法返回 Node.js 进程的数字标记的用户身份

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。

### **process.hasUncaughtExceptionCaptureCallback(): boolean**
表明是否已使用 `process.setUncaughtExceptionCaptureCallback()` 设置回调。

### **process.hrtime(time?: [number, number]): [number, number]**
* time 上一次调用 process.hrtime() 的结果

这是在 JavaScript 中引入 `bigint` 之前的 `process.hrtime.bigint()` 的遗留版本。

`process.hrtime()` 方法返回当前时间以 `[seconds, nanoseconds]` 元数组表示的高精度解析值，其中 `nanoseconds` 是当前时间无法使用秒的精度表示的剩余部分。

`time` 是可选参数，传入的值是上一次调用 `process.hrtime()` 返回的结果，用于与当次调用做差值计算。 如果此参数传入的不是一个元数组，则会抛出 TypeError。 给此参数传入一个用户定义的数组，而不是传入上次调用 `process.hrtime()` 的结果，则会导致未定义的行为。

返回的时间都是相对于过去某一时刻的值，与一天中的时钟时间没有关系，因此不受制于时钟偏差。 此方法最主要的作用是衡量间隔操作的性能：
```js
const NS_PER_SEC = 1e9;
const time = process.hrtime();
// [ 1800216, 25 ]

setTimeout(() => {
  const diff = process.hrtime(time);
  // [ 1, 552 ]

  console.log(`基准工具 ${diff[0] * NS_PER_SEC + diff[1]} 纳秒`);
  // 基准工具 1000000552 纳秒
}, 1000);
```

### **process.hrtime.bigint(): bigint**
`process.hrtime()` 方法的 `bigint` 版本，返回当前的高精度实际时间（以纳秒为单位的 `bigint` 型）。

不支持额外的 `time` 参数

### **process.initgroups(user: string | number, extraGroup: string | number)**
`process.initgroups()` 方法读取 /etc/group 文件，并且初始化组访问列表，该列表包括了用户所在的所有组。 该方法需要 Node.js 进程有 root 访问或者有CAP_SETGID 能力才能操作。

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。 此特性在 Worker 线程中不可用。

### **process.kill(pid: number, signal?: string | number)**
* pid  进程 ID。
* signal  将发送的信号，类型为字符串或数字。默认值: `'SIGTERM'`。

`process.kill()` 方法将 `signal` 发送给 `pid` 标识的进程。

信号名称是如 `'SIGINT'` 或 `'SIGHUP'`的字符串。更多信息，参见OS#信号事件。

如果目标 `pid` 不存在，该方法会抛出错误。 作为一个特殊例子，信号 0 可以用于测试进程是否存在。 在 Windows 平台中，如果 `pid` 用于杀死进程组，则会抛出错误。

即使这个函数的名称是 `process.kill()`,它其实只是发送信号，这点与 kill 系统调用类似。 发送的信号可能是做一些与杀死目标进程无关的事情。

当 Node.js 进程接收到 SIGUSR1 时，Node.js 将会启动调试器，参见OS#信号事件。

### **process.memoryUsage(): MemoryUsage**
* MemoryUsage
  * rss: number 驻留集大小, 是给这个进程分配了多少物理内存（占总分配内存的一部分），包含所有的 C++ 和 JavaScript 对象与代码。
  * heapTotal: number 代表 V8 的内存使用情况。
  * heapUsed: number 代表 V8 的内存使用情况。
  * external: number 代表 V8 管理的，绑定到 Javascript 的 C++ 对象的内存使用情况
  * arrayBuffers: number  指分配给 ArrayBuffer 和 SharedArrayBuffer 的内存，包括所有的 Node.js Buffer。 这也包含在 external 值中。 当 Node.js 用作嵌入式库时，此值可能为 0，因为在这种情况下可能无法跟踪 ArrayBuffer 的分配。

`process.memoryUsage()` 方法返回 Node.js 进程的内存使用情况的对象，该对象每个属性值的单位为字节。

使用 `Worker` 线程时， `rss` 将会是一个对整个进程有效的值，而其他字段只指向当前线程

### **process.nextTick(callback: Function, ...args: any[])**
`process.nextTick()` 方法将 `callback` 添加到下一个时间点的队列。 在 JavaScript 堆栈上的当前操作运行完成之后以及允许事件循环继续之前，此队列会被完全耗尽。 如果要递归地调用 `process.nextTick()`，则可以创建无限的循环。
```js
console.log('开始');
process.nextTick(() => {
  console.log('下一个时间点的回调');
});
console.log('调度');
// 输出:
// 开始
// 调度
// 下一个时间点的回调
```
这在开发 API 时非常重要，以便在构造对象之后但在发生任何 I/O 之前，为用户提供分配事件处理函数的机会：
```js
function MyThing(options) {
  this.setupOptions(options);

  process.nextTick(() => {
    this.startDoingStuff();
  });
}

const thing = new MyThing();
thing.getReadyForStuff();

// thing.startDoingStuff() 现在被调用，而不是在之前。
```
对于 100% 同步或 100% 异步的 API，此方法也非常重要。 考虑如下示例：
```js
// 警告！不要这样使用！这是不安全的！
function maybeSync(arg, cb) {
  if (arg) {
    cb();
    return;
  }

  fs.stat('file', cb);
}
```
此 API 是不安全的，因为在以下情况中：
```js
const maybeTrue = Math.random() > 0.5;

maybeSync(maybeTrue, () => {
  foo();
});

bar();
```
不清楚是否先调用 foo() 或 bar()。

以下方法则更好：
```js
function definitelyAsync(arg, cb) {
  if (arg) {
    process.nextTick(cb);
    return;
  }

  fs.stat('file', cb);
}
```

### **process.noDeprecation: boolean**
`process.noDeprecation` 属性表明是否在当前 Node.js 进程上设置了 --no-deprecation 标志

### **process.pid: number**
`process.pid` 属性返回进程的 PID。

### **process.platform: string**
`process.platform` 属性返回字符串，标识 Node.js 进程运行其上的操作系统平台。
与`os.platform()`相似

### **process.ppid: number**
`process.ppid` 属性返回当前父进程的 PID。

### **process.release: ProcessRelease**
* ProcessRelease
  * name: `string`  对于 Node.js，此值始终为 'node'。对于遗留的 io.js 发布包，此值为 'io.js'
  * sourceUrl?: `string` 指向一个.tar.gz文件的绝对 URL，包括了当前发布的源代码。
  * headersUrl?: `string` 指向一个.tar.gz文件的绝对 URL，包括了当前发布的源代码的头文件信息。 这个文件要比全部源代码文件明显小很多，可以用于编译 Node.js 原生插件。
  * libUrl?: `string` 指向一个node.lib文件的绝对 URL，匹配当前发布的结构和版本信息。此文件用于编译 Node.js 本地插件。这个属性只在 Windows 版本中存在，在其他平台中无效。
  * lts?: `string` 标识当前发布的 LTS 标签的字符串。  只有 LTS 版本存在这个属性，其他所有版本类型（包括当前版本）这个属性都是 undefined。  当前的有效值有：
    * 'Argon' 用于 4.2.0 开始的 4.x LTS 版本。
    * 'Boron' 用于 6.9.0 开始的 6.x LTS 版本。
    * 'Carbon' 用于 8.9.1 开始的 8.x LTS 版本。

`process.release` 属性返回与当前发布相关的元数据 Object，包括源代码和源代码头文件 tarball 的 URL。

### **process.report: ProcessReport**
`process.report`返回值的方法用于为当前进程生成诊断报告


### **process.setegid(id: number | string)**
`process.setegid()` 方法为进程设置有效的组标识。 `id` 可以传入数字 ID 或组名字符串。 如果指定了组名，则此方法在解析关联的数字 ID 时会阻塞。
```js
if (process.getegid && process.setegid) {
  console.log(`当前的 gid: ${process.getegid()}`);
  try {
    process.setegid(501);
    console.log(`新的 gid: ${process.getegid()}`);
  } catch (err) {
    console.log(`无法设置 gid: ${err}`);
  }
}
```
这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。 此特性在 Worker 线程中不可用

### **process.seteuid(id: number | string)**
`process.seteuid()` 方法为进程设置有效的用户标识。id 可以传入数字 ID 或用户名字符串。 如果指定了用户名，则此方法在解析关联的数字 ID 时会阻塞。

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。 此特性在 Worker 线程中不可用

### **process.setgid(id: number | string)**
`process.setgid()` 方法为进程设置组标识。 id 可以传入数字 ID 或组名字符串。 如果指定了组名，则此方法在解析关联的数字 ID 时会阻塞。

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。 此特性在 Worker 线程中不可用

### **process.setgroups(groups: Array<string | number>)**
`process.setgid()` 方法为进程设置 补充的组 标识。 id 可以传入数字 ID 或组名字符串。 如果指定了组名，则此方法在解析关联的数字 ID 时会阻塞。

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。 此特性在 Worker 线程中不可用

### **process.setuid(id: number | string)**
`process.setuid(id)` 方法为进程设置用户标识。 id 可以传入数字 ID 或用户名字符串。 如果指定了用户名，则此方法在解析关联的数字 ID 时会阻塞。

这个函数只在 POSIX 平台有效（在 Windows 或 Android 平台无效）。 此特性在 Worker 线程中不可用

### **process.setUncaughtExceptionCaptureCallback(cb: ((err: Error) => void) | null)**
`process.setUncaughtExceptionCaptureCallback`函数设置一个在发生未捕获的异常时将被调用的函数，该函数将接收异常值本身作为其第一个参数。

如果设置了此类函数，则不会发出`'uncaughtException'`事件。如果启用--abort-on-uncaught-exception或设置`v8.setFlagsFromString`，进程不会中止。

要取消捕获功能，`process.setUncaughtExceptionCaptureCallback(null)`可以使用。在设置另一个捕获函数时使用非空参数将引发错误。


### **process.stderr: Stream**
`process.stderr` 属性返回连接到 `stderr (fd 2)` 的流。 它是一个` net.Socket` 流（也就是双工流），除非 `fd 2` 指向一个文件，在这种情况下它是一个可写流。

`process.stderr` 与其他的 Node.js 流有重大区别。 有关更多信息，参见有关进程 I/O 的注意事项。

### **process.stderr.fd: number**
此属性表示`process.stderr`引用的基础文件描述符的值. 该值固定为2。在Worker线程中，此字段不存在。

### **process.stdin: Stream**
`process.stdin` 属性返回连接到 `stdin (fd 0)` 的流。 它是一个 `net.Socket` 流（也就是双工流），除非 fd 0 指向一个文件，在这种情况下它是一个可读流。

作为双工流，` process.stdin` 也可以在“旧”模式下使用，该模式与在 v0.10 之前为 Node.js 编写的脚本兼容。 有关更多信息，参见流的兼容性。

在“旧”的流模式下，默认情况下 `stdin` 流是暂停的，因此必须调用 `process.stdin.resume()` 从中读取。 注意，调用 `process.stdin.resume()` 本身会将流切换为“旧”模式。

### **process.stdin.fd: number**
此属性表示`process.stdin`引用的基础文件描述符的值. 该值固定为0。在Worker线程中，此字段不存在。

### **process.stdout: Stream**
`process.stdout` 属性返回连接到 `stdout (fd 1)` 的流。 它是一个 `net.Socket` 流（也就是双工流），除非 `fd 1` 指向一个文件，在这种情况下它是一个可写流。

### **process.stdout.fd: number**
此属性表示`process.stdout`引用的基础文件描述符的值. 该值固定为1。在Worker线程中，此字段不存在。

### 进程 I/O 的注意事项
`process.stdout`、` process.stderr` 与 Node.js 中其他 `streams` 在重要的方面有不同:
1. console.log() 和 console.error() 内部分别是由它们实现的。
2. 写操作是否为同步，取决于连接的是什么流以及操作系统是 Windows 还是 POSIX :
   * 文件：在 Windows 和 POSIX 上是同步的。
   * TTY（终端）：在 Windows 上是异步的，在 POSIX 上是同步的。
   * 管道（和 socket）：在 Windows 上是同步的，在 POSIX 上是异步的。



这些行为部分是历史原因，改变他们可能导致向后不兼容，而且他们的行为也符合部分用户的预期。

同步写避免了调用 `console.log()` 或 `console.error()` 产生不符合预期的交错输出问题，或是在异步写完成前调用了`process.exit()`导致未写完整。

同步写将会阻塞事件循环直到写完成。 有时可能一瞬间就能写到一个文件，但当系统处于高负载时，管道的接收端可能不会被读取、缓慢的终端或文件系统，因为事件循环被阻塞的足够频繁且足够长的时间，这些可能会给系统性能带来消极的影响。当你向一个交互终端会话写时这可能不是个问题，但当生产日志到进程的输出流时要特别留心。

如果要检查一个流是否连接到了一个 TTY 上下文， 检查 isTTY 属性。
```
$ node -p "Boolean(process.stdin.isTTY)"
true
$ echo "foo" | node -p "Boolean(process.stdin.isTTY)"
false
$ node -p "Boolean(process.stdout.isTTY)"
true
$ node -p "Boolean(process.stdout.isTTY)" | cat
false
```

### **process.throwDeprecation: boolean**
`process.throwDeprecation` 的初始值表明是否在当前的 Node.js 进程上设置了 --throw-deprecation 标志。 `process.throwDeprecation` 是可变的，因此可以在运行时设置弃用警告是否应该导致错误。

### **process.title: string**
`process.title` 属性返回当前进程标题（即返回 ps 的当前值）。 为 `process.title` 分配新值会修改 ps 的当前值。

当分配新值时，不同的平台会对标题施加不同的最大长度限制。 通常这种限制是相当有限的。 例如，在 Linux 和 macOS 上， `process.title` 仅限于二进制名称的大小加上命令行参数的长度，因为设置 `process.title` 会覆盖进程的 `argv` 内存。 Node.js 的 v0.8, 通过覆盖 environ 允许内存较长的过程标题字符串，但是这在一些（相当模糊的）可能是不安全的并且令人困惑情况下。

### **process.umask(mask?: number): number**
`process.umask(mask)` 会设置 Node.js 进程的文件模式的创建掩码。 子进程从父进程继承掩码。 返回上一个掩码。

在 Worker 线程中， `process.umask(mask)` 会抛出异常。

### **process.uptime(): number**
`process.uptime()` 方法返回当前 Node.js 进程运行时间秒长

该返回值包含秒的分数。 使用 Math.floor() 来得到整秒钟。

### **process.version: string**
`process.version` 属性返回 Node.js 的版本信息。

### **process.versions: ProcessVersions**
`process.versions`属性返回一个对象，此对象列出了Node.js和其依赖的版本信息。 `process.versions.modules`表明了当前ABI版本，此版本会随着一个C++API变化而增加。 Node.js会拒绝加载模块，如果这些模块使用一个不同ABI版本的模块进行编译。
```js
{ node: '11.13.0',
  v8: '7.0.276.38-node.18',
  uv: '1.27.0',
  zlib: '1.2.11',
  brotli: '1.0.7',
  ares: '1.15.0',
  modules: '67',
  nghttp2: '1.34.0',
  napi: '4',
  llhttp: '1.1.1',
  openssl: '1.1.1b',
  cldr: '34.0',
  icu: '63.1',
  tz: '2018e',
  unicode: '11.0' }
```

### 退出码
正常情况下，如果没有异步操作正在等待，那么 Node.js 会以状态码 0 退出，其他情况下，会用如下的状态码
* 1 - 未捕获异常 - 有一个未被捕获的异常, 并且没被 `domain` 或 `'uncaughtException'` 事件处理器处理。
* 2 - 未被使用 (Bash 为防内部滥用而保留)
* 3 - 内部的 JavaScript 解析错误 - Node.js 内部的 JavaScript 源代码在引导进程中导致了一个语法解析错误。 这是非常少见的, 一般只会在开发 Node.js 本身的时候出现。
* 4 - 内部的 JavaScript 执行失败 - 引导进程执行 Node.js 内部的 JavaScript 源代码时，返回函数值失败。 这是非常少见的, 一般只会在开发 Node.js 本身的时候出现。
* 5 - 致命错误 - 在 V8 中有一个致命的错误。 比较典型的是以 FATALERROR 为前缀从 stderr 打印出来的消息。
* 6 - 非函数的内部异常处理 - 发生了一个内部异常，但是内部异常处理函数被设置成了一个非函数，或者不能被调用。
* 7 - 内部异常处理运行时失败 - 有一个不能被捕获的异常，在试图处理这个异常时，处理函数本身抛出了一个错误。 这是可能发生的, 比如, 如果一个 `'uncaughtException'` 或者 `domain.on('error')` 处理函数抛出了一个错误。
* 8 - 未被使用，在之前版本的 Node.js, 退出码 8 有时候表示一个未被捕获的异常。
* 9 - 不可用参数 - 也许是某个未知选项没有确定，或者没给必需要的选项填值。
* 10 内部的 JavaScript 运行时失败 - 调用引导函数时，引导进程执行 Node.js 内部的 JavaScript 源代码抛出错误。 这是非常少见的, 一般只会在开发 Node.js 本身的时候出现。
* 12 - 不可用的调试参数 - --inspect 和/或 --inspect-brk 选项已设置，但选择的端口号无效或不可用。
* >128 - 退出信号 - 如果 Node.js 接收到致命信号, 诸如 `SIGKILL` 或 `SIGHUP`，那么它的退出代码将是 128 加上信号的码值。 这是 POSIX 的标准做法，因为退出码被定义为 7 位整数，并且信号退出设置高位，然后包含信号码值。 例如，信号 `SIGABRT` 的值为 6，因此预期的退出代码将为 128 + 6 或 134。