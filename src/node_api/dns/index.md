# dns
dns 模块用于启用名称解析。 例如，使用它来查找主机名的 IP 地址。 

尽管以域名系统（DNS）命名，但它并不总是使用 DNS 协议进行查找。 `dns.lookup()` 使用操作系统功能来执行名称解析。 它可能不需要执行任何网络通信。 希望以与同一操作系统上其他应用程序相同的方式执行名称解析的开发者应使用 `dns.lookup()`。

dns 模块中的所有其他函数都连接到实际的 DNS 服务器以执行名称解析。它们将会始终使用网络执行 DNS 查询。 这些函数不使用与 `dns.lookup()` 使用的同一组配置文件（例如 `/etc/hosts`）。 这些函数应由不想使用底层操作系统的功能进行名称解析、而希望始终执行 DNS 查询的开发者使用。

## dns.Resolver 类
DNS 请求的独立解析程序。

使用默认的设置创建一个新的解析程序。 使用 resolver.setServers() 为解析程序设置使用的服务器，则不会影响其他的解析程序

### **resolver.cancel()**
取消此解析程序所做的所有未完成的DNS查询。 使用错误码 `ECANCELLED` 调用相应的回调。

### **dns.getServers()**
返回一个用于当前 DNS 解析的 IP 地址字符串的数组，格式根据 `RFC 5952`。 如果使用自定义端口，则字符串将会包括端口部分。

like that:
```js
[
  '4.4.4.4',
  '2001:4860:4860::8888',
  '4.4.4.4:1053',
  '[2001:4860:4860::8888]:1053'
]
```

