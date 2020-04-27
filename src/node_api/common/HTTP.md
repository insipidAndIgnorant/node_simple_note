## HTTP响应码
| code | 说明 |
|:-- |:-- |
| 100 Continue | 目前为止一切正常, 客户端应该继续请求, 如果已完成请求则忽略. |
| 101 Switching Protocol（协议切换）| 服务器应客户端升级协议的请求（Upgrade请求头）正在进行协议切换 |
| 200 OK | 请求已经成功. PUT 和 DELETE 的请求成功通常并不是响应200 OK的状态码而是 204 No Content (或 201 Created )。 |
| 201 Created | 请求已经被成功处理，并且创建了新的资源。新的资源在应答返回之前已经被创建。同时新增的资源会在应答消息体中返回，其地址或者是原始请求的路径，或者是 Location 首部的值 |
| 202 Accepted | 服务器端已经收到请求消息，但是尚未进行处理 |
| 203 Non-Authoritative Information | 请求已经成功被响应，但是获得的负载与源头服务器的状态码为 200 (OK)的响应相比，经过了拥有转换功能的 proxy （代理服务器）的修改|
| 205 Reset Content | 通知客户端重置文档视图，比如清空表单内容、重置 canvas 状态或者刷新用户界面 |
| 206 Partial Content | 请求已成功，并且主体包含所请求的数据区间，该数据区间是在请求的 Range 首部指定的 |
| 300 Multiple Choices | 表示重定向的响应状态码，表示该请求拥有多种可能的响应。用户代理或者用户自身应该从中选择一个。 |
| 301 Moved Permanently | 永久重定向, 请求的资源已经被移动到了由 Location 头部指定的url上，是固定的不会再改变。 |
| 302 Found | 资源被暂时的移动到了由Location 头部指定的 URL 上。 http/1.0 302未得到用户确定时不允许转换请求方法，但浏览器默认转GET,与303表象一致，307与302描述一致 |
| 303 See Other | 通常作为 PUT 或 POST 操作的返回结果，它表示重定向链接指向的不是新上传的资源，而是另外一个页面，比如消息确认页面或上传进度页面 |
| 304 Not Modified | 无需再次传输请求的内容，也就是说可以使用缓存的内容。|
| 307 Temporary Redirect | 请求的资源暂时地被移动到  Location 首部所指向的 URL 上 |
| 308 Permanent Redirect | 永久重定向， 资源已经被永久的移动到了由 Location 首部指定的 URL 上。301 情况下，请求方法有时候会被客户端错误地修改为 GET 方法。|
| 400 Bad Request | 由于语法无效，服务器无法理解该请求 | 401 Unauthorized | 客户端错误，指的是由于缺乏目标资源要求的身份验证凭证，发送的请求未得到满足。类似 403， 但是在该情况下，依然可以进行身份验证 |
| 402 Payment Required | 非标准，表示付费之后才会有内容 |
| 403 Forbidden | 客户端错误，指的是服务器端有能力处理该请求，但是拒绝授权访问 |
| 404 Not Found | 服务器未找到相应资源，并不能说明请求的资源是临时还是永久丢失 |
| 405 Method Not Allowed | 服务器禁止了使用当前 HTTP 方法的请求。GET 与 HEAD 两个方法不得被禁止，当然也不得返回状态码 405 |
| 406 Not Acceptable | 客户端错误，指代服务器端无法提供与  Accept-Charset 以及 Accept-Language 消息头指定的值相匹配的响应。|
| 407 Proxy Authentication Required | 客户端错误，指的是由于缺乏位于浏览器与可以访问所请求资源的服务器之间的代理服务器（proxy server ）要求的身份验证凭证，发送的请求尚未得到满足。|
| 408 Request Timeout | 服务器想要将没有在使用的连接关闭。**一些服务器会在空闲连接上发送此信息，即便是在客户端没有发送任何请求的情况下**。|
| 409 Conflict | 请求与服务器端目标资源的当前状态相冲突，例如PUT更新了一个较旧的资源 |
| 410 Gone | 请求的内容在服务器上不存在了，同时是永久性的丢失 410 响应默认会被缓存 |
| 411 Length Required | 客户端错误，表示由于缺少确定的Content-Length 首部字段，服务器拒绝客户端的请求。 |
| 412 Precondition Failed | 先决条件失败 客户端错误，意味着对于目标资源的访问请求被拒绝 |
| Payload Too Large | 请求主体的大小超过了服务器愿意或有能力处理的限度，服务器可能会（may）关闭连接以防止客户端继续发送该请求 |
| 414 URI Too Long | 客户端所请求的 URI 超过了服务器允许的范围 |
| 415 Unsupported Media Type | 服务器由于不支持其有效载荷的格式，从而拒绝接受客户端的请求 |
| 416 Range Not Satisfiable | 服务器无法处理所请求的数据区间。最常见的情况是所请求的数据区间不在文件范围之内 |
| 417 Expectation Failed | 客户端错误，意味着服务器无法满足 Expect 请求消息头中的期望条件 |
| 418 I'm a teapot | 该错误是超文本咖啡壶控制协议的参考，和 1998 年愚人节的玩笑。|
| 422 Unprocessable Entity | 服务器理解请求实体的内容类型，并且请求实体的语法是正确的，但是服务器无法处理所包含的指令 |
| 425 Too Early | 服务器不愿意冒风险来处理该请求，原因是处理该请求可能会被“重放”，从而造成潜在的重放攻击。 重放攻击： 通过延缓/重放窃取数据 |
| 426 Upgrade Required | 服务器拒绝处理客户端使用当前协议发送的请求，但是可以接受其使用升级后的协议发送的请求 |
| 428 Precondition Required | 服务器端要求发送条件请求。一般的，这种情况意味着必要的条件首部——如 If-Match ——的缺失|
| 429 Too Many Requests | 在一定的时间内用户发送了太多的请求，即超出了“频次限制” |
| 431 Request Header Fields Too Large | 由于请求中的首部字段的值过大，服务器拒绝接受客户端的请求。客户端可以在缩减首部字段的体积后再次发送请求。|
| 451 Unavailable For Legal Reasons | 因法律原因不可用, 服务器由于法律原因，无法提供客户端请求的资源 |
| 500 Internal Server Error | 服务器端错误的响应状态码，意味着所请求的服务器遇到意外的情况并阻止其执行请求 |
| 501 Not Implemented | 表示请求的方法不被服务器支持，因此无法被处理。501 响应默认是可缓存的。 |
| 502 Bad Gateway | 表示作为网关或代理角色的服务器，从上游服务器（如tomcat、php-fpm）中接收到的响应是无效的 |
| 503 Service Unavailable | 服务器尚未处于可以接受请求的状态 |
| 504 Gateway Timeout | 表示扮演网关或者代理的服务器无法在规定的时间内获得想要的响应 |
| 505 HTTP Version Not Supported | 服务器不支持请求所使用的 HTTP 版本。 |
| 506 Variant Also Negotiates | 表示内部服务器配置错误，其中所选变量/变元自身被配置为参与内容协商，因此并不是合适的协商端点。 |
| 507 Insufficient Storage | 服务器不能存储相关内容。准确地说，一个方法可能没有被执行，因为服务器不能存储其表达形式，这里的表达形式指：方法所附带的数据，而且其请求必需已经发送成功。|
| 508 Loop Detected | 表示服务器中断一个操作，因为它在处理具有“Depth: infinity”的请求时遇到了一个无限循环。508码表示整个操作失败。|
| 510 Not Extended  | 一个客户端可以发送一个包含扩展声明的请求，该声明描述了要使用的扩展。如果服务器接收到这样的请求，但是请求不支持任何所描述的扩展，那么服务器将使用510状态码进行响应 |
| 511 Network Authentication Required | 表示客户端需要通过验证才能使用该网络。|



