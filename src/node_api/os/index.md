# OS
os 模块提供了与操作系统相关的实用方法和属性。

### **os.EOF: string**
操作系统特定的行末标志
* windows 上是 `\r\n`
* posix 上是 `\n`

### **os.arch(): string**
返回为其编译 Node.js 二进制文件的操作系统的 CPU 架构。 可能的值有：'arm'、 'arm64'、 'ia32'、 'mips'、 'mipsel'、 'ppc'、 'ppc64'、 's390'、 's390x'、 'x32' 和 'x64'。

返回的值等价于 `process.arch`。

### **os.constants**
包含错误码、进程信号等常用的操作系统特定的常量。 定义的特定常量在 [OS 常量中](#os-constance)描述。

### **os.cpus(): CpuInfo[]**
返回一个对象数组，其中包含有关每个逻辑 CPU 内核的信息。
* `CpuInfo`
  * `model` &nbsp;&nbsp; `string`
  * `speed` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 以兆赫兹为单位。
  * `times` 
    * `user` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; CPU 在用户模式下花费的毫秒数。
    * `nice` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; CPU 在良好模式下花费的毫秒数。
    * `sys` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; CPU 在系统模式下花费的毫秒数。
    * `idle` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; CPU 在空闲模式下花费的毫秒数。
    * `irq` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; CPU 在中断请求模式下花费的毫秒数。


```js
// console.log(os.cpus())
[
  {
    model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 252020,
      nice: 0,
      sys: 30340,
      idle: 1070356870,
      irq: 0
    }
  },
  {
    model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 306960,
      nice: 0,
      sys: 26980,
      idle: 1071569080,
      irq: 0
    }
  },
  {
    model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 248450,
      nice: 0,
      sys: 21750,
      idle: 1070919370,
      irq: 0
    }
  },
  {
    model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
    speed: 2926,
    times: {
      user: 256880,
      nice: 0,
      sys: 19430,
      idle: 1070905480,
      irq: 20
    }
  }
]
```

`nice` 的值仅适用于 POSIX。 在 Windows 上，所有处理器的 `nice` 值始终为 0。

###  **os.endianness(): string**
返回一个字符串，该字符串标识为其编译 Node.js 二进制文件的 CPU 的字节序。

可能的值有， 'BE' 用于大端字节序， 'LE' 用于小端字节序。

Buffer读写数据与字节序有关

### **os.freemem(): number**
以整数的形式返回空闲的系统内存量（以字节为单位）。

### **os.getPriority(pid?: number): number**
返回由 `pid` 指定的进程的调度优先级。 如果未提供 `pid` 或者为 0，则返回当前进程的优先级。

### **os.homedir(): string**
返回当前用户的主目录的字符串路径。

在 POSIX 上，使用 $HOME 环境变量（如果有定义）。 否则，使用有效的 UID 来查找用户的主目录。

在 Windows 上，使用 USERPROFILE 环境变量（如果有定义）。 否则，使用当前用户的配置文件目录的路径。
```js
console.log(os.homedir());
// C:\Users\Administrator
```

### **os.hostname(): string**
以字符串的形式返回操作系统的主机名。
```js
console.log(os.hostname());
// computer name lick PC-ASUS
```

### **os.loadavg(): number[]**
返回一个数组，包含 1、5 和 15 分钟的平均负载。

平均负载是系统活动性的测量，由操作系统计算得出，并表现为一个分数。

平均负载是 UNIX 特定的概念。 *在 Windows 上，其返回值始终为 [0, 0, 0]。*

### **os.networkInterfaces():  { [index: string]: NetworkInterfaceInfo[] }**
* `NetworkInterfaceInfo`
 * address `<string>` 分配的 IPv4 或 IPv6 地址。
 * netmask `<string>` IPv4 或 IPv6 的子网掩码。
 * family `<string>` IPv4 或 IPv6。
 * mac `<string>` 网络接口的 MAC 地址。
 * internal `<boolean>` 如果网络接口是不可远程访问的环回接口或类似接口，则为 true，否则为 false。
 * scopeid `<number>` 数值型的 IPv6 作用域 ID（仅当 family 为 IPv6 时指定）。
 * cidr `<string>` 以 CIDR 表示法分配的带有路由前缀的 IPv4 或 IPv6 地址。如果 netmask 无效，则此属性会被设为 null。

返回一个对象，该对象包含已分配了网络地址的网络接口。

返回的对象上的每个键都标识了一个网络接口。 关联的值是一个对象数组，每个对象描述了一个分配的网络地址。

```js
{
    '以太网':
    [{
        address: '192.168.35.67',
        netmask: '255.255.255.0',
        family: 'IPv4',
        mac: '4c:cc:6a:23:83:dc',
        internal: false,
        cidr: '192.168.35.67/24'
    }],

    'Loopback Pseudo-Interface 1':
    [{
        address: '::1',
        netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
        family: 'IPv6',
        mac: '00:00:00:00:00:00',
        scopeid: 0,
        internal: true,
        cidr: '::1/128'
    },
    {
        address: '127.0.0.1',
        netmask: '255.0.0.0',
        family: 'IPv4',
        mac: '00:00:00:00:00:00',
        internal: true,
        cidr: '127.0.0.1/8'
    }]
}
```

### **os.platform()： Platform**
返回标识操作系统平台的字符串。 该值在编译时设置。返回的值等价于 process.platform。如果 Node.js 在 Android 操作系统上构建，则也可能返回 `'android'` 值。 Android 的支持是*实验性*的。

```ts
type Platform = 'aix'  | 'android' | 'darwin' | 'freebsd' | 'linux' | 'openbsd'  | 'sunos' | 'win32' | 'cygwin' | 'netbsd';
```

### **os.release(): string**
以字符串的形式返回操作系统。

在 POSIX 系统上，操作系统的发行版是通过调用 uname 判断的。 在 Windows 上, 则使用 GetVersionExW()。
```js
console.log(os.release());
// 10.0.17763
```

### **os.setPriority(pid: number, priority: number)**
尝试为 pid 指定的进程设置调度优先级。 如果未提供 pid 或者为 0，则使用当前进程的进程 ID。

priority 输入必须是 -20（高优先级）到 19（低优先级）之间的整数。 由于 Unix 优先级和 Windows 优先级之间的差异， priority 会被映射到 os.constants.priority 中的六个优先级常量之一。 当检索进程的优先级时，此范围的映射可能导致 Windows 上的返回值略有不同。 为避免混淆，应将 priority 设置为优先级常量之一。

在 Windows 上，将优先级设置为 PRIORITY_HIGHEST 需要较高的用户权限。 否则，设置的优先级将会被静默地降低为 PRIORITY_HIGH。

### **os.tmpdir(): string**
以字符串的形式返回操作系统的默认临时文件目录。
```js
console.log(os.tmpdir());
// C:\Users\ADMINI~1\AppData\Local\Temp
```

### **os.totalmem(): number**
以整数的形式返回系统的内存总量（以字节为单位）。
```js
console.log(os.totalmem());
// 8460562432
```

### **os.type(): string**
返回与 uname 返回一样的操作系统名字。 例如，在 Linux 上返回 'Linux'，在 macOS 上返回 'Darwin'，在 Windows 上返回 'Windows_NT'。

### **os.uptime(): number**
返回系统的正常运行时间（以秒为单位）。
```js
console.log(os.uptime());
// 6842853
```

### **os.userInfo(options?: { encoding: string }): UserInfo<string>**
* encoding `<string>` 用于解释结果字符串的字符编码。如果将 `encoding` 设置为 `'buffer'`，则 `username`、 `shell` 和 `homedir` 的值将会是 Buffer 实例。默认值: 'utf8'。

返回关于当前有效用户的信息。 在 POSIX 平台上，这通常是密码文件的子集。 返回的对象包含 `username`、 `uid`、 `gid`、 `shell` 和 `homedir`。 在 Windows 上，则 uid 和 gid 字段为 -1，且 shell 为 null。

`os.userInfo()` 返回的 `homedir` 的值由操作系统提供。 这与 `os.homedir()` 的结果不同，其是在返回操作系统的响应之前会先查询主目录的环境变量。

如果用户没有 `username` 或 `homedir`，则抛出 SystemError。
```js
console.log(os.userInfo());
// { uid: -1,
//   gid: -1,
//   username: 'Administrator',
//   homedir: 'C:\\Users\\Administrator',
//   shell: null }
```

### **os.version(): string**
返回标识内核版本的字符串。

```js
console.log(os.uptime());
// 10.0.17763
```


<br/><br/><br/>

## <span id="os-constance">OS 常量</span>

### **信号常量**
| 常量 | 描述 |
| :-- | :-- |
| SIGHUP | 发送来表明当一个控制终端关闭或者是父进程退出。 |
| SIGINT | 发送来表明当一个用户期望中断一个进程时。((Ctrl+C)). |
| SIGQUIT | 发送来表明当一个用户希望终止一个进程并且执行核心转储。 quit|
| SIGILL | 发送给一个进程来通知它已经试图执行一个非法的、畸形的、未知的或特权的指令. illegal |
| SIGTRAP | 发送给一个进程当异常已经发生。 trapped|
| SIGABRT | 发送给一个进程来请求终止。abort |
| SIGIOT | SIGABRT 的同义词 |
| SIGBUS | 发送给一个进程来通知它已经造成了总线错误。bus error | 
| SIGFPE | 发送给一个进程来通知它已经执行了一个非法的算术操作。 |
| SIGKILL | 发送给一个进程来立即终止它。kill |
| SIGUSR1 SIGUSR2 | 发送给一个进程来确定它的用户定义情况。user|
| SIGSEGV | 发送给一个进程来通知段错误  segmentation |
| SIGPIPE | 发送给一个进程当它试图写入一个非连接的管道时。pipe（管道） |
| SIGALRM | 发送给一个进程当系统时钟消逝时。alarm? |
| SIGTERM | 发送给一个进程来请求终止。terminate|
| SIGCHLD | 发送给一个进程当一个子进程终止时。child |
| SIGSTKFLT | 发送给一个进程来表明一个协处理器(协助中央处理器完成特定工作)的栈错误。 stack fault |
| SIGCONT | 发送来通知操作系统继续一个暂停的进程。continue |
| SIGSTOP | 发送来通知操作系统暂停一个进程。stop |
| SIGTSTP | 发送给一个进程来请求它停止。|
| SIGBREAK | 发送来表明当一个用户希望终止一个进程。break |
| SIGTTIN | 发送给一个进程当它在后台读取 TTY (输入输出环境)时。 |
| SIGTTOU | 发送给一个进程当它在后台写入 TTY 时。|
| SIGURG | 发送给一个进程当 socket 有紧急的数据需要读取时。 urgent(紧急的)  |
| SIGXCPU | 发送给一个进程当它超过他在 CPU 使用上的限制时。 |
| SIGXFSZ | 发送给一个进程当它使文件成长地比最大允许的值还大时。file size? |
| SIGVTALRM | 发送给一个进程当一个虚拟时钟消逝时。virtual alarm |
| SIGPROF	| 发送给一个进程当一个系统时钟消逝时。 |
| SIGWINCH | 发送给一个进程当控制终端改变它的大小。 win change |
| SIGIO | 发送给一个进程当 I/O 可用时。 |
| SIGPOLL | SIGIO 的同义词 |
| SIGLOST | 发送给一个进程当文件锁丢失时。lost |
| SIGPWR | 发送给一个进程来通知功率错误。power |
| SIGINFO | SIGPWR 的同义词 |
| SIGSYS | 发送给一个进程来通知有错误的参数。|
| SIGUNUSED | SIGSYS 的同义词 |


### 错误常量
| 常量 | 描述 |
| :-- | :-- |
| E2BIG | 表明参数列表比期望的要长。|
| EACCES | 表明操作没有足够的权限。access |
| EADDRINUSE | 表明该网络地址已经在使用。address in use |
| EADDRNOTAVAIL | 表明该网络地址当前不能使用。address not avail |
| EAFNOSUPPORT | 表明该网络地址簇不被支持。 not support |
| EAGAIN | 表明没有可用数据,稍后再次尝试操作。 again |
| EALREADY | 表明 socket 有一个即将发生的连接在进行中。 already |
| EBADF | 表明一个文件描述符不可用。 bad fd|file? |
| EBADMSG | 表明一个无效的数据信息。bad message |
| EBUSY | 表明一个设备或资源处于忙碌中。busy |
| ECANCELED | 表明一个操作被取消。 canceled |
| ECHILD |	表明没有子进程。 child |
| ECONNABORTED |	表明网络连接已经被终止。connect aborted |
| ECONNREFUSED |	表明网络连接被拒绝。connect refused |
| ECONNRESET |	表明网络连接被重置。connect reset |
| EDEADLK |	表明一个资源死锁已经被避免。 dead lock |
| EDESTADDRREQ |	表明需要目的地址。 destination address |
| EDOM | 表明参数超过了函数的作用域。|
| EDQUOT | 表明已经超过磁盘指标。|
| EEXIST |表明文件已经存在。 exist |
| EFAULT | 表明一个无效的指针地址。 fault |
| EFBIG | 表明文件太大。 file big? |
| EHOSTUNREACH | 表明主机不可达。 host unreached |
| EIDRM | 表明识别码已经被移除。|
| EILSEQ | 表明一个非法的字节序。 |
| EINPROGRESS | 表明一个操作已经在进行中。 in progress |
| EINTR | 表明一个函数调用被中断。 interrupted |
| EINVAL | 表明提供了一个无效的参数。invailid |
| EIO | 表明一个其他的不确定的 I/O 错误。 |
| EISCONN | 表明 socket 已经连接。 is connected |
| EISDIR | 表明路径是目录。 is dir |
| ELOOP | 表明路径上有太多层次的符号连接 |
| EMFILE | 表明有太多打开的文件。|
| EMLINK | 表明文件上有太多的硬连接。 many link|
| EMSGSIZE | 表明提供的信息太长。 message size |
| EMULTIHOP | 表明多跳被尝试。 multiply hop |
| ENAMETOOLONG | 表明文件名太长。 name too long |
| ENETDOWN | 表明网络关闭。 net down |
| ENETRESET | 表明连接被网络终止。 net reset | 
| ENETUNREACH | 表明网络不可达。 net unreach |
| ENFILE | 表明系统中打开了太多的文件。 |
| ENOBUFS | 表明没有有效的缓存空间。 no buff size |
| ENODATA | 表明在流头读取队列上没有可用的信息。 no data |
| ENODEV | 表明没有这样的设备。 no dev |
| ENOENT | 表明没有这样的文件或目录。|
| ENOEXEC |	表明一个执行格式错误。no execution |
| ENOLCK |	表明没有可用的锁。 no lock |
| ENOLINK | 表明链接在服务 |
| ENOMEM |	表明没有足够的空间。 no memory |
| ENOMSG |	表明想要的数据类型没有信息 no message |
| ENOPROTOOPT | 表明给定的协议不可用。no protocol |
| ENOSPC | 表明该设备上没有可用的空间。 no space |
| ENOSR | 表明没有可用的流资源。 no source|stream? |
| ENOSTR |	表明给定的资源不是流。 not stream |
| ENOSYS | 表明功能没有被实现。|
| ENOTCONN | 表明 socket 没有连接。 not connect |
| ENOTDIR | 表明路径不是目录。 not dir |
| ENOTEMPTY | 表明目录是非空的。 not empty |
| ENOTSOCK | 表明给定的项目不是 socket。 not socket | 
| ENOTSUP | 表明给定的操作不受支持。 not support |
| ENOTTY | 表明一个不适当的 I/O 控制操作。|
| ENXIO | 表明没有该设备或地址。 |
| EOPNOTSUPP | 表明一个操作不被 socket 所支持。 尽管 ENOTSUP 和 EOPNOTSUPP 在 Linux 上有相同的值，但是根据 POSIX.1 规范，这些错误值应该不同。 operation  not support | 
| EOVERFLOW | 表明一个值太大以至于难以用给定的数据类型存储。 overflow |
| EPERM | 表明操作没有被许可。 error permit |
| EPIPE | 表明破裂的管道。 pipe break |
| EPROTO | 表明协议错误。 protocol  |
| EPROTONOSUPPORT | 表明一个协议不被支持。 protocol no support |
| EPROTOTYPE |	表明 socket 错误的协议类型。 protocol type |
| ERANGE | 表明结果太大了。 range |
| EROFS | 表明该文件系统是只读的。|
| ESPIPE | 表明无效的查询操作。 |
| ESRCH | 表明没有这样的进程。|
| ESTALE | 表明该文件处理是稳定的。 stable |
| ETIME | 表明一个过期的时钟。 |
| ETIMEDOUT | 表明该连接超时 |
| ETXTBSY | 表明一个文本文件处于忙碌。 txt busy |
| EWOULDBLOCK | 表明该操作被屏蔽。 would block |
| EXDEV | 表明一个不合适的链接。|