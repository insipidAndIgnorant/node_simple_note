# http2（HTTP/2）
http2 核心 API 在客户端和服务器之间比 http API 更加对称。 例如，大多数事件，比如 `'error'`、 `'connect'` 和 `'stream'`，都可以由客户端代码或服务器端代码触发。

补充: [HTTP/2 详解](https://www.jianshu.com/p/e57ca4fec26f).

## Http2Session 类
`http2.Http2Session` 类的实例代表了 HTTP/2 客户端与服务器之间的一个活跃的通信会话。 此类的实例不是由用户代码直接地构造。

每个 `Http2Session` 实例会有略有不同的行为，这取决于它是作为服务器还是客户端运行。 `http2session.type` 属性可用于判断 `Http2Session` 的运行模式。 在服务器端上，用户代码应该很少有机会直接与 `Http2Session` 对象一起使用，大多数操作通常是通过与 `Http2Server` 或 `Http2Stream` 对象的交互来进行的。

用户代码不会直接地创建 `Http2Session` 实例。 当接收到新的 HTTP/2 连接时，服务器端的 `Http2Session` 实例由 `Http2Server` 实例创建。 客户端的 `Http2Session` 实例是使用 `http2.connect()` 方法创建的。

### <span id="http2andsockets">Http2Session 与 Socket</span>
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

### **http2session.ping(payload?: NodeJS.ArrayBufferView, callback: (err, duration: number, payload: Buffer) => void):boolean**
向连接的HTTP/2对等方发送PING帧。必须提供回调函数。如果发送了PING，方法将返回true，否则返回false。

最大未完成（未确认）ping数由`maxOutstandings`配置选项确定。默认最大值为10。

如果提供了`payload`，则`payload`必须是一个`Buffer`、`TypedArray`或`DataView`，其中包含8字节的数据，这些数据将随PING一起传输，并随PING确认一起返回。

`callback`提供三个参数：一个错误参数（如果成功确认PING，则该参数将为空）、一个持续时间参数（报告发送PING和接收确认后经过的毫秒数）和一个包含8字节PING负载的`Buffer`。

如果未指定`payload`参数，则默认的`payload`将是标记PING持续时间开始的64位时间戳。

### **http2session.ref()**
在此`Http2Session`实例的基础套接字上调用`ref()`。

### **http2session.remoteSettings:[HTTP2.Settings](#http2-settings)**
描述`Http2session`当前远程设置的无原型对象。`remoteSettings`由连接的HTTP/2对等方设置。

### **http2session.setTimeout(msecs: number, callback?: () => void): void**
用于设置回调函数，当`Http2Session`在`msecs`毫秒后没有活动时调用该函数。给定的回调注册为`'timeout'`事件的侦听器。

### **http2session.socket:net.Socket | tls.TLSSocket**
返回一个代理对象，该对象行为于`net.Socket`（或`tls.TLSSocket`）相似，但将可用方法限制为可安全用于HTTP/2的方法。

`destroy`、`emit`、`end`、`pause`、`read`、`resume`和`write`将抛出一个错误，错误代码为`ERR_HTTP2_NO_SOCKET_MANIPULATION`。有关更多信息，请参阅[Http2Session和Sockets](#http2andsockets)。

所有其他交互将直接路由到套接字。All other interactions will be routed directly to the socket.

### **http2session.state:SessionState**
```ts
interface SessionState {
    effectiveLocalWindowSize?: number; // http2会话的当前本地（接收）流控制窗口大小。 //见http2 流量控制
    effectiveRecvDataLength?: number; // 自上次流控制窗口（WINDOW_UPDATE SETTINGS帧）更新以来已接收的当前字节数。
    nextStreamID?: number; // 此Http2Session下次创建新Http2Stream时要使用的数字标识符 // 见http2 多路流
    localWindowSize?: number; // 远程对等方在不接收WINDOW_UPDATE的情况下可以发送的字节数。
    lastProcStreamID?: number; // 最近收到HEADERS或DATA帧的Http2Stream的数字标识。
    remoteWindowSize?: number; // 此Http2Session在不接收WINDOW_UPDATE的情况下可能发送的字节数
    outboundQueueSize?: number; // 此Http2Session的出站队列中当前的帧数。
    deflateDynamicTableSize?: number; // 出站头压缩状态表的当前大小（字节）。 // 见 http2 headers HPACK压缩算法
    inflateDynamicTableSize?: number; // 入站头压缩状态表的当前大小（字节）。
}
```

### **http2session.settings(settings: [HTTP2.Settings](#http2-settings)): void**
更新此`Http2Session`的当前本地设置，并向连接的HTTP/2对等方发送新的SETTINGS帧。

一旦调用，当会话等待远程对等方确认新设置时，`http2session.pendingSettingsAck`属性将为true。

在收到设置确认并发出`'localSettings'`事件之前，新设置将不会生效。在确认仍处于挂起状态时，可以发送多个SETTINGS帧。

### **http2session.type:number**
如果此`http2 SESSION`实例是服务器，则`http2session.type`将等于`http2.constants.NGHTTP2_SESSION_SERVER`；如果实例是客户端，则`http2.constants.NGHTTP2_SESSION_CLIENT`。

### **http2session.unref()**
在此`Http2Session`实例的基础套接字上调用`unref()`。

<br/><br/><br/>


## ServerHttp2Session 类
继承于 `Http2Session`

### **serverhttp2session.altsvc(alt: string, originOrStream: number | string | url.URL | {origin: number | string | url.URL}): void**
* `alt` &nbsp;&nbsp; `RFC 7838`定义的替代服务配置的描述
* `originOrStream` &nbsp;&nbsp; 指定源（或具有源属性的对象）的URL字符串或由`Http2Stream.id`属性给定的active `Http2Stream`的数字标识符。

example: 向连接的客户端提交ALTSVC帧（由RFC 7838定义）。
```js
const http2 = require('http2');

const server = http2.createServer();
server.on('session', (session) => {
  // Set altsvc for origin https://example.org:80
  session.altsvc('h2=":8000"', 'https://example.org:80');
});

server.on('stream', (stream) => {
  // Set altsvc for a specific stream
  stream.session.altsvc('h2=":8000"', stream.id);
});
```
发送具有特定流ID的ALTSVC帧表示备用服务与给定`Http2Stream`的源关联。

`alt`和`origin`字符串只能包含ASCII字节，并严格解释为ASCII字节序列。可以传递特殊值`'clear'`，以清除给定域以前设置的任何替代服务。

当为`originOrStream`参数传递一个字符串时，它将被解析为一个URL并派生出源。例如，`'https://example.org/foo/bar'`的来源是ASCII字符串`'https://example.org'`。如果给定的字符串不能被解析为URL，或者无法派生有效的源，则将引发错误。

URL对象或具有`origin`属性的任何对象都可以作为`originOrStream`传递，在这种情况下，将使用`origin`属性的值。`origin`属性的值必须是正确序列化的ASCII origin。

#### 指定备选服务器
`alt`参数的格式由RFC 7838严格定义为一个ASCII字符串，其中包含与特定主机和端口关联的“可选(alternative)”协议的逗号分隔列表。

例如，值`'h2="example.org:81"'`表示HTTP/2协议在TCP/IP端口81上的主机`'example.org'`”上可用。主机和端口必须包含在引号（`"`）字符内。

可以指定多个备选方案，例如：`h2="example.org:81"`，`h2="：82"`。

协议标识符（示例中的`'h2'`）可以是任何有效的ALPN协议ID。(如`'h2c'`)

Node.js不验证这些值的语法，而是按照用户提供的或从对等方接收的方式传递这些值。

### **serverhttp2session.origin(...args: Array<string | url.URL | { origin: string }>): void**
向连接的客户机提交一个ORIGIN帧（由RFC 8336定义），以公布服务器能够提供权威响应的源集。
```js
const http2 = require('http2');
const options = getSecureOptionsSomehow();
const server = http2.createSecureServer(options);
server.on('stream', (stream) => {
  stream.respond();
  stream.end('ok');
});
server.on('session', (session) => {
  session.origin('https://example.com', 'https://example.org');
});
```
字符串会类似`originOrStream`一样被解析

在使用`http2.createSecureServer()`方法创建新的HTTP/2服务器时，可以使用`origins`选项
```js
const http2 = require('http2');
const options = getSecureOptionsSomehow();
options.origins = ['https://example.com', 'https://example.org'];
const server = http2.createSecureServer(options);
server.on('stream', (stream) => {
  stream.respond();
  stream.end('ok');
});
```
<br/><br/><br/>



## ClientHttp2Session 类
继承自`Http2Session`

### **'altsvc' 事件 (alt: string, origin: string, stream: number) => void**
每当客户端接收到ALTSVC帧时，就会发出`'altsvc'`事件。事件是用ALTSVC值、`origin`和流ID发出的。如果ALTSVC帧中没有提供原点，则`origin`将是空字符串。
```js
const http2 = require('http2');
const client = http2.connect('https://example.org');

client.on('altsvc', (alt, origin, streamId) => {
  console.log(alt);
  console.log(origin);
  console.log(streamId);
});
```
### **'origin' 事件 (origins: string[]) => void**
每当客户端接收到ORIGIN帧时，就会发出`'origin'`事件。事件是由一个原始字符串数组发出的。将更新`http2session.originSet`以包含接收的源。*`'origin'`事件仅在使用安全TLS连接时发出。*
```js
const http2 = require('http2');
const client = http2.connect('https://example.org');

client.on('origin', (origins) => {
  for (let n = 0; n < origins.length; n++)
    console.log(origins[n]);
});
```

### **clienthttp2session.request(headers?: OutgoingHttpHeaders, options?: ClientSessionRequestOptions): ClientHttp2Stream**
* `headers` &nbsp;&nbsp; `[header: string]: number | string | string[] | undefined` &nbsp;&nbsp; 
* `options`
  * `endStream` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 如果 `Http2Stream` 可写端初始应该被关闭（例如，当发送不应期望有效载荷主体的 GET 请求时），则为 true。
  * `exclusive` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 当为 true 且 `parent` 标识一个父流时，则会使创建的流成为父流的唯一直接的依赖，而所有其他现有的依赖会成为新创建的流的依赖。 默认值: false。// 见 http2 依赖流
  * `parent` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 指定新创建的流所依赖的流的数字标识符。
  * `weight` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 指定流相对于具有相同 `parent` 的其他流的相对依赖性。 该值是一个介于 1 到 256（含）之间的数字。
  * `waitForTrailers` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 当为 true 时，在发送完最后的 DATA 帧之后， `Http2Stream` 将会触发 `'wantTrailers'` 事件。

仅用于 HTTP/2 客户端的 `Http2Session` 实例， `http2session.request()` 会创建并返回一个 `Http2Stream` 实例，该实例可用于将 HTTP/2 请求发送到连接的服务器。仅当 `http2session.type` 等于 `http2.constants.NGHTTP2_SESSION_CLIENT` 时，此方法才可用。
```js
const http2 = require('http2');
const clientSession = http2.connect('https://localhost:1234');
const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS
} = http2.constants;

const req = clientSession.request({ [HTTP2_HEADER_PATH]: '/' });
req.on('response', (headers) => {
  console.log(headers[HTTP2_HEADER_STATUS]);
  req.on('data', (chunk) => { /* .. */ });
  req.on('end', () => { /* .. */ });
});
```
当设置了 `options.waitForTrailers` 选项时，在排队要发送的最后一块有效载荷数据之后，会立即触发 `'wantTrailers'` 事件。 然后可以调用 `http2stream.sendTrailers()` 方法将尾部消息头发送到对等方。

当设置了 `options.waitForTrailers` 时，在发送最终的 DATA 帧时 `Http2Stream` 将不会自动地关闭。 用户代码必须调用 `http2stream.sendTrailers()` 或 `http2stream.close()` 来关闭 Http2Stream。

`headers` 中未指定 `:method` 和 `:path` 伪消息头，它们分别默认为：
* `:method` = `'GET'`
* `:path` = `/`

<br/><br/><br/>




## Http2Stream 类
扩展双工流

`Http2Stream`类的每个实例表示`Http2Session`实例上的双向HTTP/2通信流。任何一个`Http2Session`在其生命周期中可能有多达`pow(2,31)-1` 个 `http2stream`实例。

用户代码不会直接构造`Http2Stream`实例。相反，它们是通过`Http2Session`实例创建、管理和提供给用户代码的。在服务器上，`Http2Stream`实例是响应传入的HTTP请求（并通过`'stream'`事件传递给用户代码）或响应对`Http2Stream.pushStream()`方法的调用而创建的。在客户端上，当调用`http2session.request()`方法或响应传入的`'push'`事件时，将创建并返回`Http2Stream`实例。

`Http2Stream`类是`ServerHttp2Stream`和`clientthtpp2stream`类的基础，它们分别由服务器端或客户端专门使用。

所有`Http2Stream`实例都是双工流。双工的可写侧用于向连接的对等端发送数据，而可读侧用于接收连接的对等端发送的数据。

### Http2Stream 的生命周期
#### created 
在服务器端，在以下情况下创建`ServerHttp2Stream`的实例：
* 接收到具有先前未使用的流ID的新HTTP/2头帧
* 调用`http2stream.pushStream()`方法

在客户端，调用`http2session.request()`方法时会创建`clienthtp2stream`的实例。

在客户端上，如果尚未完全建立父`http2session`，则`http2session.request()`返回的`Http2Stream`实例可能无法立即准备好使用。在这种情况下，`Http2Stream`上调用的操作将被缓冲，直到发出`'ready'`事件。用户代码应该很少需要直接处理`'ready'`事件。可以通过检查`Http2Stream.id`的值来确定`Http2Stream`的就绪状态。如果该值未定义，则流尚未准备好使用。

#### destroyed 
所有`Http2Stream`实例都将在以下情况下被销毁：
* 连接的对等方接收到流的RST_STREAM帧，并且已读取挂起的数据。 // http2 RES_STREAM:优雅的关闭流
* 调用`http2stream.close()`方法，并且已读取挂起的数据。
* 调用`http2stream.destroy()`或`http2session.destroy()`方法。 // 流与session关联

当`Http2Stream`实例被破坏时，将尝试向连接的对等方发送RST_STREAM帧。

当`Http2Stream`实例被销毁时，将发出`'close'`事件。因为`Http2Stream`是`stream.Duplex`的实例，所以如果流数据当前正在流动，也会发出`'end'`事件。如果调用`http2stream.destroy()`时将错误作为第一个参数传递，则也可能发出`'error'`事件。

`Http2Stream`被销毁后，`Http2Stream.destroyed`属性将为true，`Http2Stream.rstCode`属性将指定RST_STREAM错误代码。`Http2Stream`实例在销毁后不再可用。

### **'aborted' 事件 () => void**
每当`Http2Stream`实例在中间通信中异常中止时，就会发出`'aborted'`事件。它的侦听器不需要任何参数。

只有在`Http2Stream`可写端尚未结束时，才会发出`'aborted'`事件。

### **'close' 事件 () => void**
`Http2Stream`被销毁时会发出`'close'`事件。一旦发出此事件，`Http2Stream`实例将不再可用。

关闭流时使用的HTTP/2错误代码可以使用`http2stream.rstCode`属性检索。如果代码是NGHTTP2_NO_ERROR以外的任何值，则还将发出`'error'`事件。

### **'error' 事件 (err)=>void**
`'error'`事件在处理Http2Stream期间发生错误时发出。

### **'frameError' 事件 (frameType: number, errorCode: number) => void**
当尝试发送帧时发生错误时，将发出`'frameError'`事件。调用时，处理函数将接收一个标识帧类型的整型参数和一个标识错误代码的整型参数。`Http2Stream`实例将在发出`'frameError'`事件后立即被销毁。

### **'timeout' 事件 () => void**
在使用`Http2Stream.setTimeout()`设置的毫秒数内未收到此`Http2Stream`的活动后，将发出`'timeout'`事件。它的侦听器不需要任何参数。

### **'trailers' 事件 (trailers: IncomingHttpHeaders, flags: number) => void**
* `trailers` &nbsp;&nbsp; `<HTTP/2 Headers Object>` &nbsp;&nbsp; 如 `:method`
* `flags` `<number>` 关联的数字标志

当接收到与尾部头字段关联的头块时，将发出`'trailers'`事件。侦听器回调被传递给`HTTP/2 Headers`对象和与这些`Headers`关联的标志。

如果在接收`'trailers'`之前调用`http2stream.end()`，并且未读取或侦听传入数据，则可能不会发出此事件。
```js
stream.on('trailers', (headers, flags) => {
  console.log(headers);
});
```
### **'wantTrailers' 事件  () => void**
当`Http2Stream`将要发送最终DATA帧，并且`Http2Stream`准备发送尾部头时，会发出`'wantTrailers'`事件。启动请求或响应时，必须设置`waitForTrailers`选项才能发出此事件。

### **http2stream.aborted: boolean**
如果Http2Stream实例异常中止，则设置为true。设置后，将发出'aborted'事件

### **http2stream.bufferSize: number**
此属性显示当前写入的缓冲字符数

### **http2stream.close(code?: number, callback?: () => void): void**
* `code` &nbsp;&nbsp; 标识错误代码的无符号32位整数。默认`http2.constants.NGHTTP2_NO_ERROR (0x00)`
* `callback` &nbsp;&nbsp; 可选的close监听函数

通过向连接的HTTP/2对等方发送`RST_STREAM`帧来关闭`Http2Stream`实例。

### **http2stream.closed: boolean**
如果`Http2Stream`实例已关闭，则设置为true。

### **http2stream.destroyed: boolean**
如果`Http2Stream`实例已被销毁且不再可用，则设置为true。

### **http2stream.endAfterHeaders: boolean**
如果在接收到的请求或响应头帧中设置了`END_STREAM`标志，则设置为true，表示不应接收额外数据，并且将关闭`Http2Stream`的可读侧。

### **http2stream.id: number**
此`Http2Stream`实例的数字流标识符。如果流标识符尚未分配，则设置为`undefined`。

### **http2stream.pending: boolean**
如果尚未为`Http2Stream`实例分配id，则设置为true。

### **http2stream.priority(options: StreamPriorityOptions)**
* `options`
  * `exclusive?` &nbsp;&nbsp; `boolean` 当为true且`parent`标识父流时，此流将成为父流的唯一直接依赖项，而所有其他现有依赖项将成为此流的依赖项。默认值：false。
  * `parent?` &nbsp;&nbsp; `number` 指定此流所依赖的流的数字标识符。
  * `weight?` &nbsp;&nbsp; `number` 指定流相对于具有相同父级的其他流的相对依赖性。该值是一个介于1和256（含）之间的数字。
  * `silent?` &nbsp;&nbsp; `boolean` 如果为true，则在本地更改优先级，而不向连接的对等方发送`PRIORITY`帧

更新此`Http2Stream`实例的优先级

### **http2stream.rstCode: number**
设置为`Http2Stream`在从连接的对等方接收到`RST_STREAM`帧、或调用`Http2Stream.close()`或`Http2Stream.destroy()`后被销毁时报告的`RST_STREAM`错误代码。如果`Http2Stream`尚未关闭，则将未定义。

### **http2stream.sentHeaders: [HTTP2.Headers](#http2-headers)**
包含为此`Http2Stream`发送的出站头的对象。

### **http2stream.sentInfoHeaders: [HTTP2.Headers](#http2-headers)**
包含为此`Http2Stream`发送的出站信息（附加）头的对象数组。

### **http2stream.sentTrailers: [HTTP2.Headers](#http2-headers)**
包含为此`HttpStream`发送的出站`trailers`的对象

### **http2stream.session: Http2Session**
对拥有此`Http2Stream`的`Http2Session`实例的引用。`Http2Stream`实例被销毁后，该值将未定义。

### **http2stream.setTimeout(msecs: number, callback?: () => void): void**
```js
const http2 = require('http2');
const client = http2.connect('http://example.org:8000');
const { NGHTTP2_CANCEL } = http2.constants;
const req = client.request({ ':path': '/' });

// Cancel the stream if there's no activity after 5 seconds
req.setTimeout(5000, () => req.close(NGHTTP2_CANCEL));
```
设置超时时间，callback将被设为close监听函数

### **http2stream.state: StreamState**
* `StreamState`
  * `localWindowSize?` &nbsp;&nbsp; `number`  &nbsp;&nbsp; 连接的对等方可以在不接收`WINDOW_UPDATE`的情况下为此`Http2Stream`发送的字节数。
  * `state?` &nbsp;&nbsp; `number`  &nbsp;&nbsp; 指示由`nghttp2`确定的`Http2Stream`的低电平当前状态的标志。
  * `localClose?` &nbsp;&nbsp; `number`  &nbsp;&nbsp; 如果此`Http2Stream`已在本地关闭，则返回1。
  * `remoteClose?` &nbsp;&nbsp; `number`  &nbsp;&nbsp; 如果此`Http2Stream`已在远程关闭，则返回1。
  * `sumDependencyWeight?` &nbsp;&nbsp; `number`  &nbsp;&nbsp; 使用`PRIORITY`帧指定的依赖于此`Http2Stream`的所有`Http2Stream`实例的权重总和
  * `weight?` &nbsp;&nbsp; `number` &nbsp;&nbsp; 此`Http2Stream`的优先级权重。

此`Http2Stream`当前得状态

### **http2stream.sendTrailers(headers: [HTTP2.Headers](#http2-headers)): void**
向连接的HTTP/2对等方发送`trailing HEADERS`帧。此方法将导致`Http2Stream`立即关闭，并且只能在发出`'wantTrailers'`事件后调用。发送请求或发送响应时，必须设置`options.waitForTrailers`选项，以便在最终`DATA`帧之后保持`Http2Stream`打开，以便可以发送`trailers`。
```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respond(undefined, { waitForTrailers: true });
  stream.on('wantTrailers', () => {
    stream.sendTrailers({ xyz: 'abc' });
  });
  stream.end('Hello World');
});
```
HTTP/1规范禁止`trailers`包含HTTP/2伪头字段（例如，`':method'`, `':path'`,等）。
<br/><br/><br/>




## ClientHttp2Stream 类
`ClientHttp2Stream`类是`Http2Stream`的扩展，专门用于HTTP/2客户端。客户端上的`Http2Stream`实例提供仅与客户端相关的事件，如`'response'`”和`'push'`。

### **'continue' 事件 () => void**
当服务器发送100 Continue状态时发出，通常是因为包含`Expect:100 Continue`的请求。这是客户机应该发送请求正文的指令。

### **'headers' 事件 (headers: IncomingHttpHeaders & IncomingHttpStatusHeader, flags: number) => void**
当接收到流的附加头块时（如接收到1xx信息头块时），会发出`'headers'`事件。`callback`传入HTTP/2 Headers对象和与这些`Headers`关联的标志。

### **'push' 事件 (headers: IncomingHttpHeaders, flags: number) => void)**
当接收到服务器推送流的响应头时，将发出`'push'`事件。`callback`传入HTTP/2 Headers对象和与这些`Headers`关联的标志。

### **'response' 事件 (headers: IncomingHttpHeaders & IncomingHttpStatusHeader, flags: number) => void**
当从连接的HTTP/2服务器接收到此流的`response HEADERS`帧时，将发出`'response'`事件,`callback`传入HTTP/2 Headers对象和与这些`Headers`关联的标志。

<br/><br/><br/>




## ServerHttp2Stream 类
`ServerHttp2Stream`类是`Http2Stream`的扩展，专门用于HTTP/2服务器。服务器上的`Http2Stream`实例提供了仅与服务器相关的附加方法，如`Http2Stream.pushStream()`和`Http2Stream.respond()`。

### **http2stream.additionalHeaders(headers: [Http2 Hearders](#http2-headers))**
向连接的HTTP/2对等方发送附加的信息头帧。

### **http2stream.headersSent: readonly boolean**
如果发送了头，则为true；否则为false。

### **http2stream.pushAllowed: readonly boolean**
映射到远程客户端最新SETTINGS帧的SETTINGS_ENABLE_PUSH标志的只读属性。如果远程对等方接受推送流，则为true，否则为false。对于同一`Http2Session`中的每个`Http2Stream`，设置都是相同的。

### **http2stream.pushStream(headers: OutgoingHttpHeaders, options?: StreamPriorityOptions, callback?: (err, pushStream: ServerHttp2Stream, headers: OutgoingHttpHeaders) => void**
* `headers` &nbsp;&nbsp; [Http2 Hearders](#http2-headers)
* `options`
  * `exclusive` &nbsp;&nbsp; `boolean` &nbsp;&nbsp; 当为true且`parent`标识父流时，创建的流将成为父流的唯一直接依赖项，而所有其他现有依赖项将成为新创建流的依赖项。默认值：false
  * `parent ` &nbsp;&nbsp; `number` &nbsp;&nbsp; 指定新创建的流所依赖的流的数字标识符。
* `callback` 
  * `err`
  * `pushStream` 返回的`pushStream`对象。
  * `headers` 启动`pushStream`的`Headers`对象。

启动推送流。使用为作为第二个参数传递的`pushStream`创建的新`Http2Stream`实例或作为第一个参数传递的`err`来调用回调。
```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respond({ ':status': 200 });
  stream.pushStream({ ':path': '/' }, (err, pushStream, headers) => {
    if (err) throw err;
    pushStream.respond({ ':status': 200 });
    pushStream.end('some pushed data');
  });
  stream.end('some data');
});
```
在`HEADERS`帧中不允许设置推送流的权重。将权重值传递给`http2stream.priority`，并将`silent`选项设置为true以启用并发流之间的服务器端带宽平衡。

不允许从推送流中调用`http2stream.pushStream()`，并将引发错误。

### **http2stream.respond(headers?: OutgoingHttpHeaders, options?: ServerStreamResponseOptions): void**
* `headers` &nbsp;&nbsp; [Http2 Hearders](#http2-headers)
* `options`
  * `endStream` &nbsp;&nbsp; `boolean` &nbsp;&nbsp;设置为true表示响应将不包括有效负载数据
  * `waitForTrailers` &nbsp;&nbsp; `number` &nbsp;&nbsp; 如果为true，`Http2Stream`将在发送最终`DATA`帧后发出`'wantTrailers'`事件。

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respond({ ':status': 200 });
  stream.end('some data');
});
```
设置`options.waitForTrailers`选项时，将在对要发送的最后一个有效负载数据块进行排队后立即发出`'wantTrailers'`事件。然后，可以使用`http2stream.sendTrailers()`方法将尾部头字段发送到对等方。

设置`options.waitForTrailers`时，在传输最终`DATA`帧时，`Http2Stream`不会自动关闭。用户代码必须调用`http2stream.sendtailers()`或`http2stream.close()`以关闭`http2stream`。
```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respond({ ':status': 200 }, { waitForTrailers: true });
  stream.on('wantTrailers', () => {
    stream.sendTrailers({ ABC: 'some value to send' });
  });
  stream.end('some data');
});
```

### **http2stream.respondWithFD(fd: number | fs.promises.FileHandle, headers?: OutgoingHttpHeaders, options?: ServerStreamFileResponseOptions): void**
* `fd` &nbsp;&nbsp; `number|fs.promises.FileHandle` &nbsp;&nbsp; 可读的文件描述符。
* `headers` &nbsp;&nbsp; [Http2 Hearders](#http2-headers)
* `options`
  * `statCheck` &nbsp;&nbsp; `Function` 
  * `waitForTrailers` 如果为true，`Http2Stream`将在发送最终`DATA`帧后发出`'wantTrailers'`事件。
  * `offset` &nbsp;&nbsp; `number` &nbsp;&nbsp; 开始读取的偏移位置。
  * `length` &nbsp;&nbsp; `number` &nbsp;&nbsp; 要从`fd`发送的数据量。

启动从给定文件描述符读取其数据的响应。对给定的文件描述符不执行任何验证。如果尝试使用文件描述符读取数据时发生错误，`Http2Stream`将使用标准INTERNAL_ERROR代码使用`RST_STREAM`帧关闭。

使用时，`Http2Stream`对象的双工接口将自动关闭。
```js
const http2 = require('http2');
const fs = require('fs');

