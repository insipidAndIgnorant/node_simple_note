# Node.js 当前支持的字符编码有：

* 'ascii': 仅适用于 7 位 ASCII 数据。此编码速度很快，如果设置则会剥离高位。

* 'utf8': 多字节编码的 Unicode 字符。许多网页和其他文档格式都使用 UTF-8。

* 'utf16le': 2 或 4 个字节，小端序编码的 Unicode 字符。支持代理对（U+10000 至 U+10FFFF）。

* 'ucs2': 'utf16le' 的别名。

* 'base64': Base64 编码。当从字符串创建 Buffer 时，此编码也会正确地接受 RFC 4648 第 5 节中指定的 “URL 和文件名安全字母”。

* 'latin1': 一种将 Buffer 编码成单字节编码字符串的方法（由 RFC 1345 中的 IANA 定义，第 63 页，作为 Latin-1 的补充块和 C0/C1 控制码）。

* 'binary': 'latin1' 的别名。

* 'hex': 将每个字节编码成两个十六进制的字符。




### **server.getConnections((error, count: number) => void)**
异步获取服务器的当前并发连接数。当 `socket` 被传递给子进程时工作。

### **server.listen()**
启动一个服务器来监听连接。 `net.Server` 可以是 TCP 或 IPC 服务器，具体取决于它监听的内容。

这个函数是异步的。当服务器开始监听时，会触发 `'listening'` 事件。 最后一个参数 `callback` 将被添加为 `'listening'` 事件的监听器。

所有的 `listen()` 方法都可以使用一个 `backlog` 参数来指定待连接队列的最大长度。 实际的长度将由操作系统的 `sysctl` 设置决定，例如 Linux 上的 `tcp_max_syn_backlog` 和 `somaxconn`。 此参数的默认值是 511 (不是512）。

所有的 `net.Socket` 都被设置为 `SO_REUSEADDR`

当且仅当上次调用 `server.listen()` 发生错误或已经调用 `server.close()` 时，才能再次调用 `server.listen()` 方法。否则将抛出 `ERR_SERVER_ALREADY_LISTEN` 错误。

监听时最常见的错误之一是 `EADDRINUSE`。 这是因为另一个服务器已正在监听请求的 `port/path/handle`。 处理此问题的一种方法是在一段时间后重试：


### **server.listen(handle: any, backlog?: number, listeningListener?: () => void):this**
启动一个服务器，监听已经绑定到端口、Unix 域套接字或 Windows 命名管道的给定 `handle` 上的连接。

`handle` 对象可以是服务器、套接字（任何具有底层 `_handle` 成员的东西），也可以是具有 `fd` 成员的对象，该成员是一个有效的文件描述符。

*在 Windows 上不支持在文件描述符上进行监听。*

### **server.listen(options: ListenOptions, listeningListener?: () => void):this**
* `options`
  * port <number>
  * host <string>