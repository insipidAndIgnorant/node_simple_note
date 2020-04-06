
# 【 dgram.Socket 类 】
继承自: [EventEmitter]()  
dgram(datagram)数据报

## dgram.Socket 事件;

### 'close' 事件
    'close' 事件将在使用 close() 关闭一个 socket 之后触发。 该事件一旦触发，则这个 socket 上将不会触发新的 'message' 事件。

### 'connect' 事件
    因 connect() 调用成功而使 socket 与远程地址关联之后，则会触发 'connect' 事件。

### 'error' 事件
    当有任何错误发生时， 'error' 事件将被触发

### 'listening' 事件
    当一个 socket 开始监听数据包信息时， 'listening' 事件将被触发。 该事件会在创建 UDP socket 之后被立即触发

### 'message' 事件
    当有新的数据包被 socket 接收时， 'message' 事件会被触发。msg 和 rinfo 会作为参数传递到该事件的处理函数  
    rinfo: {  
        address: string; // 发送方地址   
        family: string; // 地址类型 ('IPv4' 或 'IPv6')  
        port: number; // 端口  
        size:number // 消息大小   
    }
  
## dgram.Socket propety && method;

### socket.addSourceSpecificMembership(sourceAddress: string, groupAddress: string, multicastInterface?: string): void;
    告诉内核在给定的源地址和组地址处加入特定于源的多播通道,使用带有IP_ADD_SOURCE_MEMBERSHIP 这个 socket 选项的多播接口
    如果未指定multicast terface参数,则操作系统将选择一个接口并向其添加成员
    要向每个可用接口添加成员，请多次调用socket.addSourceSpecificMembership()，每个接口一次。

### socket.address(): { address: string;family: string; port: number; }
    返回一个包含 socket 地址信息的对象 对于 UDP socket，该对象将包含 address、 family 和 port 属性

### socket.bind(port?: number, address?: string, callback?: () => void): void;
    对于 UDP socket，该方法会令 dgram.Socket 在指定的 port 和可选的 address 上监听数据包信息。 若 port 未指定或为 0，操作系统会尝试绑定一个随机的端口。 若 address 未指定，操作系统会尝试在所有地址上监听。绑定完成时会触发一个 'listening' 事件，并会调用 callback 方法。

    一个被绑定的数据包 socket 会令 Node.js 进程保持运行以接收数据包信息

    在配合 cluster 模块使用 dgram.Socket 对象时， options 对象可能包含一个附加的 exclusive 属性
### socket.bind(options: BindOptions, callback?: () => void): void;
    BindOptions: {
        port?: number;
        address?: string;
        exclusive?: boolean;
        fd?: number;
    }
    对于 UDP socket，该方法会令 dgram.Socket 在指定的 port 和可选的 address 上监听数据包信息。
    options 对象可能包含 fd 属性.当设置大于 0 的 fd 时，它将会使用给定的文件描述符封装一个现有的 socket。在这种情况下， port 和 address 的属性将会忽略。

    在配合 cluster 模块使用 dgram.Socket 对象时， options 对象可能包含一个附加的 exclusive 属性。当 exclusive 被设为 false（默认值）时。集群工作进程会使用相同的 socket 句柄来共享连接处理作业。当 exclusive 被设为 true 时，该句柄将不会被共享，而尝试共享端口则会造成错误
### socket.close(callback?: () => void): void;
    关闭该 socket 并停止监听其上的数据。 如果提供了一个回调函数，它就相当于为 'close' 事件添加了一个监听器。
### socket.connect(port: number, address?: string, callback?: () => void): void;
    为 dgram.Socket 关联一个远程地址和端口。这个 socket 句柄发送的任何消息都会被发送到关联的远程地址。而且，这个套接字会只接受来自那个远程同类的消息。会导致一个 ERR_SOCKET_DGRAM_IS_CONNECTED 异常。如果没有提供 address，会默认用 '127.0.0.1'（适用于 udp4 套接字）或者 '::1'（适用于 udp6 套接字）。一旦连接完成，一个 'connect' 会触发，并且可选的 callback 也会被调用。 为了防止失败，这个 callback 被调用或者调用失败触发一个 'error' 事件。
### socket.disconnect(): void;
    一个将相连的 dgram.Socket 与远程地址断掉的同步函数。 在一个已经未连接的 socket 上尝试调用 disconnect() 会导致一个 ERR_SOCKET_DGRAM_NOT_CONNECTED 异常