const server = http2.createServer();
server.on('stream', (stream) => {
  const fd = fs.openSync('/some/file', 'r');

  const stat = fs.fstatSync(fd);
  const headers = {
    'content-length': stat.size,
    'last-modified': stat.mtime.toUTCString(),
    'content-type': 'text/plain'
  };
  stream.respondWithFD(fd, headers);
  stream.on('close', () => fs.closeSync(fd));
});
```
可以指定`options.statCheck`函数，以便用户代码有机会根据给定`fd`的`fs.Stat`详细信息设置其他内容头。如果提供了`statCheck`函数，`http2stream.respondWithFD()`方法将执行`fs.fstat()`调用以收集所提供文件描述符的详细信息。

`offest`和`length`选项可用于限制对特定范围子集的响应。例如，这可以用于支持HTTP范围请求。

关闭流时文件描述符或文件句柄未关闭，因此不再需要时需要手动关闭它。不支持对多个流同时使用同一文件描述符，这可能会导致数据丢失。支持在流完成后重新使用文件描述符。

设置`options.waitForTrailers`选项时，将在对要发送的最后一个有效负载数据块进行排队后立即发出`'wantTrailers'`事件。然后，可以使用`http2stream.sendthiraries()`方法将尾部头字段发送到对等方。

设置`options.waitForTrailers`时，在传输最终`DATA`帧时，`Http2Stream`不会自动关闭。用户代码必须调用`http2stream.sendtailers()`或`http2stream.close()`以关闭`http2stream`。
```js
const http2 = require('http2');
const fs = require('fs');

