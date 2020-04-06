# child_process 子进程
默认情况下， `stdin`、 `stdout` 和 `stderr` 的管道会在父 Node.js 进程和衍生的子进程之间建立。 这些管道具有有限的（且平台特定的）容量。如果子进程写入 `stdout` 时超出该限制且没有捕获输出，则子进程将会阻塞并等待管道缓冲区接受更多的数据。 
这与 shell 中的管道的行为相同。 如果不消费输出，则使用 `{ stdio: 'ignore' }` 选项。

`child_process.spawn()` 方法异步地衍生子进程，且不阻塞 Node.js 事件循环。  
`child_process.spawnSync()` 函数则以同步的方式提供了等效的功能，但会阻塞事件循环直到衍生的进程退出或终止。<br><br><br>

## child_process 子进程

### **child_process.exec(command: string, callback?: (error: ExecException | null, stdout: string, stderr: string) => void): ChildProcess**
* `command` &nbsp;&nbsp;`<string>` &nbsp;&nbsp;要运行的命令，并带上以空格分隔的参数。
* `options` &nbsp;&nbsp; `Obejct`
    * `cwd` &nbsp;&nbsp;`<string>` &nbsp;&nbsp; 子进程的当前工作目录。默认值: `null`
    * `env` &nbsp;&nbsp;`<Object>` &nbsp;&nbsp; 环境变量的键值对。默认值: `process.env`
    * `encoding` &nbsp;&nbsp;`<string>` &nbsp;&nbsp; 默认值: `'utf8'`。
    * `shell` &nbsp;&nbsp;`<string>` &nbsp;&nbsp; 用于执行命令的 `shell`。参阅 [shell的要求](#shellrequire)与 [Windows默认的 shell](#windefalutshell)。 默认值: Unix 上是 `'/bin/sh'`，Windows 上是 `process.env.ComSpec`。
    * `timeout` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认值: `0`。
    * `maxBuffer` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; `stdout` 或 `stderr` 上允许的最大字节数。如果超过限制，则子进程会被终止并且截断任何输出。默认值: `1024 * 1024`。
    * `killSignal` &nbsp;&nbsp; `<string>` | `<integer>`&nbsp;&nbsp; 默认值: `'SIGTERM'`。
    * `uid` &nbsp;&nbsp; `<number>`&nbsp;&nbsp; 设置进程的用户标识。
    * `gid` &nbsp;&nbsp; `<number>`&nbsp;&nbsp; 设置进程的群组标识。
    * `windowsHide` &nbsp;&nbsp; `<boolean>`&nbsp;&nbsp; 隐藏子进程的控制台窗口（在 Windows 系统上通常会创建）。默认值: `false`。
* `callback` &nbsp;&nbsp; `<Function> : ChildProcess` &nbsp;&nbsp;当进程终止时调用并带上输出。`{ error, stdout, stderr }`      <br><br><br>


### **execFile(<br>file: string,<br>args: ReadonlyArray<string> | undefined | null,<br>options: ExecFileOptions,<br>callback: (error, stdout, stderr) => void<br>): ChildProcess**
* `file`  &nbsp;&nbsp;`<string>`&nbsp;&nbsp; 要运行的可执行文件的名称或路径。
* `args`  &nbsp;&nbsp;`<string[]>`&nbsp;&nbsp; 字符串参数的列表。
* `options` &nbsp;&nbsp; `<Obejct>`
    * `cwd` &nbsp;&nbsp;`<string>` &nbsp;&nbsp; 子进程的当前工作目录。默认值: `null`
    * `env` &nbsp;&nbsp;`<Object>` &nbsp;&nbsp; 环境变量的键值对。默认值: `process.env`
    * `encoding` &nbsp;&nbsp;`<string>` &nbsp;&nbsp; 默认值: `'utf8'`。
    * `timeout`  &nbsp;&nbsp;`<number>` &nbsp;&nbsp; 默认值: `0`。
    * `maxBuffer` &nbsp;&nbsp; `<number>`&nbsp;&nbsp; `stdout` 或 `stderr` 上允许的最大字节数。如果超过限制，则子进程会被终止并且截断任何输出。默认值: `1024 * 1024`。
    * `killSignal` &nbsp;&nbsp; `<string>` | `<integer>`&nbsp;&nbsp; 默认值: `'SIGTERM'`。
    * `uid` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置进程的用户标识。
    * `gid` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置进程的群组标识。
    * `windowsHide` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 隐藏子进程的控制台窗口（在 Windows 系统上通常会创建）。默认值: `false`。
    * `shell` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 用于执行命令的 `shell`。参阅 [shell的要求](#shellrequire)与 [Windows默认的 shell](#windefalutshell)。 默认值: Unix 上是 `'/bin/sh'`，Windows 上是 `process.env.ComSpec`。
    * `windowsVerbatimArguments` &nbsp;&nbsp; `<boolean>`  &nbsp;&nbsp; 在 Windows 上不为参数加上引号或转义。在 Unix 上忽略。默认值: `false`。
* `callback` &nbsp;&nbsp; `<Function> : ChildProcess` &nbsp;&nbsp; 当进程终止时调用并带上输出。`{ error, stdout, stderr }`

`child_process.execFile()` 函数类似于 `child_process.exec()`，但默认情况下不会衍生 `shell`。 相反，指定的可执行文件 file 会作为新进程直接地衍生，使其比 `child_process.exec()` 稍微更高效。

支持与 `child_process.exec()` 相同的选项。 由于没有衍生 `shell`，因此*不支持 `I/O` 重定向和文件通配等行为*。<br><br><br>

### **fork(modulePath: string, args?: ReadonlyArray<string>, options?: ForkOptions): ChildProcess**
* `modulePath` &nbsp;&nbsp;`<string>` &nbsp;&nbsp; 要在子进程中运行的模块。
* `args`  &nbsp;&nbsp; `<string[]>` &nbsp;&nbsp; 字符串参数的列表。
* `options` &nbsp;&nbsp; `Obejct`
    * `cwd` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 子进程的当前工作目录。默认值: `null`
    * `detached` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 准备子进程独立于其父进程运行。具体行为取决于平台，参阅 [options.detached](#detached)。
    * `env` &nbsp;&nbsp; `<Object>` &nbsp;&nbsp; 环境变量的键值对。默认值: `process.env`
    * `execPath` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 用于创建子进程的可执行文件。
    * `execArgv` &nbsp;&nbsp; `<string[]>` &nbsp;&nbsp; 传给可执行文件的字符串参数的列表。默认值: `process.execArgv`。
    * `serialization` &nbsp;&nbsp; `<string>`&nbsp;&nbsp; 指定用于在进程之间发送消息的序列化类型。可能的值为 `'json'` 和 `'advanced'`。默认值: `'json'`。
    * `silent` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 如果为 `true`，则子进程的 `stdin`、`stdout` 和 `stderr` 将会被输送到父进程，否则它们将会继承自父进程，详见 `child_process.spawn()` 的 `stdio` 中的 `'pipe'` 和 `'inherit'` 选项。默认值: `false`。
    * `stdio` &nbsp;&nbsp; `<Array> | <string>`&nbsp;&nbsp; 参阅 [child_process.spawn()]() 的 `stdio`。当提供此选项时，则它覆盖 `silent` 选项。如果使用了数组变量，则它必须包含一个值为 `'ipc'` 的元素，否则将会抛出错误。例如 `[0, 1, 2, 'ipc']`。
    * `windowsVerbatimArguments` &nbsp;&nbsp; `<boolean>`&nbsp;&nbsp; 在 Windows 上不为参数加上引号或转义。在 Unix 上则忽略。默认值: `false`。
    * `uid` &nbsp;&nbsp; `<number>`&nbsp;&nbsp; 设置进程的用户标识。
    * `gid` &nbsp;&nbsp; `<number>`&nbsp;&nbsp; 设置进程的群组标识。

`child_process.fork()` 方法是 `child_process.spawn()` 的一个特例，专门用于衍生新的 Node.js 进程。 与 `child_process.spawn()` 一样返回 `ChildProcess` 对象。 返回的 `ChildProcess` 将会内置一个额外的通信通道，允许消息在父进程和子进程之间来回传递。 详见 [subprocess.send()]()。   

*记住，衍生的 Node.js 子进程独立于父进程，但两者之间建立的 `IPC` 通信通道除外。 每个进程都有自己的内存，带有自己的 V8 实例。 由于需要额外的资源分配，因此不建议衍生大量的 Node.js 子进程。*   

默认情况下， `child_process.fork()` 将会使用父进程的 `process.execPath` 来衍生新的 Node.js 实例。 `options` 对象中的 `execPath` 属性允许使用其他的执行路径。

使用自定义的 `execPath` 启动的 Node.js 进程将会使用文件描述符（在子进程上使用环境变量 `NODE_CHANNEL_FD` 标识）与父进程通信。

`child_process.fork()` 不会克隆当前的进程。

`child_process.spawn()` 中可用的 `shell` 选项在 `child_process.fork()` 中不支持，如果设置则将会被忽略。<br><br><br>

### **spawn(command: string, args: ReadonlyArray<string>, options: SpawnOptions): ChildProcess**
* modulePath &nbsp;&nbsp;`<string>`&nbsp;&nbsp; 要在子进程中运行的模块。
* args  &nbsp;&nbsp;`<string[]>`&nbsp;&nbsp; 字符串参数的列表。
* options &nbsp;&nbsp; `Obejct`
    * `cwd` &nbsp;&nbsp;`<string>` &nbsp;&nbsp; 子进程的当前工作目录。默认值: `null`, 如果没有给定，则默认为继承当前工作目录
    * `env` &nbsp;&nbsp;`<Object>` &nbsp;&nbsp; 环境变量的键值对。默认值: `process.env`。`undefined` 值将会被忽略。
    * `argv0`  &nbsp;&nbsp;`<string>` &nbsp;&nbsp; 显式地设置发送给子进程的 `argv[0]` 的值。如果没有指定，则将会被设置为 `command` 的值。
    * `stdio` &nbsp;&nbsp;`<Array> | <string>` &nbsp;&nbsp; 子进程的 `stdio` 配置,参阅 [options.stdio](#stdio)。
    * `detached`  &nbsp;&nbsp; `<boolean>`&nbsp;&nbsp; 准备子进程独立于其父进程运行。具体行为取决于平台。参阅 [options.detached](#detached)。
    * `uid` &nbsp;&nbsp; `<number>`&nbsp;&nbsp; 设置进程的用户标识。
    * `gid` &nbsp;&nbsp; `<number>`&nbsp;&nbsp; 设置进程的群组标识。
    * `serialization` &nbsp;&nbsp; `<string>`&nbsp;&nbsp; 指定用于在进程之间发送消息的序列化类型。可能的值为 `'json'` 和 `'advanced'`。默认值: `'json'`。
    * `windowsHide` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 隐藏子进程的控制台窗口（在 Windows 系统上通常会创建）。默认值: `false`。
    * `shell` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 用于执行命令的 `shell`。参阅 [shell的要求](#shellrequire)与 [Windows默认的 shell](#windefalutshell)。 默认值: Unix 上是 `'/bin/sh'`，Windows 上是 `process.env.ComSpec`。
    * `windowsVerbatimArguments` &nbsp;&nbsp; `<boolean>`&nbsp;&nbsp; 在 Windows 上不为参数加上引号或转义。在 Unix 上则忽略。默认值: `false`。
    
Node.js 在启动时会使用 `process.execPath` 覆盖 `argv[0]`，因此 Node.js 子进程的 `process.argv[0]` 与从父进程传给 `spawn` 的 `argv0` 参数不会匹配，可以使用 `process.argv0` 属性获取。


#### <span id="detached">option.detached</span>
在 Windows 上，设置 `options.detached` 为 `true` 可以使子进程在父进程退出后继续运行。 子进程有自己的控制台窗口。 一旦为子进程启用它，则无法被禁用。

在非 Windows 平台上，如果 `options.detached` 设为 `true`，则子进程将会成为新的进程组和会话的主导者。 子进程在父进程退出后可以继续运行，不管它们是否被分离。

默认情况下，父进程将会等待被分离的子进程退出。 为了防止父进程等待 `subprocess`，可以使用 `subprocess.unref()` 方法。 这样做将会导致父进程的事件循环不会将子进程包含在其引用计数中，使得父进程可以独立于子进程退出，除非子进程和父进程之间建立了 IPC 通道。

当使用 `detached` 选项来启动一个长期运行的进程时，该进程在父进程退出后将不会保持在后台运行，除非提供一个不连接到父进程的 `stdio` 配置。 如果父进程的 `stdio` 是继承的，则子进程将会保持绑定到控制终端。

#### <span id="stdio">option.stdio</span>
`options.stdio` 选项用于配置在父进程和子进程之间建立的管道。 默认情况下，子进程的 `stdin`、 `stdout` 和 `stderr` 会被重定向到 `ChildProcess` 对象上相应的 `subprocess.stdin`、`subprocess.stdout` 和 `subprocess.stderr` 流。 这相当于将 `options.stdio` 设置为 `['pipe', 'pipe', 'pipe']`。

为方便起见，`options.stdio` 可以是以下字符串之一：
* `'pipe'` - 相当于 `['pipe', 'pipe', 'pipe']`（默认值）。
* `'ignore'` - 相当于 `['ignore', 'ignore', 'ignore']`。
* `'inherit'` - 相当于 `['inherit', 'inherit', 'inherit']` 或 `[0, 1, 2]`。

否则， `options.stdio` 的值是一个数组，其中每个索引对应于子进程中的 `fd`。 fd 0、1 和 2 分别对应于 stdin、stdout 和 stderr。 可以指定其他 fd 以便在父进程和子进程之间创建额外的管道。 值可以是以下之一：    
1. `'pipe'` - 在子进程和父进程之间创建一个管道。 管道的父端作为 `child_process` 对象上的 `subprocess.stdio[fd]` 属性暴露给父进程。 为 fd 0 - 2 创建的管道也可分别作为 `subprocess.stdin`、`subprocess.stdout` 和 `subprocess.stderr` 使用。
2. `'ipc'` - 创建一个 IPC 通道，用于在父进程和子进程之间传递消息或文件描述符。 一个 `ChildProcess` 最多可以有一个 IPC stdio文件描述符。 设置此选项会启用 `subprocess.send()` 方法。 如果子进程是一个 Node.js 进程，则 IPC 通道的存在将会启用 `process.send()` 和 `process.disconnect()` 方法、以及子进程内的 `'disconnect'` 和 `'message'` 事件。
3. `'ignore'` - 指示 Node.js 忽略子进程中的 fd。 虽然 Node.js 将会始终为它衍生的进程打开 fd 0 - 2，但将 fd 设置为 `'ignore'` 将会导致 Node.js 打开 `/dev/null` 并将其附加到子进程的 fd。
4. `'inherit'` - 将相应的 stdio 流传给父进程或从父进程传入。 在前三个位置中，这分别相当于 `process.stdin`、 `process.stdout` 和 `process.stderr`。 在任何其他位置中，则相当于 `'ignore'`。
5. `<Stream>` 对象 - 与子进程共享指向 `tty`、文件、 `socket` 或管道的可读或可写流。 流的底层文件描述符在子进程中会被复制到与 stdio 数组中的索引对应的 fd。 该流必须具有一个底层的描述符（文件流直到触发 `'open'` 事件才需要）
6. 正整数 - 整数值会被解释为当前在父进程中打开的文件描述符。 它与子进程共享，类似于共享 `<Stream>` 对象的方式。 在 Windows 上不支持传入 `socket`
7. `null` 或 `undefined` - 使用默认值。 对于 stdio 的 fd 0、1 和 2（换句话说，stdin、stdout 和 stderr），将会创建一个管道。 对于 fd 3 及更大的值，则默认为 `'ignore'`。

当在父进程和子进程之间建立 IPC 通道，并且子进程是一个 Node.js 进程时，则子进程启动时不会指向 IPC 通道（使用 `unref()`），直到子进程为 `'disconnect'` 事件或 `'message'` 事件注册了事件处理函数。 这允许子进程正常退出而不需要通过开放的 IPC 通道保持打开该进程。

在类 Unix 操作系统上，`child_process.spawn()` 方法在将事件循环与子进程解耦之前会同步地执行内存操作。 具有大内存占用的应用程序可能会发现频繁的 `child_process.spawn()` 调用成为瓶颈。<br><br><br>

## ChildProcess 类
继承自: `<EventEmitter>`

### **'close'事件**
`(code: number signal: string) => void`  

当子进程的 `stdio` 流已被关闭时会触发 `'close'` 事件。 这与 `'exit'` 事件不同，因为多个进程可能共享相同的 `stdio` 流。


### **'disconnect' 事件**
调用父进程中的 `subprocess.disconnect()` 或子进程中的 `process.disconnect()` 后会触发 `'disconnect'` 事件。  
断开连接后就不能再发送或接收信息，且 `subprocess.connected` 属性为 `false`。

### **'error' 事件**
每当出现以下情况时触发 `'error'` 事件：
* 无法衍生进程
* 无法杀死进程
* 向子进程发送消息失败

### **'exit' 事件** 
`(code: number signal: string) => void`  

当子进程结束后时会触发 `'exit'` 事件。 如果进程退出，则 `code` 是进程的最终退出码，否则为 `null`。
如果进程是因为收到的信号而终止，则 `signal` 是信号的字符串名称，否则为 `null`。 这两个值至少有一个是非空的。

当 `'exit'` 事件被触发时，子进程的 `stdio` 流可能依然是打开的。Node.js 为 `SIGINT` 和 `SIGTERM` 建立了信号处理程序，且 Node.js 进程收到这些信号不会立即终止。相反，Node.js 将会执行一系列的清理操作，然后再重新提升处理后的信号。

### **'message' 事件**
`(message, sendHandle) => void`  

当子进程使用 `process.send()` 发送消息时会触发 `'message'` 事件。消息通过序列化和解析进行传递
* `message` &nbsp;&nbsp; `<Object>` 一个已解析的 `JSON` 对象或原始值
* `sendHandle` &nbsp;&nbsp; `<Handle>` 一个 `net.Socket` 或 `net.Server` 对象，或 `undefined`

## properties & function

### **subprocess.channel**  
对子进程的 IPC 通道的引用

### **subprocess.connected**  
是否可以从子进程发送和接收消息

### **subprocess.disconnect()** 
关闭父进程与子进程之间的 IPC 通道，一旦没有其他的连接使其保持活跃，则允许子进程正常退出

### **subprocess.kill(signal: number | string): boolean**
向子进程发送一个信号。 如果没有给定参数，则进程将会发送 `'SIGTERM'` 信号,返回是否操作成功。虽然该函数被称为 `kill`，但传给子进程的信号 可能 实际上不会终止该进程。

### **subprocess.killed**  
`subprocess.kill()` 成功发送信号到子进程后，该值会被设为 `true`。并不表明子进程是否已被终止

### **subprocess.pid** 
子进程的进程标识符（PID）

### **subprocess.ref()**
调用 `subprocess.unref()` 之后再调用 `subprocess.ref()` 将会为子进程恢复已删除的引用计数，强迫父进程在退出自身之前等待子进程退出。

### **subprocess.unref()**
默认情况下，父进程将会等待已分离的子进程退出。 为了防止父进程等待给定的 `subprocess` 退出，可使用 `subprocess.unref()` 方法。这样做将会导致父进程的事件循环不会在其引用计数中包括子进程，允许父进程独立于子进程退出，除非子进程与父进程之间已建立了 IPC 通道。

### **subprocess.send(message: Serializable, sendHandle?: SendHandle, options?: MessageOptions, callback?: (error: Error | null) => void): boolean**
* `message` &nbsp;&nbsp; 传递的消息
* `sendHandle` &nbsp;&nbsp; `net.Socket` | `net.Server` &nbsp;&nbsp; 可选的 `sendHandle` 参数用于将 TCP 服务器或 `socket` 对象传给子进程。子进程将会接收该对象作为传给在 `'message'` 事件上注册的回调函数的第二个参数。 在 `socket` 中接收和缓冲的任何数据都不会被发送给子进程。
* `options.keepOpen` &nbsp;&nbsp; 传给 `net.Socket` 实例时可以使用的值。当设为 `true` 时，则 `socket` 在发送过程中会保持打开状态

如果通道已关闭、或当未发送的消息的积压超过阈值使其无法发送更多时， subprocess.send() 将会返回 false

### **subprocess.stderr**
表示子进程的 stderr 的可读流。
### **subprocess.stdin**
表示子进程的 stdin 的可写流
### **subprocess.stdio**
一个到子进程的管道的稀疏数组
### **subprocess.stdout**
表示子进程的 stdout 的可读流
<br><br><br>

## **<span id="shellrequire">shell 的要求</span>**
`Shell` 需要能理解 `-c` 开关。 如果 `shell` 是 `'cmd.exe'`，则它需要能理解 `/d /s /c` 开关，且命令行解析需要能兼容。
## **<span id="windefalutshell">Windows 默认的 shell</span>**
尽管微软指定在根环境中 %COMSPEC% 必须包含 'cmd.exe' 的路径，但子进程并不总是遵循相同的要求。 因此，在可以衍生 shell 的 child_process 函数中，如果 process.env.ComSpec 不可以，则使用 'cmd.exe' 作为后备。