### socket.dropMembership(multicastAddress: string, multicastInterface?: string): void;
    引导内核通过 IP_DROP_MEMBERSHIP 这个 socket 选项删除 multicastAddress 指定的多路传送集合。当 socket 被关闭或进程被终止时，该方法会被内核自动调用，所以大多数的应用都不用自行调用该方法。若 multicastInterface 未指定，操作系统会尝试删除所有可用接口上的成员。
### socket.dropSourceSpecificMembership(sourceAddress: string, groupAddress: string, multicastInterface?: string): void;
    与socket.addSourceSpecificMembership对应， 删除多播通道。
    如果未指定多播接口，则操作系统将尝试删除所有有效接口上的成员身份。
### socket.getRecvBufferSize(): number
    返回 SO_RCVBUF socket 接收到的 buffer 的大小，以字节为单位。
### socket.getSendBufferSize(): number
    返回 SO_RCVBUF socket 发送的 buffer 的大小，以字节为单位。
### socket.ref(): this
    默认情况下，绑定一个 socket 会在 socket 运行时阻止 Node.js 进程退出。socket.unref() 方法用于将 socket 从维持 Node.js 进程的引用列表中解除。 socket.ref() 方法用于将 socket 重新添加到这个引用列表中，并恢复其默认行为。
    多次调用 socket.ref() 不会有额外的作用。
### socket.remoteAddress()：AddressInfo
    返回包含远端的address、family和port的对象。如果套接字未连接，则抛出ERR_SOCKET_DGRAM_NOT_CONNECTED异常。
### socket.send(msg: string | Uint8Array, offset: number, length: number, port?: number, callback?: (error: Error | null, bytes: number) => void): void;
* msg: Buffer | Uint8Array | string | Array 要发送的消息。
* offset: integer 指定消息的开头在 buffer 中的偏移量。
* length: integer 消息的字节数。
* port: integer 目标端口。
* address: string 目标主机名或 IP 地址。
* callback: Function 当消息被发送时回调。  

    在 socket 上广播一个数据包。 对于无连接的 socket，必须指定目标的 port 和 address。 对于连接的 socket，则将会使用其关联的远程端点，因此不能设置 port 和 address 参数。

    msg 参数包含了要发送的消息。 根据消息的类型可以有不同的做法。 如果 msg 是一个 Buffer 或 Uint8Array，则 offset 和 length 指定了消息在 Buffer 中对应的偏移量和字节数。 如果 msg 是一个String，那么它会被自动地按照 'utf8' 编码转换为 Buffer。 对于包含了多字节字符的消息， offset 和 length 会根据对应的字节长度进行计算，而不是根据字符的位置。 如果 msg 是一个数组，那么 offset 和 length 必须都不能被指定。

    address 参数是一个字符串。 若 address 的值是一个主机名，则 DNS 会被用来解析主机的地址。默认值127.0.0.1(udp4)或::1(udp6)
    若在之前 socket 未通过调用 bind 方法进行绑定，socket 将会被一个随机的端口号赋值并绑定到“所有接口”的地址上（对于 udp4 socket 是 '0.0.0.0'，对于 udp6 socket 是 '::0'）。

    可以指定一个可选的 callback 方法来汇报 DNS 错误或判断可以安全地重用 buf 对象的时机。 在 Node.js 事件循环中，DNS 查询会对发送造成至少一个时间点的延迟。

    确定数据包被发送的唯一方式就是指定 callback。 若 callback 未被指定，该错误会以 'error' 事件的方式投射到 socket 对象上。

    偏移量和长度是可选的，但如其中一个被指定则另一个也必须被指定。 另外，它们只在第一个参数是 Buffer 或 Uint8Array 的情况下才能被使用。

    > 关于 UDP 数据报大小的说明  
    > IPv4/v6 数据包的最大尺寸取决于 MTU(Maximum Transmission Unit，最大传输单元)与 Payload Length 字段大小。
    * Payload Length 字段有 16 位 宽，指一个超过 64K 的包含 IP 头部和数据的负载 (65,507 字节 = 65,535 − 8 字节 UDP 头 − 20 字节 IP 头)。 通常对于环回地址来说是这样，但这个长度的数据包对于大多数的主机和网络来说不切实际
    * MTU 指的是数据链路层为数据包提供的最大大小。 对于任意链路， IPv4 所托管的 MTU 最小为 68 个字节，推荐为 576（典型地，作为拨号上网应用的推荐值），无论它们是完整地还是分块地抵达。
    > 对于 IPv6， MTU 的最小值是 1280 个字节，然而，受托管的最小的碎片重组缓冲大小为 1500 个字节。 现今大多数的数据链路层技术（如以太网），都有 1500 的 MTU 最小值，因而 68 个字节显得非常小。  
    **要提前知道数据包可能经过的每个链路的 MTU 是不可能的。 发送大于接受者 MTU 大小的数据包将不会起作用，因为数据包会被静默地丢失，而不会通知发送者该包未抵达目的地**