const server = http2.createServer();
server.on('stream', (stream) => {
  const fd = fs.openSync('/some/file', 'r');

  const stat = fs.fstatSync(fd);
  const headers = {
    'content-length': stat.size,
    'last-modified': stat.mtime.toUTCString(),
    'content-type': 'text/plain'
  };
  stream.respondWithFD(fd, headers, { waitForTrailers: true });
  stream.on('wantTrailers', () => {
    stream.sendTrailers({ ABC: 'some value to send' });
  });

  stream.on('close', () => fs.closeSync(fd));
});
```

### **http2stream.respondWithFile(path: string, headers?: OutgoingHttpHeaders, options?: ServerStreamFileResponseOptionsWithError): void**
* `path` &nbsp;&nbsp; `<string> | <Buffer> | <URL>`
* `headers` [Http2 Headers Object](#http2-headers)
* `options`
  * `statCheck` &nbsp;&nbsp; `Function` 
  * `onError` &nbsp;&nbsp; `Function` &nbsp;&nbsp; 在发送前发生错误时调用的回调函数。
  * `waitForTrailers` 如果为true，`Http2Stream`将在发送最终`DATA`帧后发出`'wantTrailers'`事件。
  * `offset` &nbsp;&nbsp; `number` &nbsp;&nbsp; 开始读取的偏移位置。
  * `length` &nbsp;&nbsp; `number` &nbsp;&nbsp; 要从`fd`发送的数据量。

发送常规文件作为响应。路径必须指定常规文件，否则将在`Http2Stream`对象上发出`'error'`事件。

使用时，`Http2Stream`对象的双工接口将自动关闭

可以指定`options.statCheck`函数，以便用户代码有机会基于给定文件的`fs.Stat`详细信息设置其他内容头：

如果在尝试读取文件数据时发生错误，`Http2Stream`将使用标准INTERNAL_ERROR代码使用RST_STREAM帧关闭。如果定义了`onError`回调，则将调用它。否则流就会被摧毁。
```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  function statCheck(stat, headers) {
    headers['last-modified'] = stat.mtime.toUTCString();
  }

  function onError(err) {
    if (err.code === 'ENOENT') {
      stream.respond({ ':status': 404 });
    } else {
      stream.respond({ ':status': 500 });
    }
    stream.end();
  }

  stream.respondWithFile('/some/file',
                         { 'content-type': 'text/plain' },
                         { statCheck, onError }
  );
});
```
`options.statCheck`函数还可用于通过返回`false`来取消发送操作。例如，条件请求可以检查`stat`结果以确定文件是否已被修改以返回适当的304响应
```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  function statCheck(stat, headers) {
    // Check the stat here...
    stream.respond({ ':status': 304 });
    return false; // Cancel the send operation
  }
  stream.respondWithFile('/some/file',
                         { 'content-type': 'text/plain' },
                         { statCheck }
  );
});
```
将自动设置`content-length`。

`offest`和`length`选项可用于限制对特定范围子集的响应。例如，这可以用于支持HTTP范围请求。

`options.onError`函数还可用于处理在启动文件传递之前可能发生的所有错误。默认行为是销毁流。

设置`options.waitForTrailers`选项时，将在对要发送的最后一个有效负载数据块进行排队后立即发出`'wantTrailers'`事件。然后，可以使用`http2stream.sendthiraries()`方法将尾部头字段发送到对等方。

设置`options.waitForTrailers`时，在传输最终`DATA`帧时，`Http2Stream`不会自动关闭。用户代码必须调用`http2stream.sendtailers()`或`http2stream.close()`以关闭`http2stream`。
```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respondWithFile('/some/file',
                         { 'content-type': 'text/plain' },
                         { waitForTrailers: true });
  stream.on('wantTrailers', () => {
    stream.sendTrailers({ ABC: 'some value to send' });
  });
});
```
<br/><br/><br/>




## Http2Server 类
`Http2Server`的实例是使用`http2.createServer()`函数创建的。http2模块不直接导出`Http2Server`类。

### **'checkContinue' 事件 (request: Http2ServerRequest, response: Http2ServerResponse) => void**
如果注册了`'request'`侦听器或提供了`http2.createServer()`回调函数，则每次收到 HTTP `Expect: 100-continue` 的请求时都会触发。 如果未监听此事件，服务器将自动响应 `100 Continue`。

如果客户端应继续发送请求正文，则处理此事件涉及调用`response.writeContinue()`，如果客户端不应继续发送请求正文，则生成适当的HTTP响应（例如400 Bad Request）。

发出和处理此事件时，将不会发出`'request'`事件。

### **'request' 事件 (request: Http2ServerRequest, response: Http2ServerResponse) => void**
每次有请求时发出。每个会话可能有多个请求。请参[阅兼容性API](#Compatibility-API)。


### **'session' 事件 (session: ServerHttp2Session) => void**
`Http2Server`创建新的`Http2Session`时会发出`'session'`事件。

### **'sessionError' 事件 (err: Error) => void**
当与`Http2Server`关联的`Http2Session`对象发出`'error'`事件时，将发出`'sessionError'`事件。

### **'stream' 事件 (stream: ServerHttp2Stream, headers: IncomingHttpHeaders, flags: number) => void**
当与服务器关联的`Http2Session`发出`'stream'`事件时，将发出`'stream'`事件。
```js
const http2 = require('http2');
const {
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE
} = http2.constants;

