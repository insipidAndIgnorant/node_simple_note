# http2（HTTP/2）
http2 核心 API 在客户端和服务器之间比 http API 更加对称。 例如，大多数事件，比如 `'error'`、 `'connect'` 和 `'stream'`，都可以由客户端代码或服务器端代码触发。

## Http2Session 类
`http2.Http2Session` 类的实例代表了 HTTP/2 客户端与服务器之间的一个活跃的通信会话。 此类的实例不是由用户代码直接地构造。

每个 `Http2Session` 实例会有略有不同的行为，这取决于它是作为服务器还是客户端运行。 `http2session.type` 属性可用于判断 `Http2Session` 的运行模式。 在服务器端上，用户代码应该很少有机会直接与 `Http2Session` 对象一起使用，大多数操作通常是通过与 `Http2Server` 或 `Http2Stream` 对象的交互来进行的。

用户代码不会直接地创建 `Http2Session` 实例。 当接收到新的 HTTP/2 连接时，服务器端的 `Http2Session` 实例由 `Http2Server` 实例创建。 客户端的 `Http2Session` 实例是使用 `http2.connect()` 方法创建的。

### Http2Session 与 Socket
每个 `Http2Session` 实例在创建时都会与一个 `net.Socket` 或 `tls.TLSSocket` 关联。 当 `Socket` 或 `Http2Session` 被销毁时，两者都将会被销毁。

由于 HTTP/2 协议强加了特定的序列化和处理要求，因此不建议用户代码从绑定到 `Http2Session` 的 `Socket` 实例读取数据或向其写入数据。 这样做会使 HTTP/2 会话进入不确定的状态，从而导致会话和套接字变得不可用。

一旦将 `Socket` 绑定到 `Http2Session`，则用户代码应仅依赖于 `Http2Session` 的 API。

### **'close' 事件 () =>void**
一旦 `Http2Session` 被销毁，就会发出`'close'`事件。

### **'connect' 事件 (session:Http2Session, socket:net.Socket)=>void**
一旦 `Http2Session` 成功连接到远程,就会发出`'connect'`事件，并可能开始通信。用户代码通常不会直接监听此事件。

### **'error' 事件 (err)=>void**
在处理 `Http2Session` 期间发生错误时发出。

### **'frameError' 事件 (type:number,code:number,id:number)=>void**
* `type` `<integer>` 数据帧类型.
* `code` `<integer>` 错误码.
* `id` `<integer>` 流id（如果帧未与流关联，则为0）。

当试图在会话上发送帧时发生错误时，将发出`'frameError'`事件。如果无法发送的帧与特定的`Http2Stream`关联，则会尝试在`Http2Stream`上发出`'frameError'`事件。

如果`'frameError'`事件与stream关联，则stream将在`'frameError'`事件之后立即关闭并销毁。如果事件与流没有关联，`Http2Session`将在`'frameError'`事件之后立即关闭。

### **'goaway' 事件 (errcode:number,lastStreamId:number,opaqueData:Buffer):void**
当接收到`goaway`帧时，将发出`'goaway'`事件。

当发出`'goaway'`事件时，`Http2Session`实例将自动关闭。

补充： GOAWAY帧（类型= 0x7）用于启动连接关闭或发出严重错误状态信号。 GOAWAY允许端点正常停止接受新的流，同时仍然完成对先前建立的流的处理。GOAWAY包含在此连接中的发送端点上已处理或可能处理的最后一个peer-initiated流的流标识符。

### **'localSettings' 事件 (setting: [HTTP2.Settings](#http2-settings))**
当接收到确认设置帧时，将发出`'localSettings'`事件。

使用`http2session.settings()`提交新设置时，在发出`'localSettings'`事件之前修改的设置不会生效。
```js
session.settings({ enablePush: false });
session.on('localSettings', (settings) => {
  /* Use the new settings */
});
```
### **'ping' 事件 (payload:Buffer)=>void**
* `payload` `<Buffer>` 8位字节PING帧

每当从连接的远端收到ping帧时，就会发出`'ping'`事件。

### **'remoteSettings' 事件 (settings:[HTTP2.Settings](#http2-settings))=>void**
当从连接的远端接收到新的设置帧时，将发出'remoteSettings'事件。

### **'stream' 事件 (stream: ServerHttp2Stream, headers: IncomingHttpHeaders, flags: number) => void**
* `stream` `<Http2Stream>` 对流的引用
* `headers` `<HTTP/2 Headers Object>` http headers
* `flags` `<number>` 关联的数字标志
* `rawHeaders` `<string[]>` 一个数组，包含原始头名称，后跟它们各自的值。`['k1','v1','k2','v2'...]`

创建新`Http2Stream`时会发出`'stream'`事件。

在服务器端，用户代码通常不会直接侦听此事件，而是为分别由 `http2.createServer()` 和 `http2.createSecureServer()` 返回的`net.server`或`tls.server`实例发出的`'stream'`事件注册处理程序
```js
const http2 = require('http2');

// Create an unencrypted HTTP/2 server
const server = http2.createServer();

server.on('stream', (stream, headers) => {
  stream.respond({
    'content-type': 'text/html',
    ':status': 200
  });
  stream.on('error', (error) => console.error(error));
  stream.end('<h1>Hello World</h1>');
});

server.listen(80);
```
即使HTTP/2流和网络套接字不在1:1的对应关系中，网络错误也会破坏每个单独的流，必须在流级别进行处理，如上所示。

