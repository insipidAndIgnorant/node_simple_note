# cluster
单个 Node.js 实例运行在单个线程中。 为了充分利用多核系统，有时需要启用一组 Node.js 进程去处理负载任务。  
`cluster` 模块可以创建共享服务器端口的子进程。

## 工作原理
工作进程由 `child_process.fork()` 方法创建，因此它们可以使用 IPC 和父进程通信，从而使各进程交替处理连接服务。  
`cluster` 模块支持两种分发连接的方法。  
第一种方法（也是除 Windows 外所有平台的默认方法）是循环法，由主进程负责监听端口，接收新连接后再将连接循环分发给工作进程，在分发中使用了一些内置技巧防止工作进程任务过载。   
第二种方法是，主进程创建监听 `socket` 后发送给感兴趣的工作进程，由工作进程负责直接接收连接。

## Worker 类
继承自: `<EventEmitter>`    
`Worker` 对象包含了关于工作进程的所有的公共的信息和方法。 在主进程中，可以使用 `cluster.workers` 来获取它。 在工作进程中，可以使用 `cluster.worker` 来获取它。

### **'disconnect' 事件**
监听特定工作进程 `disconnect`
### **'error' 事件**
在工作进程种也可以使用 `process.on('error')`
### **'exit' 事件 (code,signal): void**
特定工作进程 `exit`
### **'listening' 事件**
特定工作进程正在监听 *不会在工作进程中触发*
### **'message' 事件 (message: Object, handle:Object|undefined): void**
特定工作进程收到消息
### 'online' 事件
进程上线

## Worker API
### **worker.disconnect(): this**
在一个工作进程内，调用此方法会关闭所有的 `server`，并等待这些 `server` 的 `'close'` 事件执行，然后关闭 IPC 管道。     
在主进程内，会给工作进程发送一个内部消息，导致工作进程自身调用 `.disconnect()`。

### **worker.exitedAfterDisconnect**
如果工作进程由于 `.kill()` 或 `.disconnect()` 而退出，则此属性为 `true`。 如果工作进程以任何其他方式退出，则为 `false`,如果工作进程尚未退出，则为 `undefined`。

### **worker. id**
当工作进程还存活时，id可以作为在 `cluster.workers` 中的索引。

### **worker.isConnected()**
当工作进程通过 IPC 管道连接至主进程时，这个方法返回 `true`，否则返回 `false`

### **worker.isDead()**
当工作进程被终止时（包括自动退出或被发送信号），这个方法返回 `true`。 否则，返回 `false`。

### **worker.kill(signal='SIGTERM')**
`kill()` 会尝试正常地断开工作进程   
在主进程中，通过断开与 `worker.process` 的连接来实现，一旦断开连接后，通过 `signal` 来杀死工作进程。    
在工作进程中，通过断开 IPC 管道来实现，然后以代码 `0` 退出进程

### **worker.process**
所有的工作进程都是通过 `child_process.fork()` 来创建的，这个方法返回的对象被存储为 `.process`。 在工作进程中， `process` 属于全局对象。

### **worker.send(message: child.Serializable, sendHandle?: child.SendHandle, callback?: (error: Error | null) => void): boolean**
在主进程中，这会发送消息给特定的工作进程。 相当于 `ChildProcess.send()`。  
在工作进程中，这会发送消息给主进程。 相当于 `process.send()`

## cluster  事件
### **'disconnect' 事件**
在工作进程的 IPC 管道被断开后触发。 可能导致事件触发的原因包括：工作进程优雅地退出、被杀死、或手动断开连接，    
`'disconnect'` 和 `'exit'` 事件之间可能存在延迟

### **'exit' 事件**
当任何一个工作进程关闭的时候，`cluster` 模块都将会触发 `'exit'` 事件

### **'fork' 事件**
当新的工作进程被衍生时，`cluster` 模块将会触发 `'fork'` 事件

### **'listening' 事件 (worker, adress): void**
当一个工作进程调用 `listen()` 后，工作进程上的 `server` 会触发 `'listening'` 事件。同时主进程上的 `cluster` 也会触发 `'listening'` 事件。  
`addressType` 可选值包括:  
*  `4` (TCPv4)   
*  `6` (TCPv6)  
*  `-1` (Unix 域 socket)   
*  `'udp4'` or `'udp6'` (UDP v4 或 v6)