const server = http2.createServer();
server.on('stream', (stream, headers, flags) => {
  const method = headers[HTTP2_HEADER_METHOD];
  const path = headers[HTTP2_HEADER_PATH];
  // ...
  stream.respond({
    [HTTP2_HEADER_STATUS]: 200,
    [HTTP2_HEADER_CONTENT_TYPE]: 'text/plain'
  });
  stream.write('hello ');
  stream.end('world');
});
```

### **'timeout' 事件 () => void**
当服务器上没有使用`http2server.setTimeout()`设置的给定毫秒数的活动时，将发出`'timeout'`事件。默认值：0（无超时）

### **server.close(callback?: (err?: Error) => void)**
停止服务器建立新会话。由于HTTP/2会话的持久性，这不会阻止创建新的请求流。要正常关闭服务器，请对所有活动会话调用`http2session.close()`。

如果提供callback，则在关闭所有活动会话之前不会调用它，尽管服务器已停止允许新会话。有关详细信息，请参见`net.Server.close()`。

### **server.setTimeout(msec?: number, callback?: () => void)**
用于设置http2服务器请求的超时值，并设置一个回调函数，当`http2Server`在msec毫秒后没有活动时调用该函数。

给定的回调已注册为`'timeout'`事件的侦听器。

如果回调不是函数，则将抛出一个新的ERR_INVALID_CALLBACK错误。

### **server.timeout: number**
假定套接字已超时之前的非活动毫秒数。

值为0将禁用超时行为。

套接字超时逻辑是在连接上设置的，因此更改此值只会影响到服务器的新连接，而不会影响到任何现有连接。
<br/><br/><br/>




## Http2SecureServer 类
`Http2SecureServer`的实例是使用`http2.createSecureServer()`函数创建的。http2模块不直接导出`Http2SecureServer`类。

### **'checkContinue' 事件 (request: Http2ServerRequest, response: Http2ServerResponse) => void**
如果注册了`'request'`侦听器或提供了`http2.createSecureServer()`回调函数，则每次收到 HTTP `Expect: 100-continue` 的请求时都会触发。 如果未监听此事件，服务器将自动响应 `100 Continue`。

如果客户端应继续发送请求正文，则处理此事件涉及调用`response.writeContinue()`，如果客户端不应继续发送请求正文，则生成适当的HTTP响应（例如400 Bad Request）。

发出和处理此事件时，将不会发出`'request'`事件。

### **'request' 事件 (request: Http2ServerRequest, response: Http2ServerResponse) => void**
每次有请求时发出。每个会话可能有多个请求。请参[阅兼容性API](#Compatibility-API)。


### **'session' 事件 (session: ServerHttp2Session) => void**
`Http2SecureServer`创建新的`Http2Session`时会发出`'session'`事件。

### **'sessionError' 事件 (err: Error) => void**
当与`Http2SecureServer`关联的`Http2Session`对象发出`'error'`事件时，将发出`'sessionError'`事件。

### **'stream' 事件 (stream: ServerHttp2Stream, headers: IncomingHttpHeaders, flags: number) => void**
当与服务器关联的`Http2Session`发出`'stream'`事件时，将发出`'stream'`事件。

### **'timeout' 事件 () => void**
当服务器上没有使用`http2server.setTimeout()`设置的给定毫秒数的活动时，将发出`'timeout'`事件。默认值：2min

### **'unknownProtocol' 事件 **
当连接客户端无法协商允许的协议（即HTTP/2或HTTP/1.1）时，会发出`'unknownProtocol'`事件。事件处理程序接收要处理的套接字。如果没有为此事件注册侦听器，则连接将终止。请参阅[兼容性API](#Compatibility-API)。

### **server.close(callback?: (err?: Error) => void)**
停止服务器建立新会话。由于HTTP/2会话的持久性，这不会阻止创建新的请求流。要正常关闭服务器，请对所有活动会话调用`http2session.close()`。

如果提供回调，则在关闭所有活动会话之前不会调用它，尽管服务器已停止允许新会话。有关详细信息，请参见`tls.Server.close()`。

### **server.setTimeout(msec?: number, callback?: () => void)**
用于设置http2服务器请求的超时值，并设置一个回调函数，当`Http2SecureServer`在msec毫秒后没有活动时调用该函数。

给定的回调已注册为`'timeout'`事件的侦听器。

如果回调不是函数，则将抛出一个新的ERR_INVALID_CALLBACK错误。

### **server.timeout: number**
假定套接字已超时之前的非活动毫秒数。

值为0将禁用超时行为。

套接字超时逻辑是在连接上设置的，因此更改此值只会影响到服务器的新连接，而不会影响到任何现有连接。

<br/><br/><br/>




## http2

### **http2.createServer(options: ServerOptions, onRequestHandler?: (request: Http2ServerRequest, response: Http2ServerResponse) => void)**
* `options`
  * `maxDeflateDynamicTableSize` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置头压缩表的最大动态表大小。默认值：4Kib。
  * `maxSessionMemory` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置允许`Http2Session`使用的最大内存。该值以兆字节数表示，例如1等于1兆字节。允许的最小值为1。这是一个基于信用的限制，现有的`Http2Streams`可能会导致超过此限制，但当超过此限制时，新的`Http2Stream`实例将被拒绝。`Http2Stream`会话的当前数量、头压缩表的当前内存使用、排队等待发送的当前数据以及未确认的PING和SETTINGS帧都将计入当前限制。默认值：10。
  * `maxHeaderListPairs` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置`header`的最大数目。最小值是4。默认值：128
  * `maxOutstandingPings` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置未完成的未确认ping的最大数目。默认值：10。
  * `maxSendHeaderBlockLength` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置序列化的压缩头块所允许的最大大小。尝试发送超过此限制的头将导致发出`'frameError'`事件，并关闭和销毁流。
  * `paddingStrategy` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 用于确定用于`HEADERS`和`DATA`帧的填充量的策略。默认值：`http2.constants.PADDING_STRATEGY_NONE`。
    * `http2.constants.PADDING_STRATEGY_NONE`: 没有填充.
    * `http2.constants.PADDING_STRATEGY_MAX`: 将应用由内部实现确定的最大填充量。
    * `http2.constants.PADDING_STRATEGY_ALIGNED`: 尝试应用足够的填充以确保总帧长度（包括9字节头）是8的倍数。对于每个帧，都有由当前流控制状态和设置确定的最大允许填充字节数。如果此最大值小于确保对齐所需的计算量，则使用最大值，并且总帧长度不一定以8字节对齐。
  * `peerMaxConcurrentStreams` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置远程对等的最大并发流数，如同已收到`SETTINGS`帧一样。如果远程对等方为`maxConcurrentStreams`设置自己的值，则将被重写。默认值：100。
  * `maxSessionInvalidFrames` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置会话关闭前允许的最大无效帧数。默认值：1000
  * `maxSessionRejectedStreams` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置会话关闭前允许的创建时拒绝的最大流数。每一次拒绝都与一个`NGHTTP2_ENHANCE_YOUR_CALM`错误相关，该错误应告诉对等方不要再打开任何流，因此继续打开流被视为不对等行为。默认值：100。
  * `settings` &nbsp;&nbsp; [HTTP/2 Settings Object](#http2-settings) &nbsp;&nbsp; 连接时发送到远程对等方的初始设置。
  * `Http1IncomingMessage` &nbsp;&nbsp; `<http.IncomingMessage>` &nbsp;&nbsp; 指定用于HTTP/1回退的`IncomingMessage`类。用于扩展原始`http.IncomingMessage`。默认值：`http.IncomingMessage`。
  * `Http1ServerResponse` &nbsp;&nbsp; `<http.ServerResponse>` &nbsp;&nbsp; 指定用于HTTP/1回退的`ServerResponse`类。用于扩展原始`http.ServerResponse`。默认值：`http.ServerResponse`。
  * `Http2ServerRequest` &nbsp;&nbsp; `<http2.Http2ServerRequest>` &nbsp;&nbsp; 指定要使用的`Http2ServerRequest`类。用于扩展原始`Http2ServerRequest`。默认值：`Http2ServerRequest`。
  * `Http2ServerResponse` &nbsp;&nbsp; `<http2.Http2ServerResponse>` &nbsp;&nbsp; 指定要使用的`Http2ServerResponse`类。用于扩展原始`Http2ServerResponse`。默认值：`Http2ServerResponse`。
  * ...  任何 `net.createServer()` 支持的选项.
* `onRequestHandler` `<Function>` 参见[兼容性API](#Compatibility-API)

返回创建和管理`Http2Session`实例的`net.Server`实例。

由于已知没有支持未加密HTTP/2的浏览器，因此在与浏览器客户端通信时需要使用`http2.createSecureServer()`
```js
const http2 = require('http2');