### dns.lookup(hostname: string, options: LookupAllOptions, callback: (err, addresses) => void)): void
* `hostname` &nbsp;&nbsp; 
* `options` &nbsp;&nbsp; `<number>` | `<Object>`
    * `family` &nbsp;&nbsp; `<number>` &nbsp;&nbsp;  记录的地址族。必须为 4、 6 或 0。0 值表示返回 IPv4 和 IPv6 地址。默认值: 0。
    * `hints` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 一个或多个受支持的 [getaddrinfo](#supportgetaddrinfo) 标志。可以通过按位 `OR` 运算它们的值来传递多个标志。
    * `all` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 当为 `true` 时，则回调将会返回数组中所有已解析的地址。否则，返回单个地址。默认值： `false`。
    * `verbatim` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 当为 `true` 时，则回调按 DNS 解析器返回的顺序接收 IPv4 和 IPv6 地址。当为 `false` 时，则 IPv4 地址放在 IPv6 地址之前。 默认值: 当前为 `false`（地址已重新排序）但预计在不久的将来会发生变化。新代码应使用 `{ verbatim: true }`。
* `callback`        
    * `err` &nbsp;&nbsp; `<Error>`
    * `address` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; IPv4 或 IPv6 地址的字符串表示形式。
    * `family` &nbsp;&nbsp; `<integer>` &nbsp;&nbsp; 4 或 6，表示 address 的地址族，如果地址不是 IPv4 或 IPv6 地址，则为 0。0 可能是操作系统使用的名称解析服务中的错误的指示符。

解析主机名（例如：`'nodejs.cn'`）为第一个找到的 A（IPv4）或 AAAA（IPv6）记录。 所有的 `option` 属性都是可选的。 如果 `options` 是整数，则只能是 4 或 6。 如果 `options` 没有被提供，则 IPv4 和 IPv6 都是有效的。

当 `all` 选项被设置为 `true` 时， `callback` 的参数会变为 `(err, addresses)`，其中 `addresses` 变成一个由 `address` 和 `family` 属性组成的对象数组。

`dns.lookup() `不需要与 DNS 协议有任何关系。 它仅仅是一个连接名字和地址的操作系统功能。 在任何的 Node.js 程序中，它的实现对表现有一些微妙但是重要的影响。 在使用 `dns.lookup()` 之前请花些时间查询实现的[注意事项](#attention)章节。

<span id="supportgetaddrinfo">*支持的 getaddrinfo*</span>     

以下内容可以作为 `hints` 标志传给 `dns.lookup()`。      
* `dns.ADDRCONFIG`: 返回当前系统支持的地址类型。例如，如果当前系统至少配置了一个 IPv4 地址，则返回 IPv4 地址。不考虑回环地址。
* `dns.V4MAPPED`: 如果指定了 IPv6 地址族，但是没有找到 IPv6 地址，则返回 IPv4 映射的 IPv6 地址。在有些操作系统中不支持（例如 FreeBSD 10.1）。

### **dns.lookupService(address: string, port: number, callback: (err: NodeJS.ErrnoException | null, hostname: string, service: string) => void): void**
* `address` &nbsp;&nbsp; `<string>`
* `port` &nbsp;&nbsp; `<number>`
* `callback`
  * `err` &nbsp;&nbsp; `<Error>`
  * `hostname` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 例如 `nodejs.cn`。
  * `service` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 例如 `http`。

使用操作系统的底层 `getnameinfo` 实现将给定的 `address` 和 `port` 解析为主机名和服务。

如果 `address` 不是有效的 IP 地址，则将会抛出 `TypeError`。 `port` 会被强制转换为数字。 如果它不是合法的端口，则抛出 `TypeError`。

### **dns.resolve(hostname: string, rrtype: string, callback: (err, addresses) => void): void**
* `hostname` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 解析的主机名。
* `rrtype` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 资源记录类型。默认值: `'A'`。
* `callback`

使用 DNS 协议将主机名（例如 `'nodejs.cn'`）解析为一个资源记录的数组。 `callback` 函数的参数为 `(err, records)`。 当成功时， `records` 将会是一个资源记录的数组。 它的类型和结构取决于 `rrtype`：

`rrtype` | `records` 包含 | 结果的类型 | 快捷方法
| :-: | :-: | :-: | :-: |
| `'A'` | IPv4 地址 (默认) | `<string>` | `dns.resolve4()` |
| `'AAAA'` | IPv6 地址 | `<string>` | `dns.resolve6()` |
| `'ANY'` | 任何记录 | `<Object>` | `dns.resolveAny()` |
| `'CNAME'` | 规范名称记录 | `<string>` | `dns.resolveCname()` |
| `'MX'` | 邮件交换记录 | `<Object>` | `dns.resolveMx()` |
| `'NAPTR'` | 名称权限指针记录 | `<Object>` | `dns.resolveNaptr()` |
| `'NS'` | 名称服务器记录 | `<string>` | `dns.resolveNs()` |
| `'PTR'` | 指针记录 | `<string>` | `dns.resolvePtr()` |
| `'SOA'` | 开始授权记录 | `<Object>` | `dns.resolveSoa()` |
| `'SRV'` | 服务记录 | `<Object>` | `dns.resolveSrv()` |
| `'TXT'` | 文本记录 | `<string>` | `dns.resolveTxt()` |

当出错时， `err` 是一个 `Error` 对象，其中 `err.code` 是 [DNS 错误码](#errcode) 的一种。

### **dns.resolve4(hostname: string, options: ResolveOptions, callback: (err, addresses) => void): void**
* `hostname` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 需要解析的主机名。
* `options`
  * `ttl` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 记录每一条记录的存活次数 (TTL)。当为 true 时，回调会接收一个带有 TTL 秒数记录的类似 `{ address: '1.2.3.4', ttl: 60 }` 对象的数组，而不是字符串的数组。
* `callback`
  * `err` 
  * `addresses` &nbsp;&nbsp; `<string[]>` | `<Object[]>`

使用 DNS 协议为 `hostname` 解析 IPv4 地址（A 记录）。 `adresses` 参数是传给 `callback` 函数的 IPv4 地址数组（例如：`['74.125.79.104', '74.125.79.105', '74.125.79.106']`）。

### **dns.resolve6(hostname: string, options: ResolveOptions, callback: (err, addresses) => void): void**
* `hostname` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 需要解析的主机名。
* `options`
  * `ttl` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 记录每一条记录的存活次数 (TTL)。当为 true 时，回调会接收一个带有 TTL 秒数记录的类似 `{ address: '1.2.3.4', ttl: 60 }` 对象的数组，而不是字符串的数组。
* `callback`
  * `err` 
  * `addresses` &nbsp;&nbsp; `<string[]>` | `<Object[]>`

使用 DNS 协议为 `hostname` 解析 IPv6 地址（AAAA 记录）。 `adresses` 参数是传给 `callback` 函数的 IPv6 地址数组。

### **dns.resolveAny(hostname: string, callback): viod**
* `hostname` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 需要解析的主机名。
* `callback`
  * `err` 
  * `ret` &nbsp;&nbsp;  `<Object[]>`

使用 DNS 协议解析所有记录（也称为 `ANY` 或 `*` 查询）。 传给 `callback` 函数的 `ret` 参数将会是一个包含各种类型记录的数组。 每个对象都有一个 `callback` 属性，表明当前记录的类型。 根据 `type`，对象上将会显示其他属性：

类型 |属性 |
| :-: | :-: | :-: | :-: |
| `'A'` | `address/ttl` |
| `'AAAA'` | `address/ttl` |
| `'CNAME'` | `value` |
| `'MX'` | 指向 `dns.resolveMx()` |
| `'NAPTR'` | 指向 `dns.resolveNaptr()` |
| `'NS'` | `value` |
| `'PTR'` | `value` |
| `'SOA'` | 指向 `dns.resolveSoa()` |
| `'SRV'` | 指向 `dns.resolveSrv()` |
| `'TXT'` | 这种类型的记录包含一个名为 `entries` 的数组属性，它指向 `dns.resolveTxt()`，例如：`{ entries: ['...'], type: 'TXT' }` |

以下是传给回调的 ret 对象的示例

```js
[ 
  { type: 'A', address: '127.0.0.1', ttl: 299 },
  { type: 'CNAME', value: 'example.com' },
  { type: 'MX', exchange: 'alt4.aspmx.l.example.com', priority: 50 },
  { type: 'NS', value: 'ns1.example.com' },
  { type: 'TXT', entries: [ 'v=spf1 include:_spf.example.com ~all' ] },
  { type: 'SOA',
    nsname: 'ns1.example.com',
    hostmaster: 'admin.example.com',
    serial: 156696742,
    refresh: 900,
    retry: 900,
    expire: 1800,
    minttl: 60 } 
]
```
DNS 服务器运营商可以选择不响应 `ANY` 查询。 调用 `dns.resolve4()`、`dns.resolveMx()` 等单个方法可能更好

### **dns.resolveCname(hostname: string, callback: (err, addresses: string[]) => void): void**
使用 DNS 协议为 `hostname` 解析 CNAME 记录。 传给 callback 函数的 adresses 参数将会包含可用于 `hostname` 的规范名称记录的数组（例如：`['bar.example.com']`）

### **dns.resolveMx(hostname: string, callback: (err, addresses: MxRecord[]) => void): void**
使用 DNS 协议为 `hostname` 解析邮件交换记录（MX 记录）。 传给 `callback` 函数的 `adresses` 参数将会包含具有 `priority` 和 `exchange` 属性的对象的数组（例如：`[{priority: 10, exchange: 'mx.example.com'}, ...]`）。

### **dns.resolveNaptr(hostname: string, callback: (err, addresses: NaptrRecord[]) => void): void**
使用 DNS 协议为 `hostname` 解析基于正则表达式的记录（NAPTR 记录）。 传给 `callback` 函数的 `adresses` 参数将会包含具有以下属性的对象数组：
* `flags`
* `service`
* `regexp`
* `replacement`
* `order`
* `preference`
  
example:
```js
{
  flags: 's',
  service: 'SIP+D2U',
  regexp: '',
  replacement: '_sip._udp.example.com',
  order: 30,
  preference: 100
}
```

### **dns.(hostname: string, callback: (err, addresses: string[]) => void): void**
使用 DNS 协议为 `hostname` 解析名称服务器记录（NS 记录）。 传给 `callback` 函数的 `adresses` 参数将会包含用于 `hostname` 的有效的名称服务器记录的数组（例如 `['ns1.example.com', 'ns2.example.com']`）。

### **dns.resolvePtr(hostname: string, callback: (err, addresses: string[]) => void): void**
使用 DNS 协议为 `hostname` 解析指针记录（PTR 记录）。 传给 `callback` 函数的 `addresses` 参数将会是一个包含回复记录的字符串数组。

### **dns.resolveSoa(hostname: string, callback: (err, address: SoaRecord) => void): void**
使用 DNS 协议为 `hostname` 解析开始权限记录（SOA 记录）。 传给 `callback` 函数的 `addresses` 参数将会是一个具有以下属性的对象：
* `nsname`
* `hostmaster`
* `serial`
* `refresh`
* `retry`
* `expire`
* `minttl`
```js
{
  nsname: 'ns.example.com',
  hostmaster: 'root.example.com',
  serial: 2013101809,
  refresh: 10000,
  retry: 2400,
  expire: 604800,
  minttl: 3600
}
```

### **dns.resolveSrv(hostname: string, callback: (err, addresses: SrvRecord[]) => void): void**
使用 DNS 协议为 `hostname` 解析服务记录（SRV 记录）。 传给 `callback` 函数的 `addresses` 参数将会是一个具有以下属性的对象数组：
* `priority`
* `weight`
* `port`
* `name`
```js
{
  priority: 10,
  weight: 5,
  port: 21223,
  name: 'service.example.com'
}
```

### **dns.resolveTxt(hostname: string, callback: (err, addresses: string[][]) => void): void**
执行一个反向 DNS 查询，将 IPv4 或 IPv6 地址解析为主机名数组。

### **dns.setServers(servers: ReadonlyArray<string>): void**
设置执行 DNS 解析时要使用的服务器的 IP 地址和端口。 `servers` 参数是 `RFC 5952` 格式的地址数组。 如果端口是 IANA 默认的 DNS 端口（53），则可以省略。
```js
dns.setServers([
  '4.4.4.4',
  '[2001:4860:4860::8888]',
  '4.4.4.4:1053',
  '[2001:4860:4860::8888]:1053'
]);
```
如果提供了无效地址，则会抛出错误    
DNS 查询正在进行时，不得调用 `dns.setServers()` 方法。

`dns.setServers()` 方法仅影响 `dns.resolve()`、 `dns.resolve*()` 和 `dns.reverse()`（特别是 `dns.lookup()`）。

这个方法很像 `resolve.conf`。 也就是说，如果尝试使用提供的第一个服务器解析会导致 `NOTFOUND` 错误，则 `resolve()` 方法将不会尝试使用提供的后续服务器进行解析。 仅当较早的 DNS 服务器超时或导致其他一些错误时，才会使用后备 DNS 服务器。
<br/><br/><br/>



## <span id="errcode">错误码</span>

每次 DNS 查询可能返回以下错误码之一:
* `dns.NODATA`: DNS 服务器返回没有数据。
* `dns.FORMERR`: DNS 服务器查询格式错误。
* `dns.SERVFAIL`: DNS 服务器返回常规失败。
* `dns.NOTFOUND`: 域名未找到。(或在如没有可用的文件描述符等情况下查找失败)
* `dns.NOIMP`: DNS 服务器未实行请求的操作。
* `dns.REFUSED`: DNS 服务器拒绝查询。
* `dns.BADQUERY`: 格式错误的 DNS 查询。
* `dns.BADNAME`: 格式错误的主机名。
* `dns.BADFAMILY`: 不提供的地址族
* `dns.BADRESP`: 格式错误的 DNS 回复。
* `dns.CONNREFUSED`: 无法连接 DNS 服务器。
* `dns.TIMEOUT`: 连接 DNS 服务器超时。
* `dns.EOF`: 文件结束。
* `dns.FILE`: 读取文件错误。
* `dns.NOMEM`: 内存溢出。
* `dns.DESTRUCTION`: 通道正被销毁。
* `dns.BADSTR`: 格式错误的字符串。
* `dns.BADFLAGS`: 指定的标记非法。
* `dns.NONAME`: 给定的主机名不是数字。
* `dns.BADHINTS`: 指定提示标志非法。
* `dns.NOTINITIALIZED`: 未执行 c-ares 库初始化。
* `dns.LOADIPHLPAPI`: 加载 `iphlpapi.dll` 错误。
* `dns.ADDRGETNETWORKPARAMS`: 找不到 `GetNetworkParams` 函数。
* `dns.CANCELLED`: DNS 查询取消。
<br/><br/><br/>



## <span id="attention">实现的注意事项</span>

尽管 `dns.lookup()` 和各种变形的 `dns.resolve*()`/`dns.reverse()` 函数有相同的目标，将网络的名字与网络地址联系在一起（反之亦然），但它们的行为是完全不同的。 这些差异虽然微妙但对 Node.js 程序的行为有重大的影响。

### dns.lookup()
在底层，`dns.lookup()` 使用的操作系统设施与大多数其他程序相同。 例如，`dns.lookup()` 几乎总是解析给定的主机名，与 `ping` 命令一样。 在大多数类 POSIX 操作系统中，`dns.lookup()` 函数的行为可以通过改变 `nsswitch.conf` 和 `/` 或 `resolv.conf` 的设置进行改变，但是需要注意改变这些文件就意味着改变所有正在这个操作系统中运行的所有程序的行为。

尽管以异步 JavaScript 的角度来调用 `dns.lookup()`，但在内部 libuv 底层线程池中却是同步的调用 `getaddrinfo`。 这可能会对某些应用程序产生令人惊讶的负面性能影响。

各种网络 API 将会在内部调用 `dns.lookup()` 来解析主机名。 如果这是一个问题，请考虑使用 `dns.resolve()` 并使用地址而不是主机名来将主机名解析为地址。 此外，某些网络 API（例如 `socket.connect()` 和 `dgram.createSocket()` 允许替换默认解析器 `dns.lookup()`。

### dns.resolve()、dns.resolve*() 与 dns.reverse()
这些函数实现与 `dns.lookup()` 截然不同。 它们没有使用 `getaddrinfo` 并且通过网络执行 DNS 查询。 网络通信始终是异步处理的，并且没有使用 libuv 线程池。

因此,这些函数不会像使用 libuv 线程池的 `dns.lookup()` 函数一样会对其它进程有负面影响。

它们不像 `dns.lookup()` 一样使用相同的配置文件。 例如，它们不会使用来自` /etc/hosts` 的配置。
<br/><br/><br/>



## Type

### LookupAddress
```ts
interface LookupAddress {
    address: string;
    family: number;
}
```