### **'message' 事件**
当集群主进程从任何工作进程接收到消息时触发。

### **'online' 事件**
当衍生一个新的工作进程后，工作进程应当响应一个上线消息。 当主进程收到上线消息后将会触发此事件。   
`'fork'` 事件和 `'online'` 事件的区别在于，当主进程衍生工作进程时触发 `'fork'`，当工作进程运行时触发 `'online'`。

### **'setup' 事件 (settings):void**
每当 `.setupMaster()` 被调用时触发。  
`settings` 对象是 `.setupMaster()` 被调用时的 `cluster.settings` 对象，并且只能查询，因为在一个时间点内 `.setupMaster()` 可以被调用多次。

### **cluster.disconnect(callback?)**
在 `cluster.workers` 的每个工作进程中调用 `.disconnect()`。有工作进程都断开连接并且所有句柄都关闭的时候调用 `callback` 。

### **cluster.fork(env?)**
* `env` &nbsp;&nbsp; 要添加到进程环境变量的键值对。

衍生出一个新的工作进程。这只能通过主进程调用。

### **cluster.isMaster** 
是主进程，则为 true

### **cluster.isWorker** 
不是主进程，则为 true

### **cluster.schedulingPolicy**
调度策略，包括循环计数的 `cluster.SCHED_RR`，以及由操作系统决定的 `cluster.SCHED_NONE`。  
这是一个全局设置，当第一个工作进程被衍生或者调用 `.setupMaster()` 时，都将第一时间生效。    
除 Windows 外的所有操作系统中， `SCHED_RR` 都是默认设置。 只要 libuv 可以有效地分发 IOCP 句柄，而不会导致严重的性能冲击的话，Windows 系统也会更改为 `SCHED_RR`。

### **cluster.settings: Obejct**
* `execArgv` &nbsp;&nbsp; `<string[]>` &nbsp;&nbsp; 传给 Node.js 可执行文件的字符串参数列表。默认值: `process.execArgv`。
* `exec` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 工作进程的文件路径。默认值: `process.argv[1]`。
* `args` &nbsp;&nbsp; `<string[]>` &nbsp;&nbsp; 传给工作进程的字符串参数。默认值: `process.argv.slice(2)`。
* `cwd` `<string>` 工作进程的当前工作目录。默认值: `undefined`（从父进程继承）。
* `serialization` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 指定用于在进程之间发送消息的序列化类型。可能的值为 `'json'` 和 `'advanced'`。默认值: `false`。
* `silent` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 是否需要发送输出到父进程的 `stdio`。默认值: `false`。
* `stdio` &nbsp;&nbsp; `<Array>` &nbsp;&nbsp; 配置衍生的进程的 `stdio`。 由于 `cluster` 模块运行依赖于 IPC，这个配置必须包含 `'ipc'`。如果提供了这个选项，则覆盖 `silent`。
* `uid` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置进程的用户标识符。
* `gid` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置进程的群组标识符。
* `inspectPort` &nbsp;&nbsp; `<number>` | `<Function>` &nbsp;&nbsp; 设置工作进程的检查端口。这可以是一个数字、或不带参数并返回数字的函数。默认情况下，每个工作进程都有自己的端口，从主进程的 `process.debugPort` 开始递增。
* `windowsHide` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 隐藏衍生的进程的控制台窗口（通常在 Windows 系统上会创建）。默认值: `false`。

### **cluster.setupMaster(settings?)**
用于修改默认的 `'fork'` 行为。 一旦调用，将会按照 `cluster.settings` 进行设置。所有的设置只对后来的 `.fork()` 调用有效，对之前的工作进程无影响。  
唯一无法通过 `.setupMaster()` 设置的属性是传给 `.fork()` 的 `env` 属性。

### **cluster.worker**
当前工作进程对象的引用。 对于主进程则无效。

### **cluster.workers**
这是一个哈希表，储存了活跃的工作进程对象，使用 `id` 作为键名  

工作进程断开连接以及退出后，将会从 `cluster.workers` 里面移除。 这两个事件的先后顺序并不能预先确定。但可以保证的是，`cluster.workers` 的移除工作在 `'disconnect'` 和 `'exit'` 两个事件中的最后一个触发之前完成。