// Create an unencrypted HTTP/2 server.
// Since there are no browsers known that support
// unencrypted HTTP/2, the use of `http2.createSecureServer()`
// is necessary when communicating with browser clients.
const server = http2.createServer();

server.on('stream', (stream, headers) => {
  stream.respond({
    'content-type': 'text/html',
    ':status': 200
  });
  stream.end('<h1>Hello World</h1>');
});

server.listen(80);
```

### **http2.createSecureServer(options: SecureServerOptions, onRequestHandler?: (request: Http2ServerRequest, response: Http2ServerResponse) => void)**
* `options`
  * `allowHTTP1` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 当设置为true时，不支持HTTP/2的传入客户端连接将降级为HTTP/1.x。请参阅`'unknownProtocol'`事件。见[ALPN协商](#ALPN)。默认值：false。
  * `origins` &nbsp;&nbsp; `<string[]>` &nbsp;&nbsp; 在创建新的服务器`Http2Session`后立即在`ORIGIN`帧内发送的源字符串数组。
  * `maxDeflateDynamicTableSize`, `maxSessionMemory`, `maxHeaderListPairs`, `maxOutstandingPings`, `maxSendHeaderBlockLength`, `paddingStrategy`, `peerMaxConcurrentStreams`, `maxSessionInvalidFrames`, `maxSessionRejectedStreams`, `settings` 与 `http2.createServer()`行为相同
  * ... 任何`tls.createServer()`支持的选项
* `onRequestHandler`

返回创建和管理`Http2Session`实例的`tls.Server`实例。
```js
const http2 = require('http2');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
};