### socket.setBroadcast(flag: boolean): void
    设置或清除 SO_BROADCAST socket 选项。 当设置为 true, UDP 包可能会被发送到一个本地接口的广播地址。
### socket.setMulticastInterface(multicastInterface: string): void
~~网络知识不足，也看不懂机翻...~~

    All references to scope in this section are referring to IPv6 Zone Indices, which are defined by RFC 4007. In string form, an IP with a scope index is written as 'IP%scope' where scope is an interface name or interface number.

    Sets the default outgoing multicast interface of the socket to a chosen interface or back to system interface selection. The multicastInterface must be a valid string representation of an IP from the socket's family.

    For IPv4 sockets, this should be the IP configured for the desired physical interface. All packets sent to multicast on the socket will be sent on the interface determined by the most recent successful use of this call.

    For IPv6 sockets, multicastInterface should include a scope to indicate the interface as in the examples that follow. In IPv6, individual send calls can also use explicit scope in addresses, so only packets sent to a multicast address without specifying an explicit scope are affected by the most recent successful use of this call.

```js
// IPv6 发送多播数据包
// on most system
const socket = dgram.createSocket('udp6');

socket.bind(1234, () => {
  socket.setMulticastInterface('::%eth1');
});
// on windows
const socket = dgram.createSocket('udp6');

socket.bind(1234, () => {
  socket.setMulticastInterface('::%2');
});

// IPv4 发送多播数据包
// all system
const socket = dgram.createSocket('udp4');

socket.bind(1234, () => {
  socket.setMulticastInterface('10.0.0.2');
});
```
### socket.setMulticastLoopback(flag: boolean): void
    设置或清除 IP_MULTICAST_LOOP socket 选项。当设置为 true, 多播数据包也将在本地接口接收。

### socket.setMulticastTTL(ttl: number): void;
    设置 IP_MULTICAST_TTL 套接字选项。一般来说，TTL 表示"生存时间"。 这里特指一个 IP 数据包传输时允许的最大跳步数，尤其是对多播传输。当 IP 数据包每向前经过一个路由或网关时，TTL 值减 1，若经过某个路由时，TTL 值被减至 0，便不再继续向前传输。

    ttl 参数可以是 0 到 255 之间。 在大多数系统上，默认值是 1。

### socket.setRecvBufferSize(size: number)
    设置 SO_RCVBUF socket 选项。 设置 socket 接收 buffer 的最大值，以字节为单位。

### socket.setSendBufferSize(size: number)
    设置 SO_SNDBUF socket 选项。 设置 socket 发送 buffer 的最大值，以字节为单位。

### socket.setTTL(ttl: number)
    设置 IP_TTL 套接字选项。一般为了进行网络情况嗅探或者多播而修改 TTL 值

### socket.unref()
    默认情况下，只要 socket 是打开的，绑定一个 socket 将导致它阻塞 Node.js 进程退出。 使用 socket.unref() 方法可以从保持 Node.js 进程活动的引用计数中排除 socket，从而允许进程退出，尽管这个 socket 仍然在侦听。


## dgram模块函数

### createSocket(options: SocketOptions, callback?: (msg: Buffer, rinfo: RemoteInfo) => void): Socket;
    interface SocketOptions {
        type: SocketType; // 'udp4' | 'udp6'
        reuseAddr?: boolean; // 若设置为 true，则 socket.bind() 会重用地址，即使另一个进程已经在其上面绑定了一个套接字。

        // default false
        ipv6Only?: boolean; // 将 ipv6Only 设置为 true 将会禁用双栈支持，即绑定到地址 :: 不会使 0.0.0.0 绑定。
        recvBufferSize?: number; // 设置 SO_RCVBUF 套接字值
        sendBufferSize?: number; // 设置 SO_SNDBUF 套接字值。
        lookup?: (hostname: string, options: dns.LookupOneOptions, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => void; // 自定义的查询函数。默认值: dns.lookup()。
    }

    创建一个 dgram.Socket 对象。 一旦创建了套接字，调用 socket.bind() 会指示套接字开始监听数据报消息。如果 address 和 port 没传给  socket.bind()，那么这个方法会把这个套接字绑定到 "全部接口" 地址的一个随机端口




### createSocket(type: 'udp4' | 'udp6', callback?: (msg: Buffer, rinfo: RemoteInfo) => void): Socket;
    callback 为 'message' 事件添加一个监听器。其余类似createSocket(options)