### **'timeout' 事件 ()=>void**
使用`http2session.setTimeout()`方法设置此`http2session`的超时时间之后，如果在配置的毫秒数之后`http2session`上没有活动，则会发出`'timeout'`事件。它的侦听器不需要任何参数。

### **http2session.alpnProtocol: string**
如果`Http2Session`尚未连接到套接字，则值未定义；如果`Http2Session`未连接到`TLSSocket`，则值为`h2c`；或者将返回已连接`TLSSocket`自己的`alpnProtocol`属性的值。

### **http2session.close(callback)**
优雅地关闭`Http2Session`，允许任何现有流自行完成，并阻止创建新的`Http2Stream`实例。一旦关闭，如果没有打开的`Http2Stream`实例，则可能会调用`http2session.destroy()`。

如果指定callback，回调函数将注册为`'close'`事件的处理程序。

### **http2session.closed: boolean**
如果此`Http2Session`实例已关闭，则为true，否则为false。

### **http2session.connecting:boolean**
如果此`Http2Session`实例仍在连接，则为true，在发出`connect`事件和/或调用`http2.connect`回调之前将设置为false。

### **http2session.destroy(error?: Error, code?: number): void**
* `error` `<Error>` 如果由于错误而销毁`Http2Session`，则为错误对象。
* `code` `<number>` 要在最终GOAWAY帧中发送的HTTP/2错误代码。如果未指定且错误未定义，则默认为`INTERNAL_ERROR`，否则默认为`NO_ERROR`。

立即终止`Http2Session`和关联的`net.Socket`或`tls.TLSSocket`。

一旦被销毁，`Http2Session`将发出`'close'`事件。如果错误未定义，则会在`'close'`事件之前立即发出`'error'`事件。

如果还有任何与`Http2Session`相关联的打开的`Http2Streams `，则这些流也将被销毁。

### **http2session.destroyed:boolean**
如果此`Http2Session`实例已被销毁且不能再使用，则为true，否则为false

### **http2session.encrypted:boolean**
如果`Http2Session`套接字尚未连接，则值未定义；如果`Http2Session`与`TLSSocket`连接，则值为true；如果`Http2Session`连接到任何其他类型的套接字或流，则值为false。

### **http2session.goaway(code?: number, lastStreamID?: number, opaqueData?: NodeJS.ArrayBufferView): void**
* `code` `<number>` 错误码  
* `lastStreamID` `<number>` 上次处理的`Http2Stream`的数字标识
* `opaqueData` `<Buffer> | <TypedArray> | <DataView>` `TypedArray`或`DataView`实例，包含要在GOAWAY框架内携带的附加数据。

在不关闭`Http2Session`的情况下将GOAWAY帧传输到连接的对等方。

### **http2session.localSettings: [HTTP2.Settings](#http2-settings)**
描述此`Http2Session`当前本地设置的无原型对象。`localSettings`是此`Http2Session`实例的本地设置。

### **http2session.originSet: string[]**
如果`Http2Session`连接到`TLSSocket`，`originSet`属性将返回一个数组

`originSet`属性仅在使用安全TLS连接时可用。

### **http2session.pendingSettingsAck:boolean**
指示`Http2Session`当前是否正在等待已发送`SETTINGS`帧的确认。调用`http2session.settings()`方法后将为true。确认所有发送的`SETTINGS`帧后将为false。



<br/><br/><br/>

## <span id="http2-settings">HTP2 Settings 设置对象</span>
```ts
interface Settings {
    headerTableSize?: number;
    enablePush?: boolean;
    initialWindowSize?: number;
    maxFrameSize?: number;
    maxConcurrentStreams?: number;
    maxHeaderListSize?: number;
    enableConnectProtocol?: boolean;
}
```
`http2.getDefaultSettings()`、`http2.getPackedSettings()`、`http2.createServer()`、`http2.createSecureServer()`、`http2session.settings()`、`http2session.localSettings`和`http2session.remoteSettings` API返回或接收为定义`http2session`对象的配置设置的对象的输入。这些对象是包含以下属性的普通JavaScript对象。
* `headerTableSize` `<number>` 指定用于头压缩的最大字节数。允许的最小值为0。最大允许值为`pow(2,32)-1`。默认值：4096个八位字节。
* `enablePush` `<boolean>` 指定在`Http2Session`实例上是否允许HTTP/2 push流为true。默认值：true。
* `initialWindowSize` `<number>` Specifies the *senders* initial window size for stream-level flow control.指定流级流控制的发件人初始窗口大小。允许的最小值为0。最大允许值为`pow(2,32)-1`。默认值：65535字节。
* `maxFrameSize` `<number>` 指定最大帧负载的大小。最小允许值为16384。最大允许值为`pow(2,24)-1`。默认值：16384字节。
* `maxConcurrentStreams` `<number>` 指定`Http2Session`上允许的最大并发流数。没有默认值，这意味着，至少在理论上，在http2会话中，`pow(2,24)-1`流可以在任何给定时间同时打开。最小值为0。最大允许值为`pow(2,24)-1`。默认值：4294967295。
* `maxHeaderListSize` `<number>` 指定将接受的头列表的最大大小（未压缩的八位字节）。允许的最小值为0。最大允许值为`pow(2,24)-1`。默认值：65535。
* `enableConnectProtocol` `<boolean>` 如果要启用RFC 8441定义的"Extended Connect Protocol，则指定true。只有由服务器发送时，此设置才有意义。一旦为给定的`Http2Session`启用了`enableConnectProtocol`设置，就不能将其禁用。默认值：false。

将忽略设置对象上的所有其他属性。