// Create a secure HTTP/2 server
const server = http2.createSecureServer(options);

server.on('stream', (stream, headers) => {
  stream.respond({
    'content-type': 'text/html',
    ':status': 200
  });
  stream.end('<h1>Hello World</h1>');
});

server.listen(80);
```

### **http2.connect(authority: string | url.URL,options?: ClientSessionOptions | SecureClientSessionOptions,listener?: (session: ClientHttp2Session, socket: net.Socket | tls.TLSSocket) => void)**
* `authority` &nbsp;&nbsp; `string | url.URL` &nbsp;&nbsp; 要连接到的远程HTTP/2服务器。这必须是一个最小的、有效的URL，其前缀为http://or https://前缀、主机名和IP端口（如果使用非默认端口）。将忽略URL中的用户信息（用户ID和密码）、路径、查询字符串和片段详细信息。
* `options`
  * `maxReservedRemoteStreams` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 设置客户端在任何给定时间将接受的最大保留推送流数。一旦当前保留的推送流的数量超过此限制，服务器发送的新推送流将被自动拒绝。允许的最小值为0。最大允许值为`pow(2,32)-1`。负值将此选项设置为允许的最大值。默认值：200。
  * `protocol` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 要连接的协议（如果未在权限中设置）。值可以是“http:”或“https:”。默认值：“https:”
  * `createConnection` &nbsp;&nbsp; `<Function>` &nbsp;&nbsp; 接收传递给`connect`和`options`对象的URL实例的可选回调，并返回要用作此会话连接的任何双工流。
  * `maxDeflateDynamicTableSize`, `maxSessionMemory`, `maxHeaderListPairs`, `maxOutstandingPings`, `maxSendHeaderBlockLength`, `paddingStrategy`, `peerMaxConcurrentStreams`, `settings`选项与`http2.createServer()`、`http2.createSecureServer()`行为相同
  * ... 任何`tls.connect()`、`net.connect()`支持的选项

返回`ClientHttp2Session`实例。
```js
const http2 = require('http2');
const client = http2.connect('https://localhost:1234');

/* Use the client */
client.close();
```

### **http2.getDefaultSettings()**
返回包含`Http2Session`实例的默认设置的对象。此方法每次调用时都返回一个新的对象实例，因此可以安全地修改返回的实例以供使用。

### **http2.getPackedSettings(settings: Settings): Buffer**
返回一个`Buffer`实例，其中包含HTTP/2规范中指定的给定HTTP/2设置的序列化表示形式。这是用于HTTP2设置头字段的。
```js
const http2 = require('http2');

const packed = http2.getPackedSettings({ enablePush: false });