<br/><br/><br/>


next: Access-Control-Expose-Headers


## 通用首部
| 响应头 | 说明 | 实例 |
|:-- |:-- |:-- |



<br/><br/><br/>

## reqest首部
| 响应头 | 说明 | 实例 |
|:-- |:-- |:-- |
| Accept | 告知（服务器）客户端可以处理的内容类型 | Accept: text/html, application/xhtml+xml|
| Accept-Charset | 告知（服务器）客户端可以处理的字符集类型。| Accept-Charset: utf-8, iso-8859-1;q=0.5, *;q=0.1 |
| Accept-Encoding | 客户端能够理解的内容编码方式—进行通知（给服务端）| Accept-Encoding: br;q=1.0, gzip;q=0.8, *;q=0.1 |
| Accept-Language | 允许客户端声明它可以理解的自然语言，以及优先选择的区域方言 | Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7 |















<br/><br/><br/>


## response首部
| 响应头 | 说明 | 实例 |
|:-- |:-- |:-- |
| Access-Control-Allow-Origin | 指定哪些网站可以跨域资源共享 | Access-Control-Allow-Origin: * |
| Accpet-Patch | 服务器支持的补丁文档格式 | Accept-Patch:text/exa,ple;charset=utf-8 |
| Accept-Ranges | 服务器支持的内容范围 | Accept-Ranges: bytes |
| Access-Control-Allow-Credentials | 是否可以将对请求的响应暴露给页面。返回true则可以，其他值均不可以 | Access-Control-Allow-Credentials: true |
| Access-Control-Allow-Headers |用于 preflight request （预检请求）中，列出了将会在正式请求的 Access-Control-Request-Headers 字段中出现的首部信息 | Access-Control-Allow-Headers: X-Custom-Header, Upgrade-Insecure-Requests |
| Access-Control-Allow-Methods | 预检请求的应答中明确了客户端所要访问的资源允许使用的方法或方法列表 | Access-Control-Allow-Methods: POST, GET, OPTIONS |
| Age | 响应在代理中缓存的时间,单位sec | Age: 1000 |
| Allow | 对资源的有效操作 | Allow: GET,POST,PUT |
| Cache-control | 告知客户端缓存机制。不支持缓存或缓存的时间sec | Cache-control: no-cache |
| Connection | 针对该连接的所有预期的选项,即当client和server通信时对于长链接如何进行处理 | Connection: Close |
| Content-Disposition | 针对已知MINI资源类型的描述，浏览器可以据此决定响应动作，如下载或打开 | Content-Disposition:attachment,filename="a.txt" |
| Content-Encoding | 资源的编码类型 | Content-Encoding: gzip |
| Content-language | 资源使用语言 | Content-language: zh-cn |
| Content-Length | 消息的长度，用十进制数字表示的八位字节的数目。 | Content-Length: 345 |
| Content-Location | Content-Location 首部指定的是要返回的数据的地址选项。最主要的用途是用来指定要访问的资源经过[内容协商](#contentNegotiation)后的结果的URL。 | Content-Location: /index.html |
| Content-MD5 | 消息体的md5散列值，base64编码 | Content-MD5: IDKOiSsGsvjkKJHkjKbg|
| Content-Range | 如果相应的是部分消息，则表示属于完整消息的哪个部分 | Content-Range: bytes12020-47021/47022 |
| Content-Type | 当前内容的MINI类型 | Content-Type: text/html,charset:utf-8 |
| Date | 此消息被发送的时间 | Date:Wed,18 Jul 2018 21:01:33 GTM |
| Etag | 资源特定版本的标志符，用于缓存比较 |Etag:977823cd9080da09vsd89kj923jhkb8df8 |
| Expires | 指定在此时候之后，响应过期。无效的日期，代表已经过期。如果在Cache-Control响应头设置了 "max-age" 或者 "s-max-age" 指令，那么 Expires 头会被忽略。| Expires: Wed, 21 Oct 2015 07:28:00 GMT |
| Last-Modified | 请求对象最后的修改时间 | Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT |
| Link | HTTP实体报头 Link 提供了序列化HTTP头部链接的方法。它在语义上与HTML元素 \<link\> 相等 | Link: \<https://example.com\>; rel="preload" |
| Location | Location 首部指定的是需要将页面重新定向至的地址。一般在响应码为3xx的响应中才会有意义。指定的是一个重定向请求的目的地址,Content-Location是资源的直接地址| Location: /index.html |
| Proxy-Authenticate | 指定了获取 proxy server （代理服务器）上的资源访问权限而采用的身份验证方式。| Proxy-Authenticate: Basic realm="Access to the internal site" | 
| Public-Key-pins | 包含该Web 服务器用来进行加密的 public key （公钥）信息 ，以此来降低使用伪造证书进行 MITM（中间人攻击）的风险。|Public-Key-Pins:pin-sha256="cUPcTAZWKaASuYWhhneDttWpY3oBAkE3h2+soZS7sWs="; pin-sha256="M8HztCzM3elUxkcjR2S5P4hhyBNf6lHkmjAHKhpGPWE="; max-age=5184000; includeSubDomains; report-uri="https://www.example.org/hpkp-report" |
| Refresh | 用于重定向或者当一个新的资源被创建时默认在5秒后刷新重定向 | Refresh: 5;url=http://www.baidu.com |
| Retry-After | 用户代理需要等待多长时间之后才能继续发送请求 | Retry: 5 |
| Server | 服务器名称 | Server:nginx/1.6.3 |
| Set-cookie | 设置cookie,设置在请求的域名下 | Set-cookie: user_name=garrett;user_id=001|
| Trailer | Trailer 是一个响应首部，允许发送方在分块发送的消息后面添加额外的元信息，这些元信息可能是随着消息主体的发送动态生成的，比如消息的完整性校验，消息的数字签名，或者消息经过处理之后的最终状态等。 | Trailer: header-names ( Content-Length等不允许出现) |
| Transfer-encoding | 表示实体传输给用户的编码形式，包括：chunked,compress,deflate,gzip,identify等 | Transfer-encoding: chunked |
| Upgrade | 要求用户升级到另外一个高版本的协议 | Upgrade:HTTP/2.0,SHTTP/1.3,IRC/6.9,RTA/X11 |
| Vary | 决定了对于未来的一个请求头，应该用一个缓存的回复(response)还是向源服务器请求一个新的回复。 | Vary : \<header-name\>, \<header-name\>, ... |
| Vis | 告知代理服务器的客户端，当前的响应式通过什么途径发送的 | Vis:1.0 FRED, 1.1 baidu.com |



<br/><br/><br/>

## <span id="contentNegotiation">内容协商</span>
一份特定的文件称为一项资源。当客户端获取资源的时候，会使用其对应的 URL 发送请求。服务器通过这个 URL 来选择它指向的资源的某一变体——每一个变体称为一种展现形式——然后将这个选定的展现形式返回给客户端。整个资源，连同它的各种展现形式，共享一个特定的 URL 。当一项资源被访问的时候，特定展现形式的选取是通过内容协商机制来决定的，并且客户端和服务器端之间存在多种协商方式。

* 服务端驱动型内容协商机制  
浏览器（或者其他任何类型的用户代理）会随同 URL 发送一系列的消息头。这些消息头描述了用户倾向的选择。服务器则以此为线索，通过内部算法来选择最佳方案提供给客户端。

* 代理驱动型内容协商机制  
当面临不明确的请求时，服务器会返回一个页面，其中包含了可供选择的资源的链接。资源呈现给用户，由用户做出选择。