console.log(packed.toString('base64'));
// Prints: AAIAAAAA
```

### **ttp2.getUnpackedSettings(buf: Uint8Array): [Settings](#http2-settings)**
返回一个HTTP/2设置对象，该对象包含由`http2.getPackedSettings()`生成的来自给定`Buffer`的反序列化设置。



<br/><br/><br/>

## http2.Http2ServerRequest 类
`http2ServerRequest`对象由`http2.Server`或`http2.SecureServer`创建，并作为`'request'`事件的第一个参数传递。它可用于访问请求状态、头和数据。

### **'aborted' 事件 (hadError: boolean, code: number) => void**
每当`Http2ServerRequest`实例在中间通信中异常中止时，就会发出“aborted”事件。

只有在`Http2ServerRequest`可写端尚未结束时，才会发出“aborted”事件。

### **'close' 事件 () => void**
表示底层`Http2Stream`已关闭。与`'end'`一样，此事件在每个响应中仅发生一次。

### **request.aborted: boolean**
如果请求已中止，则`request.aborted`属性将为true。

### **request.authority: string**
请求授权伪头字段。也可以通过`req.headers['：authority']`访问它。

### **request.complete: boolean**
如果请求已完成、中止或销毁，则`request.complete`属性将为true。

### **request.destroy(error?: Error)**
对接收到`http2server`请求的`Http2Stream`调用`destroy()`。如果提供`error`，则会发出`'error'`事件，并将错误作为参数传递给事件上的任何侦听器。

如果`stream`已经被摧毁了，则什么也不做。

### **request.headers: IncomingHttpHeaders**
请求/响应头对象。

头名称和值的键值对。名称是小写的。

在HTTP/2中，请求路径、主机名、协议和方法表示为前缀为：字符的特殊头（例如 `':path'`）。这些特殊的头将包含在`request.headers`对象中。必须注意不要无意中修改这些特殊头，否则可能会发生错误。
```js
// 例如，从请求中删除所有头将导致发生错误：
removeAllHeaders(request.headers);
assert(request.url);   // Fails because the :path header has been removed
```

### **request.httpVersion: string**
在服务器请求的情况下，客户端发送的HTTP版本。在客户端响应的情况下，连接到服务器的HTTP版本。返回`'2.0'`.

此外，`message.httpVersionMajor`是第一个整数，`message.httpVersionMinor`是第二个整数。

### **request.method: readonly string**
请求方法。只读。例如：“GET”、“DELETE”。

### **request.rawHeaders: string[]**
原始请求/响应头列表与接收到的完全相同。

键和值在同一列表中。它不是元组列表。因此，偶数位是键，奇数位是值。

头名称不小写，重复项不合并。

### **request.rawTrailers: string[]**
原始请求/响应`trailer`键和值与接收到的值完全相同。仅在`'end'`事件时填充。

### **request.scheme: string**
指示目标URL的scheme部分的请求scheme伪头字段。  
The request scheme pseudo header field indicating the scheme portion of the target URL.

### **request.setTimeout(msecs: number, callback?: () => void)**
将`Http2Stream`的超时值设置为`msecs`。如果提供`callback`，则将其添加为响应对象上`'timeout'`事件的侦听器。

如果请求、响应或服务器未添加`'timeout'`侦听器，则`Http2Streams`将在超时时被销毁。如果为请求、响应或服务器的`'timeout'`事件分配了处理程序，则必须显式处理超时的套接字。

### **request.socket: net.Socket | tls.TLSSocket**
返回充当`net.Socket`（或`tls.TLSSocket`）但应用基于HTTP/2逻辑的`getter`、`setter`和`methods`的代理对象。

`destroyed`, `readable`, `writable`属性将从`request.stream`检索并设置。

`destroy`, `emit`, `end`, `on` and `once` 将作用于`request.stream`

`setTimeout`将作用于`request.stream.session`。

`pause`、`read`、`resume`和`write`将抛出一个错误，错误代码为`ERR_HTTP2_NO_SOCKET_MANIPULATION`。有关更多信息，请参阅Http2Session和Sockets。

所有其他交互将直接路由到套接字。对于TLS支持，请使用`request.socket.getPeerCertificate()`获取客户端的身份验证详细信息。

### **request.stream: ServerHttp2Stream**
`request`的`Http2Stream`对象。

### **request.trailers: IncomingHttpHeaders**
请求/响应`trailers`对象。仅在`'end'`事件时填充。

### **request.url: string**
请求URL字符串。它只包含实际HTTP请求中存在的URL。如果请求是：
```text
GET /status?name=ryan HTTP/1.1\r\n
Accept: text/plain\r\n
\r\n
```
`request.url`则是
```js
'/status?name=ryan'
```
要将url解析为其部分，需要（'url'）。可以使用`require('url').parse(request.url)` 

要从`query`中提取参数，可以使用`require('querystring').parse`函数，也可以将`true`作为`require('url').parse`的第二个参数传递。

<br/><br/><br/>





## http2.Http2ServerResponse 类
此对象是由HTTP服务器内部创建的，而不是由用户创建的。它作为第二个参数传递给`'request'`事件。

### **'close' 事件 () => void**
表明在调用`response.end()`或能够刷新之前终止了`Http2Stream`。

### **'finish' 事件 () => void**
发送响应时发出。更具体地说，当响应头和主体的最后一段被传递给HTTP/2多路复用以通过网络传输时，会发出此事件。这并不意味着客户已经收到了任何东西。

在此事件之后，将不再在响应对象上发出事件。

### **response.addTrailers(trailers: OutgoingHttpHeaders)**
此方法向响应添加HTTP trailing headers（位于消息末尾的header）。

试图设置包含无效字符的头字段名或值将导致引发TypeError。

### **response.end(data: string | Uint8Array, encoding: string, callback?: () => void)**
此方法向服务器发出信号，表明所有响应头和正文都已发送；该服务器应认为此消息已完成。必须对每个响应调用方法`response.end()`。

如果指定了`data`，则相当于调用`response.write(data, encoding)`之后调用了`response.end(callback)`.

如果指定了`callback`，则在响应流完成时将调用它。

### **response.getHeader(name: string): string**
读取已排队但未发送到客户端的头。名称不区分大小写。

### **response.getHeaderNames(): string[]**
返回包含当前传出头的唯一名称的数组。所有的头名称都是小写的。

### **response.getHeaders(): OutgoingHttpHeaders**
返回当前传出邮件头的浅层副本。由于使用了浅拷贝，因此可以在不额外调用各种与头相关的http模块方法的情况下改变数组值。返回对象的键是头名称，值是各自的头值。所有的头名称都是小写的。

`response.getHeaders()`方法返回的对象不是从JavaScript对象的原始继承。这意味着典型的对象方法，如`obj.toString()`、`obj.hasOwnProperty()`和其他方法没有定义，也无法工作。

### **response.hasHeader(name: string): boolean**
如果当前在传出头中设置了按名称标识的头，则返回true。头名称匹配不区分大小写。

### **response.headersSent: readonly boolean**
如果发送了头，则为True；否则为false。

### **response.removeHeader(name: string)**
删除已排队等待隐式发送的头。

### **response.sendDate: boolean**
如果为true，则会自动生成日期头并在响应中发送（如果它尚未出现在头中）。默认为true。

这只应在测试时禁用；HTTP在响应中需要日期头。

### **response.setHeader(name: string, value: number | string | string[])**
为隐式头设置单个头值。如果此头已存在于待发送的头中，则其值将被替换。

试图设置包含无效字符的头字段名或值将导致引发TypeError。

由`response.setHeader()`设置headers后，将和`response.writeHead()`所传递的headers合并, `response.writeHead()`具有优先等级
```js
const server = http2.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
// content-type = text/plain
```

### **response.setTimeout(msecs: number, callback?: () => void)**
将`Http2Stream`的超时值设置为`msecs`。如果提供`callback`，则将其添加为响应对象上`'timeout'`事件的侦听器。

如果请求、响应或服务器未添加`'timeout'`侦听器，则`Http2Streams`将在超时时被销毁。如果为请求、响应或服务器的`'timeout'`事件分配了处理程序，则必须显式处理超时的套接字。

### **response.socket**
返回充当`net.Socket`（或`tls.TLSSocket`）但应用基于HTTP/2逻辑的`getter`、`setter`和`methods`的代理对象。

`destroyed`, `readable`, `writable`属性将从`request.stream`检索并设置。

`destroy`, `emit`, `end`, `on` and `once` 将作用于`request.stream`

`setTimeout`将作用于`request.stream.session`。

`pause`、`read`、`resume`和`write`将抛出一个错误，错误代码为`ERR_HTTP2_NO_SOCKET_MANIPULATION`。有关更多信息，请参阅Http2Session和Sockets。

所有其他交互将直接路由到套接字。

### **response.statusCode: number**
使用隐式头时（不显式地调用`response.writeHead()`)，此属性控制刷新头时将发送到客户端的状态代码。

将响应头发送到客户端后，此属性指示已发送的状态代码。

### **response.statusMessage: ''**
HTTP/2不支持状态消息（RFC 7540 8.1.2.4）。它返回一个空字符串。

### **response.stream: ServerHttp2Stream**
`response`的`Http2Stream`对象。

### **response.writableEnded: boolean**
在调用`response.end()`后为true。此属性不指示数据是否已刷新，因此请改用`writable.writableFinished`

### **response.write(chunk: string | Uint8Array, encoding: string, callback?: (err: Error) => void)**
如果调用了此方法，但尚未调用`response.writeHead()`，则它将切换到隐式头模式并刷新隐式头。

这将发送响应体的一个`chunk`。可以多次调用此方法以提供`body`的连续部分。

在http模块中，当请求是HEAD请求时，将省略响应体。同样，204和304响应不能包含消息体。

`chunk`可以是`string`或`Buffer`。如果`chunk`是字符串，则第二个参数指定如何将其编码为字节流。默认情况下，编码为“utf8”。刷新此数据块时将调用回调。

这是原始的HTTP body，与可能使用的高级多部分主体编码无关。  
This is the raw HTTP body and has nothing to do with higher-level multi-part body encodings that may be used.

第一次调用`response.write()`时，它会将缓冲的头信息和正文的第一个块发送到客户端。第二次调用`response.write()`时，Node.js假设数据将被流化，并分别发送新数据。也就是说，响应被缓冲到主体的第一个块。

如果整个数据成功刷新到内核缓冲区，则返回true。如果全部或部分数据在用户内存中排队，则返回false当缓冲区再次空闲时，将触发`'drain'`。

### **response.writeContinue()**
向客户端发送状态100 Continue，指示应发送请求正文。请参阅`Http2Server`和`Http2SecureServer`上的`'checkContinue'`事件。

### **response.writeHead(statusCode: number, statusMessage: string, headers?: OutgoingHttpHeaders)**
向请求发送响应头。状态码是一个3位的HTTP状态码，比如404。最后一个参数`headers`是响应头。返回对`Http2ServerResponse`的引用，以便可以链式调用。

为了与HTTP/1兼容，可以将`statusMessage`作为第二个参数传递。但是，由于`statusMessage`在HTTP/2中没有任何意义，因此参数将无效，并将发出进程警告。

`Content-Length`以字节而不是字符为单位。可以使用`Buffer.byteLength()`API来确定给定编码中的字节数。在出站消息中，Node.js不检查内容长度和要传输的正文长度是否相等。但是，在接收消息时，当内容长度与实际负载大小不匹配时，Node.js将自动拒绝消息。

在调用`response.end()`之前，此方法最多可对消息调用一次。

如果在调用该函数之前调用`response.write()`或`response.end()`,则将计算隐式/可变头并调用此函数。

由`response.setHeader()`设置headers后，将和`response.writeHead()`所传递的headers合并, `response.writeHead()`具有优先等级

试图设置包含无效字符的头字段名或值将导致引发TypeError

### **response.createPushResponse(headers: OutgoingHttpHeaders, callback: (err, res: Http2ServerResponse) => void)**
* `headers` &nbsp;&nbsp; 描述header的对象
* `callback` &nbsp;&nbsp; `Function` &nbsp;&nbsp; 一旦`http2stream.pushStream()`完成，或者尝试创建推送的`http2stream`失败或被拒绝，或者在调用`http2stream.pushStream()`方法之前关闭`Http2ServerRequest`的状态时调用
  * `err`
  * `stream` &nbsp;&nbsp; 新创建的`ServerHttp2Stream`对象

使用给定的`headers`调用`http2stream.pushStream()`，如果成功，则将给定的`http2stream`包装在新创建的`Http2ServerResponse`上作为回调参数。当`Http2ServerRequest`关闭时，调用回调时会出现错误`ERR_HTTP2_INVALID_STREAM`。

<br/><br/><br/>





## <span id="http2-constance">Http2常量</span>
RST_STREAM 与 GOAWAY 的错误码
|值 | 名 | 常量|
| :--: | :--: | :--:|
| 0x00 |	No Error |	http2.constants.NGHTTP2_NO_ERROR |
| 0x01 |	Protocol Error | http2.constants.NGHTTP2_PROTOCOL_ERROR |
| 0x02 |	Internal Error |	http2.constants.NGHTTP2_INTERNAL_ERROR |
| 0x03 |	Flow Control Error |	http2.constants.NGHTTP2_FLOW_CONTROL_ERROR |
| 0x04 |	Settings Timeout |	http2.constants.NGHTTP2_SETTINGS_TIMEOUT |
| 0x05 |	Stream Closed |	http2.constants.NGHTTP2_STREAM_CLOSED |
| 0x06 |	Frame Size Error |	http2.constants.NGHTTP2_FRAME_SIZE_ERROR |
| 0x07 |	Refused Stream |	http2.constants.NGHTTP2_REFUSED_STREAM |
| 0x08 |	Cancel |	http2.constants.NGHTTP2_CANCEL |
| 0x09 |	Compression Error |	http2.constants.NGHTTP2_COMPRESSION_ERROR |
| 0x0a |	Connect Error |	http2.constants.NGHTTP2_CONNECT_ERROR |
| 0x0b |	Enhance Your Calm |	http2.constants.NGHTTP2_ENHANCE_YOUR_CALM |
| 0x0c |	Inadequate Security |	http2.constants.NGHTTP2_INADEQUATE_SECURITY |
| 0x0d |	HTTP/1.1 Required |	http2.constants.NGHTTP2_HTTP_1_1_REQUIRED |


## <span id="error-handler">异常处理</span>
使用http2模块时可能会出现以下几种错误情况：

当传入不正确的参数、选项或设置值时，将发生验证错误。这些将始终通过同步抛出进行报告。

当在不正确的时间尝试某个操作时（例如，尝试在流关闭后发送数据），会出现状态错误。这些将使用同步抛出或通过`Http2Stream`、`Http2Session`或HTTP/2服务器对象上的“error”事件进行报告，具体取决于错误发生的位置和时间。

当HTTP/2会话意外失败时，会发生内部错误。这些将通过`Http2Session`或HTTP/2服务器对象上的“error”事件报告。

违反各种HTTP/2协议约束时会发生协议错误。这些将使用同步抛出或通过`Http2Stream`、`Http2Session`或HTTP/2服务器对象上的“error”事件进行报告，具体取决于错误发生的位置和时间。

## <span id="invalid-hearders">消息头键值中的无效字符</span>
与HTTP/1实现相比，HTTP/2实现对HTTP头名称和值中的无效字符应用了更严格的处理。

头字段名不区分大小写，严格按照小写字符串通过导线传输。Node.js提供的API允许将头名称设置为混合大小写字符串（例如Content-Type），但在传输时会将其转换为小写（例如content-type）。

头字段名只能包含以下一个或多个ASCII字符: `a-z, A-Z, 0-9, !, #, $, %, &, ', *, +, -, ., ^, _, |, ~`

在HTTP头字段名中使用无效字符将导致流关闭，并报告协议错误。

根据HTTP规范的要求，头字段值的处理更加宽松，但不应包含新行或回车字符，并且应限制为US-ASCII字符。

## <span id="pushtoclient">推送流到客户端</span>
要在客户端上接收推送流，请在`ClientHttp2Session`上为“stream”事件设置侦听器：
```js
const http2 = require('http2');

const client = http2.connect('http://localhost');

client.on('stream', (pushedStream, requestHeaders) => {
  pushedStream.on('push', (responseHeaders) => {
    // Process response headers
  });
  pushedStream.on('data', (chunk) => { /* handle pushed data */ });
});

const req = client.request({ ':path': '/' });
```

## <span id="support-connect">支持 CONNECT 方法</span>
`CONNECT`方法用于允许HTTP/2服务器用作TCP/IP连接的代理。
```js
// TCP server
const net = require('net');

const server = net.createServer((socket) => {
  let name = '';
  socket.setEncoding('utf8');
  socket.on('data', (chunk) => name += chunk);
  socket.on('end', () => socket.end(`hello ${name}`));
});

server.listen(8000);
```
```js
// HTTP/2 CONNECT proxy
const http2 = require('http2');
const { NGHTTP2_REFUSED_STREAM } = http2.constants;
const net = require('net');

const proxy = http2.createServer();
proxy.on('stream', (stream, headers) => {
  if (headers[':method'] !== 'CONNECT') {
    // Only accept CONNECT requests
    stream.close(NGHTTP2_REFUSED_STREAM);
    return;
  }
  const auth = new URL(`tcp://${headers[':authority']}`);
  // It's a very good idea to verify that hostname and port are
  // things this proxy should be connecting to.
  const socket = net.connect(auth.port, auth.hostname, () => {
    stream.respond();
    socket.pipe(stream);
    stream.pipe(socket);
  });
  socket.on('error', (error) => {
    stream.close(http2.constants.NGHTTP2_CONNECT_ERROR);
  });
});

proxy.listen(8001);
```
```js
// HTTP/2 CONNECT client:
const http2 = require('http2');

const client = http2.connect('http://localhost:8001');

// Must not specify the ':path' and ':scheme' headers
// for CONNECT requests or an error will be thrown.
const req = client.request({
  ':method': 'CONNECT',
  ':authority': `localhost:${port}`
});

req.on('response', (headers) => {
  console.log(headers[http2.constants.HTTP2_HEADER_STATUS]);
});
let data = '';
req.setEncoding('utf8');
req.on('data', (chunk) => data += chunk);
req.on('end', () => {
  console.log(`The server says: ${data}`);
  client.close();
});
req.end('Jane');
```

## <span id="extend-connect">扩展的 CONNECT 协议</span>
RFC 8441定义了HTTP/2的“Extended CONNECT Protocol”扩展，该扩展可用于使用CONNECT方法引导`Http2Stream`的使用，作为其他通信协议（如WebSockets）的隧道。

HTTP/2服务器通过使用`enableConnectProtocol`设置启用扩展连接协议：
```js
const http2 = require('http2');
const settings = { enableConnectProtocol: true };
const server = http2.createServer({ settings });
```
一旦客户端从服务器接收到指示可以使用扩展连接的`SETTINGS`帧，它就可以发送使用`：protocol`HTTP/2伪头的连接请求：
```js
const http2 = require('http2');
const client = http2.connect('http://localhost:8080');
client.on('remoteSettings', (settings) => {
  if (settings.enableConnectProtocol) {
    const req = client.request({ ':method': 'CONNECT', ':protocol': 'foo' });
    // ...
  }
});
```


## <span id="Compatibility-API">兼容的 API</span>
兼容性API的目标是在使用HTTP/2时提供类似的HTTP/1开发体验，从而使开发同时支持HTTP/1和HTTP/2的应用程序成为可能。这个API只针对HTTP/1的公共API。但是，许多模块使用内部方法或状态，这些方法或状态不受支持，因为它是完全不同的实现。
```js
// 以下示例使用兼容性API创建HTTP/2服务器：
const http2 = require('http2');
const server = http2.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
```
要创建混合的HTTPS和HTTP/2服务器，请参阅[ALPN协商部分](#ALPN)。不支持从非tls HTTP/1服务器升级。

HTTP/2兼容性API由`Http2ServerRequest`和`Http2ServerResponse`组成。它们的目标是与HTTP/1的API兼容性，但并不隐藏协议之间的差异。例如，忽略HTTP代码的状态消息。

## <span id="ALPN">ALPN 协商</span>
ALPN协商允许在同一个套接字上同时支持HTTPS和HTTP/2。req和res对象可以是HTTP/1或HTTP/2，应用程序必须将自身限制为HTTP/1的公共API，并检测是否可以使用HTTP/2的更高级功能。
```js
// 下面的示例创建了一个同时支持这两种协议的服务器：
const { createSecureServer } = require('http2');
const { readFileSync } = require('fs');

const cert = readFileSync('./cert.pem');
const key = readFileSync('./key.pem');

const server = createSecureServer(
  { cert, key, allowHTTP1: true },
  onRequest
).listen(4443);

function onRequest(req, res) {
  // Detects if it is a HTTPS request or HTTP/2
  const { socket: { alpnProtocol } } = req.httpVersion === '2.0' ?
    req.stream.session : req;
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({
    alpnProtocol,
    httpVersion: req.httpVersion
  }));
}
```
`'request'`事件在HTTPS和HTTP/2上的工作方式相同。


## <span id="http2-headers">HTP2 Headers 消息头对象</span>
`Headers`在JavaScript对象上表示为自己的属性。属性键将被序列化为小写。属性值应该是字符串（如果不是，则将强制为字符串）或字符串数组（以便为每个头字段发送多个值）。
```js
const headers = {
  ':status': '200',
  'content-type': 'text-plain',
  'ABC': ['has', 'more', 'than', 'one', 'value']
};

stream.respond(headers);
```
传递给回调函数的`Headers`对象将具有空原型。这意味着像`object.prototype.toString()`和`object.prototype.hasOwnProperty()`这样的普通JavaScript对象方法将不起作用。

对于传入消息头：
* `:status` 将转为数字
* 重复的 `:status, :method, :authority, :scheme, :path, :protocol, age, authorization, access-control-allow-credentials, access-control-max-age, access-control-request-method, content-encoding, content-language, content-length, content-location, content-md5, content-range, content-type, date, dnt, etag, expires, from, if-match, if-modified-since, if-none-match, if-range, if-unmodified-since, last-modified, location, max-forwards, proxy-authorization, range, referer,retry-after, tk, upgrade-insecure-requests, user-agent or x-content-type-options` 将被丢弃.
* `set cookie`始终是一个数组。重复项将添加到数组中。
* 对于重复的`cookie`头，the values are joined together with '; '。
* 对于所有其他头文件，这些值都用','连接在一起。

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