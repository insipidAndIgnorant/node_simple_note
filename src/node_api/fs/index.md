# fs 文件系统
`fs` 模块提供了一个 API，用于以模仿标准 POSIX 函数的方式与文件系统进行交互

## 文件路径
大多数 `fs` 操作接受的文件路径可以指定为字符串、`Buffer`、或使用 `file:` 协议的 URL 对象。

字符串形式的路径被解析为标识绝对或相对文件名的 UTF-8 字符序列。 相对路径将相对于 `process.cwd()` 指定的当前工作目录进行解析。

使用 `Buffer` 指定的路径主要用于将文件路径视为不透明字节序列的某些 POSIX 操作系统。 在这样的系统上，单个文件路径可以包含使用多种字符编码的子序列。 与字符串路径一样， `Buffer` 路径可以是相对路径或绝对路径

## URL 对象的支持
对于大多数 `fs` 模块的函数， `path` 或 `filename` 参数可以传入 WHATWG URL 对象。 仅支持使用 `file:` 协议的 URL 对象。

`file:` URL 始终是绝对路径

在 Windows 上，带有主机名的 `file:` URL 转换为 UNC 路径，而带有驱动器号的 `file:` URL 转换为本地绝对路径。 没有主机名和驱动器号的 `file:` URL 将导致抛出错误。
带有驱动器号的 `file:` URL 必须使用 `:` 作为驱动器号后面的分隔符。 使用其他分隔符将导致抛出错误。

在所有其他平台上，不支持带有主机名的 `file:` URL，使用时将导致抛出错误。
包含编码后的斜杆字符（`%2F`）的 `file:` URL 在所有平台上都将导致抛出错误。
在 Windows 上，包含编码后的反斜杆字符（`%5C`）的 `file:` URL 将导致抛出错误。

## 文件描述符
在 POSIX 系统上，对于每个进程，内核都维护着一张当前打开着的文件和资源的表格。 每个打开的文件都分配了一个称为文件描述符的简单的数字标识符。 在系统层，所有文件系统操作都使用这些文件描述符来标识和跟踪每个特定的文件。 Windows 系统使用了一个虽然不同但概念上类似的机制来跟踪资源。 为了简化用户的工作，Node.js 抽象出操作系统之间的特定差异，并为所有打开的文件分配一个数字型的文件描述符。

大多数操作系统限制在任何给定时间内可能打开的文件描述符的数量，因此当操作完成时关闭描述符至关重要。 如果不这样做将导致内存泄漏，最终导致应用程序崩溃。
<br/><br/><br/>



## fs.Dir 类
代表目录流的类。由 `fs.opendir()`、`fs.opendirSync()` 或 `fsPromises.opendir()` 创建。  
以下设 `dir` 为 `fs.Dir` 实例
### **dir.close(): Promise<void>**
异步地关闭目录的底层资源句柄。 随后的读取将会导致错误。
返回一个 `Promise`，将会在关闭资源之后被解决。

### **dir.close(callback: (err) => void): void**
关闭资源句柄之后将会调用 `callback`。

### **dir.closeSync()**

### **dir.path: `<readonly>`string**
此目录的只读路径，与提供给 `fs.opendir()`、`fs.opendirSync()` 或 `fsPromises.opendir()` 的一样。

### **dir.read(): Promise<Dirent | null>**
通过 `readdir` 异步地读取下一个目录项作为 `fs.Dirent`。

读取完成之后，将会返回一个 `Promise`，它被 `reslove` 时将会返回 `fs.Dirent` 或 `null`（如果没有更多的目录项要读取）。

类似 `generator`, `read` 每次会返回 `dir` 内下一个 `dirent`;

**此函数返回的目录项不遵循操作系统的底层目录机制所提供的特定顺序。 遍历目录时添加或删除的目录项可能会或可能不会包含在遍历的结果中。**

### **dir.read(callback: (err, dirent) => void): void**
读取完成之后，将会调用 `callback` 并传入 `fs.Dirent` 或 `null`（如果没有更多的目录项要读取）。

**此函数返回的目录项不遵循操作系统的底层目录机制所提供的特定顺序。 遍历目录时添加或删除的目录项可能会或可能不会包含在遍历的结果中。**

### **dir.readSync(): fs.Dirent**
`read` 同步版

### **dir`[Symbol.asyncIterator]`()**
异步地遍历目录，直到读取了所有的目录项。

异步迭代器返回的目录项始终为 `fs.Dirent`。 **`dir.read()` 中为 `null` 的情况会在内部处理**。
<br/><br/><br/>

## fs.Dirent 类
目录项的表示形式，通过从 `fs.Dir` 中读取而返回。

此外，当使用 `withFileTypes` 选项设置为 `true` 调用 `fs.readdir()` 或 `fs.readdirSync()` 时，生成的数组将会填充 `fs.Dirent` 对象，而不是字符串或 `Buffer`。

###  **dirent.isBlockDevice(): boolean**
如果 `fs.Dirent` 对象描述**块设备**，则返回 `true`。

### **dirent.isCharacterDevice(): boolean**
如果 `fs.Dirent` 对象描述**字符设备**，则返回 `true`。

### **dirent.isDirectory(): boolean**
如果 `fs.Dirent` 对象描述文件系统目录，则返回 `true`。

### **dirent.isFIFO(): boolean**
如果 `fs.Dirent` 对象描述先进先出（FIFO）管道，则返回 `true`。

### **dirent.isFile(): boolean**
如果 `fs.Dirent` 对象描述常规文件，则返回 `true`。

### **dirent.isSocket(): boolean**
如果 `fs.Dirent` 对象描述套接字，则返回 `true`。

### **dirent.isSymbolicLink(): boolean**
如果 `fs.Dirent` 对象描述符号链接，则返回 `true`。

### **dirent.name: string | Buffer**
`fs.Dirent` 对象指向的文件名。 此值的类型取决于传递给 `fs.readdir()` 或 `fs.readdirSync()` 的 `options.encoding`。
<br/><br/><br/>


## fs.FSWatcher 类
继承自 `<EventEmitter>`   
成功调用 `fs.watch()` 方法将会返回一个新的 `fs.FSWatcher` 对象。

每当指定监视的文件被修改时，所有的 `fs.FSWatcher` 对象都会触发 `'change'` 事件。

### **'change' 事件  (eventType,filename): void**
* `eventType` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 已发生的更改事件的类型, `'rename'` 或者 `'change'`
* `filename` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 更改的文件名（如果相关或可用）

**可能不提供 `filename` 参数，这取决于操作系统的支持。** 如果提供了 `filename`，则当调用 `fs.watch()` 并将其 `encoding` 选项设置为 `'buffer'` 时， `filename` 将是一个 `Buffer`，否则 `filename` 将是 UTF-8 字符串。

### **'close' 事件 ():void**
当监视器停止监视更改时触发。 关闭的 `fs.FSWatcher` 对象在事件处理函数中不再可用。

### **'error' 事件 (err):void**
当监视文件时发生错误时触发。 发生错误的 `fs.FSWatcher` 对象在事件处理函数中不再可用。

### **watcher.close()**
给定的 `fs.FSWatcher` 停止监视更改。 一旦停止，则 `fs.FSWatcher` 对象将不再可用。
<br/><br/><br/>


## fs.ReadStream 类
继承自: `<stream.Readable>`
成功调用 `fs.createReadStream()` 将会返回一个新的 `fs.ReadStream` 对象。

### **'close' 事件 ():void**
当 `fs.ReadStream` 的底层文件描述符已关闭时触发。

### **'open' 事件 (fd):void**
当 `fs.ReadStream` 的文件描述符打开时触发。

### **'ready' 事件 ():void**
当 `fs.ReadStream` 准备好使用时触发。

**`'open'` 事件之后立即触发**

### **readStream.bytesRead: number**
到目前为止已读取的字节数。

### **readStream.path: string | Buffer**
流正在读取的文件的路径，由 `fs.createReadStream()` 的第一个参数指定。 如果 `path` 传入字符串，则 `readStream.path` 将是字符串。 如果 `path` 传入 `Buffer`，则 `readStream.path` 将是 `Buffer`。

### **readStream.pending: boolean**
如果底层的文件还未被打开（即在触发 `'ready'` 事件之前），则此属性为 `true`
<br/><br/><br/>



## fs.Stats 类
`fs.Stats` 对象提供了关于文件的信息

从 `fs.stat()`、`fs.lstat()` 和 `fs.fstat()` 及其同步的方法返回的对象都属于此类型。 如果传给这些方法的 `options` 中的 `bigint` 为 `true`，则数值将会为 `bigint` 型而不是 `number` 型，并且该对象将会包含额外的以 `Ns` 为后缀的纳秒精度的属性。
```js
Stats {
  dev: 2114,
  ino: 48064969,
  mode: 33188,
  nlink: 1,
  uid: 85,
  gid: 100,
  rdev: 0,
  size: 527,
  blksize: 4096,
  blocks: 8,
  atimeMs: 1318289051000.1,
  mtimeMs: 1318289051000.1,
  ctimeMs: 1318289051000.1,
  birthtimeMs: 1318289051000.1,
  atime: Mon, 10 Oct 2011 23:24:11 GMT,
  mtime: Mon, 10 Oct 2011 23:24:11 GMT,
  ctime: Mon, 10 Oct 2011 23:24:11 GMT,
  birthtime: Mon, 10 Oct 2011 23:24:11 GMT }



// bigInt版 atimeMs mtimeMs ctimeMs birthtimeMs将更改为Ns后缀并为bigInt
// atime mtime ctime birthtime格式相同
```

### **stats.isBlockDevice():boolean**
如果 `fs.Stats `对象描述块设备，则返回 `true`。

### **stats.isCharacterDevice():boolean**
如果 `fs.Stats` 对象描述字符设备，则返回 `true`。

### **stats.isDirectory():boolean**
如果 `fs.Stats` 对象描述文件系统目录，则返回 `true`。

### **stats.isFIFO():boolean**
如果 `fs.Stats` 对象描述先进先出（FIFO）管道，则返回 `true`。

### **stats.isFile():boolean**
如果 `fs.Stats` 对象描述常规文件，则返回 `true`。

### **stats.isSocket():boolean**
如果 `fs.Stats` 对象描述套接字，则返回 `true`。

### **stats.isSymbolicLink():boolean**
如果 `fs.Stats` 对象描述符号链接，则返回 `true`   
**此方法仅在使用 `fs.lstat()` 时有效。**

### **stats.dev: number | bigint**
包含该文件的设备的数字标识符。

### **stats.ino: number | bigint**
文件系统特定的文件索引节点编号。

### **stats.mode: number | bigint**
描述文件类型和模式的位字段。

### **stats.nlink: number | bigint**
文件存在的硬链接数。

### **stats.uid: number | bigint**
拥有该文件（POSIX）的用户的数字型用户标识符。

### **stats.gid: number | bigint**
拥有该文件（POSIX）的群组的数字型群组标识符。

### **stats.rdev: number | bigint**
如果文件被视为特殊文件，则此值为数字型设备标识符。

### **stats.size: number | bigint**
文件的大小（以字节为单位）

### **stats.blksize: number | bigint**
为此文件分配的块数。

### **stats.atimeMs/Ns: number | bigint**
表明上次访问此文件的时间戳，以 POSIX 纪元以来的毫秒数表示。

### **stats.mtimeMs/Ns: number | bigint**
表明上次修改此文件的时间戳，以 POSIX 纪元以来的毫秒数表示。

### **stats.ctimeMs/Ns: number | bigint**
表明上次更改文件状态的时间戳，以 POSIX 纪元以来的毫秒数表示。

### **stats.birthtimeMs/Ns: number | bigint**
表明此文件的创建时间的时间戳，以 POSIX 纪元以来的毫秒数表示。

### **stats.atime: Date**
表明上次访问此文件的时间戳。

### **stats.mtime: Date**
表明上次修改此文件的时间戳。

### **stats.ctime: Date**
表明上次更改文件状态的时间戳。

### **stats.birthtime: Date**
表示此文件的创建时间的时间戳。


**文件属性的时间值**    
`atimeMs`、 `mtimeM`s、 `ctimeMs` 和 `birthtimeMs` 属性是保存相应时间（以毫秒为单位）的数值。 它们的精度取决于平台。 当将 `bigint: true` 传给生成该对象的方法时，属性将会是 `bigint` 型，否则它们将会是数字型。

`atimeNs`、 `mtimeNs`、 `ctimeNs` 和 `birthtimeNs` 属性是保存相应时间（以纳秒为单位）的 `bigint`。

`atime`、 `mtime`、 `ctime` 和 `birthtime` 是对应时间的 `Date` 对象。 `Date` 值和数值没有关联性。 赋值新的数值、或者改变 `Date` 的值，都将不会影响到对应的属性。

`stat` 对象中的时间具有以下语义:
* `atime` "访问时间" - 上次访问文件数据的时间。由` mknod`、 `utimes` 和 `read`系统调用更改。
* `mtime` "修改时间" - 上次修改文件数据的时间。由 `mknod`、 `utimes` 和 `write` 系统调用更改。
* `ctime` "更改时间" - 上次更改文件状态（修改索引节点数据）的时间。由 `chmod`、 `chown`、 `link`、 `mknod`、 `rename`、 `unlink`、 `utimes`、 `read` 和 `write` 系统调用更改。
* `birthtime` "创建时间" - 创建文件的时间。当创建文件时设置一次。 在不支持创建时间的文件系统上，该字段可能改为保存 `ctime` 或 `1970-01-01T00:00Z`（即 Unix 纪元时间戳 0）。 在这种情况下，该值可能大于 `atime` 或 `mtime`。 在 Darwin 和其他的 FreeBSD 衍生系统上，也可能使用 `utimes` 系统调用将 `atime` 显式地设置为比 `birthtime` 更早的值。
<br/><br/><br/>


## fs.WriteStream 类
继承自 `<stream.Writable>`

### **'close' 事件 ():void**
当 `WriteStream` 的底层文件描述符已关闭时触发。

### **'open' 事件 (fd):void**
当 `WriteStream` 的文件打开时触发

### **'ready' 事件 ():void**
当 `fs.WriteStream `准备好使用时触发。

`'open'` 事件之后立即触发。

### **writeStream.bytesWritten: number**
到目前为止写入的字节数。 不包括仍在排队等待写入的数据。

### **writeStream.path: string | Buffer**
流正在写入的文件的路径，由 `fs.createWriteStream()` 的第一个参数指定。 如果 `path` 传入字符串，则 `writeStream.path` 将是字符串。 如果 `path` 传入 `Buffer`，则 `writeStream.path` 将是 `Buffer`。

### **writeStream.pending: boolean**
如果底层的文件还未被打开（即在触发 `'ready'` 事件之前），则此属性为 `true`。

### **fs.access(path: PathLike, mode: number | undefined, callback: NoParamCallback): void**
* `path` &nbsp;&nbsp; `<string> | <Buffer> | <URL>`
* `mode` &nbsp;&nbsp; `<number>`

可以省略mode参数，默认`fs.constants.F_OK`。

测试用户对 `path` 指定的文件或目录的权限。 `mode` 参数是一个可选的整数，指定要执行的可访问性检查。 `mode` 可选的值参阅[文件可访问性的常量](#access-constance)。 **可以创建由两个或更多个值按位或组成的掩码**（例如 `fs.constants.W_OK` | `fs.constants.R_OK`）。

最后一个参数 `callback` 是一个回调函数，调用时将传入可能的错误参数。 如果可访问性检查失败，则错误参数将是 `Error` 对象。

**在 Windows 上，目录上的访问控制策略（ACL）可能会限制对文件或目录的访问。 但是， `fs.access()` 函数不检查 ACL，因此即使 ACL 限制用户读取或写入路径，也可能报告路径是可访问的。**

### **fs.accessSync(path, mode): Stats**
fs.access同步版

### **fs.appendFile(file: PathLike | number, data: any, options: WriteFileOptions, callback: NoParamCallback):void**
* `file` &nbsp;&nbsp; `<string> | <Buffer> | <URL> | <number>` &nbsp;&nbsp; 文件名或文件描述符。
* `data` &nbsp;&nbsp;  `<string> | <Buffer>` &nbsp;&nbsp; 
* `options`
  * `encoding` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 默认值: 'utf8'
  * `mode` &nbsp;&nbsp; `<integer>` &nbsp;&nbsp; 默认值: `0o666`。
  * `flag` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 参阅支持的[文件系统标志](#sign-constance)。默认值: `'a'`。
* `callback` &nbsp;&nbsp; `() => void`

异步地将数据追加到文件，如果文件尚不存在则创建该文件(如果使用`'a'`, `'a+'`)。 `data` 可以是字符串或 `Buffer`。

如果 `options` 是字符串，则它指定字符编码：   
`fs.appendFile('message.txt', '追加的数据', 'utf8', callback);`

### **fs.appendFileSync(file: PathLike | number, data: any, options?: WriteFileOptions): void**
`appendFile` 同步版

### **fs.chmod(path: PathLike, mode: string | number, callback: NoParamCallback): void**
异步地更改文件的权限。 除了可能的异常，完成回调没有其他参数。

`mode` 参考[文件模式](#mode-constance)。

<span id="simple-mode">**简易构造mode** </span>    
构造 `mode` 更简单的方法是使用三个八进制数字的序列（ 例如 `765`）。 最左边的数字（示例中的 `7`）指定文件所有者的权限。 中间的数字（示例中的 `6`）指定群组的权限。 最右边的数字（示例中的 `5`）指定其他人的权限。

* `7` &nbsp;&nbsp; 可读、可写、可执行
* `6` &nbsp;&nbsp; 可读、可写
* `5` &nbsp;&nbsp; 可读、可执行
* `4` &nbsp;&nbsp; 只读
* `3` &nbsp;&nbsp; 可写、可执行
* `2` &nbsp;&nbsp; 只写
* `1` &nbsp;&nbsp; 只可执行
* `0` &nbsp;&nbsp; 没有权限

**注意事项：在 Windows 上，只能更改写入权限，并且不会实现群组、所有者或其他人的权限之间的区别。**

### **fs.chmodSync(path: PathLike, mode: string | number):void**
`fs.chmod` 同步版

### **fs.chown(path: PathLike, uid: number, gid: number, callback: NoParamCallback): void**
异步地更改文件的所有者和群组。 除了可能的异常，完成回调没有其他参数。

### **fs.chownSync(path: PathLike, uid: number, gid: number): void**
`fs.chown` 同步版

### **fs.close(fd: number, callback:()=>void):void**
异步的 close    
通过任何其他 `fs` 操作在当前正在使用的任何文件描述符（`fd`）上调用 `fs.close()` 可能导致未定义的行为。

### **fs.closeSync(fd: number):void**
`fs.close` 同步版

### **fs.constants**
返回包含文件系统操作常用常量的对象。

### **fs.copyFile(src: PathLike, dest: PathLike, flags?: number, callback: NoParamCallback): void**
* `src` &nbsp;&nbsp; `<string> | <Buffer> | <URL>` &nbsp;&nbsp; 要拷贝的源文件名。
* `dest ` &nbsp;&nbsp; `<string> | <Buffer> | <URL>` &nbsp;&nbsp; 拷贝操作的目标文件名。
* `flags` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 用于拷贝操作的修饰符。默认值: `0`。[拷贝操作修饰符](#copy-constance);
* `callback` &nbsp;&nbsp; `() => void`
  
异步地将 `src` 拷贝到 `dest`。 默认情况下，如果 `dest` 已经存在，则覆盖它。 除了可能的异常，回调函数没有其他参数。 Node.js 不保证拷贝操作的原子性。 如果在打开目标文件用于写入后发生错误，则 Node.js 将尝试删除目标文件。

`flags` 是一个可选的整数，指定拷贝操作的行为。 可以创建由两个或更多个值按位或组成的掩码

### **fs.copyFileSync(src: PathLike, dest: PathLike, flags?: number): void**
`fs.copyFile` 同步版

### **fs.createReadStream(path: PathLike, options?: string | Obect): ReadStream**
* `path` &nbsp;&nbsp; `<string> | <Buffer> | <URL>` &nbsp;&nbsp;
* `options`
  * `flags` &nbsp;&nbsp; `string` &nbsp;&nbsp; [文件系统标志](#sign-constance)。
  * `encoding` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 默认值: `null`。
  * `fd` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认值: `null`。
  * `mode` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认值: `0o666`。
  * `autoClose` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 默认值: `true`。
  * `emitClose` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 默认值: `false`。
  * `start` &nbsp;&nbsp; `<number>`
  * `end` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认值: `Infinity`
  * `highWaterMark` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认值: `64 * 1024`。

与用于可读流的 16 kb 的默认的 `highWaterMark` 不同，此方法返回的流具有 64 kb 的默认的 `highWaterMark`。

`options` 可以包括 `start` 和 `end` 值，以从文件中读取一定范围的字节而不是整个文件。 `start` 和 `end` 都包含在内并从 `0` 开始计数，允许的值在 `[0, Number.MAX_SAFE_INTEGER]` 的范围内。 如果指定了 `fd` 并且省略 `start` 或为 `undefined`，则 `fs.createReadStream()` 从当前的文件位置开始顺序地读取。 `encoding` 可以是 `Buffer` 接受的任何一种字符编码。

如果指定了 `fd`，则 `ReadStream` 将会忽略 `path` 参数并将会使用指定的文件描述符。 **这意味着将不会触发 `'open'` 事件。 `fd` 必须是阻塞的，非阻塞的 fd 应该传给 `net.Socket`**。

如果 `fd` 指向仅支持阻塞读取的字符设备（例如键盘或声卡），则在数据可用之前，读取操作不会完成。 这可以防止进程退出并且流自然地关闭。

默认情况下，流在销毁后将不会触发 `'close'` 事件。 这与其他 `Readable` 流的默认行为相反。 将 `emitClose` 选项设置为 `true` 可更改此行为。

如果 `autoClose` 为 `false`，则即使出现错误，文件描述符也不会被关闭。 应用程序负责关闭它并确保没有文件描述符泄漏。 如果 `autoClose` 设为 `true`（默认的行为），则在 `'error'` 或 `'end'` 事件时文件描述符将会被自动地关闭。

`mode` 用于设置文件模式（权限和粘滞位），但**仅限于创建文件时**。

如果 `options` 是字符串，则它指定字符编码。

### **fs.createWriteStream(path: PathLike, options?: string | Object): WriteStream**
* `path` &nbsp;&nbsp; `<string> | <Buffer> | <URL>` &nbsp;&nbsp;
* `options`
  * `flags` &nbsp;&nbsp; `string` &nbsp;&nbsp; [文件系统标志](#sign-constance)。
  * `encoding` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 默认值: `null`。
  * `fd` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认值: `null`。
  * `mode` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认值: `0o666`。
  * `autoClose` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 默认值: `true`。
  * `emitClose` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 默认值: `false`。
  * `start` &nbsp;&nbsp; `<number>`

`options` 可以包括 `start` 选项，允许在文件的开头之后的某个位置写入数据，允许的值在 `[0, Number.MAX_SAFE_INTEGER]` 的范围内。 若要修改文件而不是覆盖它，则 `flags` 模式需要为 `r+` 而不是默认的 `w `模式。 `encoding` 可以是 `Buffer` 接受的任何一种字符编码。

`autoClose`、`emitClose`、`fd`、`<string>options`与 `createReadStream` 类似

### **fs.existsSync(path: string | Buffer | URL): boolean**
如果路径存在，则返回 `true`，否则返回 `false`。   
虽然 fs.exists() 已废弃，但 fs.existsSync() 不是废弃的。

### **fs.fchmod(fd: number, mode, callback: err => void)**
与 `fs.chmod` 类似，更改文件权限    
`fs.fchmodSync`: `fs.fchmod`同步版

### **fs.lchmod(path: PathLike, mode: string | number, cb:e => void)**
更改文件权限，不解析符号链接    
`fs.lchmodSync`为其同步版

### **fs.fchown(fd: number, uid: number, gid: number, callback: err => void)**
与 `fs.chown`  `fs.lchown`类似， 更改文件所有者   
`fs.fchownSYnc`: `fs.fchown`同步版


### **fs.sync(fd:number, cb: err => void)**
`fsync`把文件描述符`fd`指向的文件缓存在内核中的所有已修改的数据写入文件系统，包含数据与文件元数据（文件大小，文件修改时间等）。但是`fsync`不会写入对指向文件的目录项的修改，也就是说如果新创建了一个文件，要是确保下次能正确读出的话，就需要把所在目录也`fsync`一下。   
`fs.fstatsSync`是其同步版

### **fs.fdatasync(fd: number, cb: err => void)**

`fdatasync` 和`fsync`作用差不多，但是不会写入对下次正确读取文件作用不大的一些元数据（比如上次访问时间，上次修改时间等），但是大小如果改变了，是会写进去的。   
`fs.fdatasyncSync`是同步版，`fs.fdatasync`是异步操作

### **fs.fstat(fd: number, callback: (err, stats) => void)**
与`fs.stats`、`fs.lstats`类似，返回文件信息。   
`fs.fstatsSync`同步版

### **fs.ftruncate(fd: number, len: number | undefined | null, callback: NoParamCallback): void**
截取`len`长度的文件内容，超出部分清空。如果小于`len`则用`\0`填充。可省略`len`,默认0   
`fs.ftruncateSync`是其同步版

### **fs.futimes(fd: number, atime: string | number | Date, mtime: string | number | Date, cb: e => void)**
更改文件描述符指向的对象的文件系统时间戳    
`fs.futimesSync`为其同步版

### **fs.link(existingPath: PathLike, newPath: PathLike, callback: NoParamCallback)**
硬链接文件到新路径， 如果存在，不会覆盖   
`fs.linkSync`为其同步版

### **fs.mkdir(path: PathLike, options: number | string | MakeDirectoryOptions | undefined | null, callback: NoParamCallback)**
* `options` &nbsp;&nbsp;
  * `recursive` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; defalut: `false`
  * `mode` &nbsp;&nbsp; `<string> | <number>` &nbsp;&nbsp; **window不支持**，默认0o777

`options`可以省略。  
在 Windows 上，在根目录上使用 `fs.mkdir()` （即使使用递归参数）也会导致错误。   
`fs.makedirSync`为其同步版

### **fs.mkdtemp(prefix: string, options: { encoding?: BufferEncoding | null } | BufferEncoding | undefined | null, callback: (err: NodeJS.ErrnoException | null, folder: string) => void)**
```ts
type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";
```
创建一个唯一的临时目录。

生成要附加在必需的 `prefix` 后面的六位随机字符，以创建唯一的临时目录。 由于平台的不一致性，请避免在 `prefix` 中以 `X` 字符结尾。 在某些平台上，特别是 BSD，可以返回六个以上的随机字符，并用随机字符替换 `prefix` 中结尾的 `X` 字符。

创建的目录路径作为字符串传给回调的第二个参数。

`fs.mkdtemp()` 方法将六位随机选择的字符直接附加到 `prefix` 字符串。 例如，给定目录 `/tmp`，如果打算在 `/tmp` 中创建临时目录，则 `prefix` 必须在尾部加上特定平台的路径分隔符（`require('path').sep`）。
```js
// 新的临时目录的父目录。
const tmpDir = os.tmpdir();

// 此用法是错误的：
fs.mkdtemp(tmpDir, (err, folder) => {
  if (err) throw err;
  console.log(folder);
  // 输出类似 `/tmpabc123`。
  // 新的临时目录会被创建在文件系统根目录，而不是在 /tmp 目录中。
});

// 此用法是正确的：
const { sep } = require('path');
fs.mkdtemp(`${tmpDir}${sep}`, (err, folder) => {
  if (err) throw err;
  console.log(folder);
  // 输出类似 `/tmp/abc123`。
  // 新的临时目录会被创建在 /tmp 目录中。
});
```
`fs.mkdtempSync`为其同步版

### **fs.open(path: PathLike, flags: string | number, mode: string | number | undefined | null, callback: (err, fd) => void)**
* `path` &nbsp;&nbsp; `<string> | <Buffer> | <URL>`
* `flag` &nbsp;&nbsp; `<string> | <number>` &nbsp;&nbsp; 参阅[支持的文件系统标志](#sign-constance)。默认值: `'r'`。
* `mode` &nbsp;&nbsp; `<string> | <number>` &nbsp;&nbsp; 用于设置文件模式（权限和粘滞位），但仅限于创建文件时。 在 Windows 上，只能操作写权限
* `callback`

有些字符 (`< > : " / \ | ? *`) 在 Windows 上是预留的。 在 NTFS 上，如果文件名包含冒号，则 Node.js 将打开文件系统流。

基于 `fs.open()` 的函数也表现出以上行为，比如 `fs.writeFile()`、 `fs.readFile()` 等。

`fs.openSync`为其同步版

### **fs.opendir(path: string, options: OpenDirOptions, cb: (err: , dir: Dir) => void)**
* `options`
  * `encoding` &nbsp;&nbsp; `<string> | <null>` &nbsp;&nbsp; 默认值: `'utf8'`。
  * `bufferSize` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 当从目录读取时在内部缓冲的目录条目数。值越高，则性能越好，但内存占用更高。默认值: 32
* `callback`

创建一个 `fs.Dir`，其中包含所有用于更进一步读取和清理目录的的函数。`encoding` 选项用于在打开目录和后续的读取操作时设置 path 的字符编码。

`fs.openDirSync`为其同步版

### **fs.read(fd: number,buffer: TBuffer,offset: number,length: number,position: number | null,callback: (err, bytesRead: number, buffer: TBuffer) => void)**
* `fd` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 从 `fd` 指定的文件中读取数据
* `buffer` &nbsp;&nbsp;  `<Buffer> | <TypedArray> | <DataView>` &nbsp;&nbsp; 数据将写入的缓冲区
* `offset` &nbsp;&nbsp; `<number>` &nbsp;&nbsp;  `buffer` 中开始写入的偏移量
* `length` &nbsp;&nbsp; `<number>` &nbsp;&nbsp;  一个整数，指定要读取的字节数
* `position` &nbsp;&nbsp; `<number>` &nbsp;&nbsp;   指定从文件中开始读取的位置。 如果 `position` 为 `null`，则从当前文件位置读取数据，并更新文件位置。 如果 `position` 是整数，则文件位置将保持不变。
* `callback`

`fs.readSync`为其同步版
  
### **fs.readdir(path:PathLike, options:string | Object, callback: (err, files)=>void)**
* `path`
* `options`
  * `encoding` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 默认值: `'utf8'`。
  * `withFileTypes` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp;  默认值: `false`
* `callback`

读取目录的内容。 回调有两个参数 `(err, files)`，其中 `files` 是目录中的文件名的数组（不包括 `'.'` 和 `'..'`）。

可选的 `options` 参数可以是指定编码的字符串，也可以是具有 `encoding` 属性的对象，该属性指定用于传给回调的文件名的字符编码。 如果 `encoding` 设置为 `'buffer'`，则返回的文件名是 `Buffer` 对象。

如果 `options.withFileTypes` 设置为 `true`，则 `files` 数组将包含 `fs.Dirent` 对象。

`fs.readdirSync`为其同步版

### **fs.readFile(path:PathLike, options: string | Object, callback: (err,data)=> void)**
* `options`
  * `encoding` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 默认值: `'utf8'`。
  * `flag` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; [支持的文件系统标志](#sign-constance)  默认值: `r`
* `callback`
  * `err`
  * `data` &nbsp;&nbsp; `<string> | <Buffer>`

异步地读取文件的全部内容。

如果没有指定 `encoding`，则返回原始的 `buffer`。

如果 `options` 是字符串，则它指定字符编码

`fs.readFileSync`为其同步版

当 `path` 是目录时， `fs.readFile()` 与 `fs.readFileSync()` 的行为是特定于平台的。 在 macOS、Linux 和 Windows 上，将返回错误。 在 FreeBSD 上，将返回目录内容的表示

`fs.readFile()` 函数会缓冲整个文件。 为了最小化内存成本，尽可能通过 `fs.createReadStream()` 进行流式传输。

### **fs.readlink(path:PathLike, options: string | Object, callback: (err,linkString)=> void)**
* `options`
  * `encoding` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 默认值: `'utf8'`。

read value of a symbolic link, 读取符号链接的值

可选的 `options` 参数可以是指定编码的字符串，也可以是具有 `encoding` 属性的对象，该属性指定用于传递给回调的链接路径的字符编码。 如果 `encoding` 设置为 `'buffer'`，则返回的 `linkString` 将作为 `Buffer` 对象传入。

`fs.readLinkSync`为其同步版


### **fs.realpath(path:PathLike, options: string | Object, callback: (err,resolvedPath)=> void)**
* `options`
  * `encoding` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 默认值: `'utf8'`。
  
通过解析 `.`、 `..` 和符号链接异步地计算规范路径名。
规范路径名不一定是唯一的。 硬链接和绑定装载可以通过许多路径名暴露文件系统实体。

此函数的行为类似于 `realpath`，但有一些例外
1. 在不区分大小写的文件系统上不执行大小写转换。。
2. 符号链接的最大数量与平台无关，并且通常高于本地 `realpath` 实现支持的数量。

`callback` 有两个参数 `(err, resolvedPath)`。 可以使用 `process.cwd` 来解析相对路径

仅支持可转换为 UTF8 字符串的路径。

可选的 `options` 参数可以是指定编码的字符串，也可以是具有 `encoding` 属性的对象，该属性指定用于传递给回调的路径的字符编码。 如果 `encoding` 设置为 `'buffer'`，则返回的路径将作为 `Buffer` 对象传入。

如果 `path` 解析为套接字或管道，则该函数将返回该对象的系统相关名称。

`fs.realpath.native`与其类似，在 Linux 上，当 Node.js 与 musl libc 链接时，procfs 文件系统必须挂载在 `/proc` 上才能使此功能正常工作。 Glibc 没有这个限制。  
`fs.realpathSync`为其同步版,`fs.realpathSync.native`为`fs.realpath.native`同步版

### **fs.rename(oldPath: PathLike, newPath: PathLike, callback: err => void)**
异步地将 `oldPath` 上的文件重命名为 `newPath` 提供的路径名。 如果 `newPath` 已存在，则**覆盖**它。

`fs.renameSync`为其同步版

### **fs.rmdir(path: PathLike, options: RmDirAsyncOptions, callback: err => void)**
* `options`
  * `maxRetries` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 如果遇到 `EBUSY`、 `EMFILE`、 `ENFILE`、 `ENOTEMPTY` 或 `EPERM` 错误，则 Node.js 将会在每次尝试时以 `retryDelay` 毫秒的线性回退来重试该操作。 此选项表示重试的次数。如果 `recursive` 选项不为 `true`，则忽略此选项。默认值: `0`。
  * `recursive` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 如果为 `true`，则执行递归的目录删除。在递归模式中，如果 `path` 不存在则**不报告错误**，并且在失败时重试操作。默认值: `false`。 ***此属性为实验性***
  * `retryDelay` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 重试之间等待的时间（以毫秒为单位）。如果 `recursive` 选项不为 `true`，则忽略此选项。默认值: `100`。

在文件（而不是目录）上使用 `fs.rmdir()` 会导致在 Windows 上出现 `ENOENT` 错误、在 POSIX 上出现 `ENOTDIR` 错误。

`fs.rmdirSync`为其同步版

### **fs.stat(path:PathLike, options, (err, stats)=>void)**
* `path` &nbsp;&nbsp; `<Buffer> | <string> | <URL>` &nbsp;&nbsp; 
* `options`
  * `bigint` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 
* `callback`

如果出现错误，则错误码是 系统常见错误(参考官网) 之一  
`fs.statSync`是其同步版

### **fs.symlink(target: PathLike, path: PathLike, type?: symlink.Type, callback: err=>void): void**
* `target` &nbsp;&nbsp; `<Buffer> | <string> | <URL>` &nbsp;&nbsp; 
* `path` &nbsp;&nbsp; `<Buffer> | <string> | <URL>` &nbsp;&nbsp; 
* `type` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; `'dir'`、`'file'`、`'junction'`
* `callback`

创建名为`path`链接，指向`taget`。  
`type`参数只在windows起作用，其他会被忽略。若果未设置`type`，则自动检测`target`的类型并使用`dir`或`file`。`target`不存在时使用`file`。windows链接要求目标为绝对路径，`type`为`junction`时`target`自动转为绝对路径

相对目标是相对于链接的父目录。如
```js
fs.symlink('./dir1', './parent/dir2', cb);
// |--parent
// |----dir1
// |----dir2
```
`fs.symlinkSync`为其同步版

### **fs.truncate(path: PathLike, len?: number, callback: err=>void)**
截断文件。`fs.truncateSync`为其同步版


### **fs.unlink(path: PathLike, callback: err=>void)**
删除文件或符号链接  
`fs.unlink`不能用于删除目录，应使用`fs.rmdir`  
`fs.unlinkSync`为其同步版

### **fs.utimes(path: PathLike, atime: string | number | Date, mtime: string | number | Date, callback: NoParamCallback)**
更改`path`指向对象的文件系统时间戳。    
`atime`和`mtime`遵顼以下规则
* 值可以是表示Unix纪元时间的数字、`Date`对象、或类似`1245.6`的数值字符串
* 如果值不能转为数字，或为`NaN`、`Infinity`、`-Infinity`，则抛出错误

`fs.utimesSync`为其同步版

### **fs.watch(filename: PathLike,options?:Object|string, listener:(event: string, filename: string) => void)**
* `options`
  * `persistent` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 指示如果文件已被监视进程是否应该继续运行，默认：`true`
  * `recursive` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 指示是否监听所有子目录，默认`false`，仅在 macOS 和 Windows 上支持
  * `encoding` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 指示用于传给监听器的文件名的编码，默认`utf8`
* `listenter`
  * `event` &nbsp;&nbsp; `<string>`
  * `filename` &nbsp;&nbsp; `<string>` | `<Buffer>`

监视`filename`的变化，`filename`为文件夹或文件  
`options`为可选项，如果是字符串则指定编码。
`event`为`rename`或`change`,`filename`是触发事件的文件的名称  
在大多数平台上，文件名在目录出现或消失时触发`rename`事件。   
监听器回调绑定在`fs.FsWatcher`触发的`onChange`事件，但与`event`的不同

如果底层功能由于某些原因不能使用，则`fs.wacth`将不可用。如使用虚拟化软件(Docker,Vagrant)时，在网络文件系统（NFS，SMB）或主文件系统仍可以使用`fs.watchFile()`,因为使用stat轮询，但是效率很慢不太可靠

**文件名参数**  
仅在linux.macOS.windows和AIX上支持回调中的`filename`,但不能保证一定提供。需要相应处理

### **fs.watchFile(filename: PathLike, options: { persistent?: boolean; interval?: number; } | undefined, listener: (curr: Stats, prev: Stats) => void)**
* `options` &nbsp;&nbsp;
  * `persistent` &nbsp;&nbsp; `<boolean>` &nbsp;&nbsp; 默认`true`
  * `interval` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认5007

要在修改文件（而不仅仅是访问）时收到通知，则需要比较 `curr.mtime` 和 `prev.mtime`。

当` fs.watchFile` 操作导致 `ENOENT` 错误时，它将调用一次监听器，并将所有字段置零（或将日期设为 Unix 纪元）。 如果文件是在那之后创建的，则监听器会被再次调用，且带上最新的 `stat` 对象。 这是 v0.10 之后的功能变化。

当 `fs.watchFile()` 正在监视的文件消失并重新出现时，第二次回调事件（文件重新出现）返回的 `previousStat` 会与第一次回调事件（文件消失）返回的 `previousStat` 相同。    
这种情况发生在:
* 文件被删除，然后又恢复。
* 文件被重命名，然后再第二次重命名回其原来的名称。

使用`fs.watch`比`fs.watchFile`、`fs.unwatchFile`更高效。

### **fs.unwatchFile(filename: PathLike, listener?: (curr: Stats, prev: Stats) => void)**
停止监视`filename`的变换，如果制定了`listener`,则只移除特定监听器，否则移除所有监听器。  
对未被监视的`filename`使用该函数不会报错  

### **fs.write( fd: number,buffer: TBuffer,offset?: number,length?: number,position?: number,callback: (err, written: number, buffer: TBuffer) => void)**
* `fd` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 
* `buffer` &nbsp;&nbsp; `<Buffer> | <TypeArray> | <Dateview>` &nbsp;&nbsp; 
* `offset ` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 
* `length ` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 
* `position ` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 
* `callback `

将 `buffer` 写入到 `fd` 指定的文件。  
`offset` 决定 `buffer` 中要被写入的部位， `length` 是一个整数，指定要写入的字节数。  
`position` 指定文件开头的偏移量（数据应该被写入的位置）。 如果 `typeof position !== 'number'`，则数据会被写入当前的位置  
回调有三个参数 `(err, written, buffer)`，其中 `written` 指定 `buffer` 中被写入的字节数。  

在同一个文件上多次使用 `fs.write()` 且不等待回调是不安全的。 对于这种情况，建议使用 `fs.createWriteStream()`。  
在 Linux 上，当以追加模式打开文件时，写入无法指定位置。 内核会忽略位置参数，并始终将数据追加到文件的末尾。

`fs.writeSync`为其同步版

### **fs.write(fd: number,string: any,position?: number,encoding?: string,callback: (err, written: number, str: string) => void)**
* `fd` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 
* `string` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 
* `position ` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 
* `encoding ` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 默认`'utf8'`
* `callback `
  
将 `string` 写入到 `fd` 指定的文件。 如果 `string` 不是一个字符串，则该值会被强制转换为字符串。  
`encoding` 是期望的字符串编码。  
`position`与另一fs.write类似。  

回调会接收到参数 `(err, written, string)`，其中 `written` 指定传入的字符串中被要求写入的字节数。 *被写入的字节数不一定与被写入的字符串字符数相同*。如`'\u00bd'`是一个字符两个字节

`fs.writeSync`为其同步版

### **fs.writeFile(path: PathLike | number, data: any, options: WriteFileOptions, callback: err=>void)**
* `path` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 文件名或描述符
* `data` &nbsp;&nbsp; `<string> | <Buffer> | <TypedArray> | <DataView>` &nbsp;&nbsp; 要写入数据
* `options`
  * `encoding` &nbsp;&nbsp; `<string> | <null>` &nbsp;&nbsp; 默认值: `'utf8'`。
  * `mode ` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 默认值: `0o666`。
  * `flag  ` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; 参见[支持的文件系统标志](#sign-constance)，默认值: `'w'`。

当 `file` 是一个文件名时，异步地将数据写入到一个文件，*如果文件已存在则覆盖该文件*。 `data` 可以是字符串或 `buffer`。  
当 `file` 是一个文件描述符时，行为类似于直接调用 `fs.write()`（建议使用）。  
如果 `data` 是一个 `buffer`，则 `encoding`选项会被忽略。  
如果 `options` 是一个字符串，则它指定字符编码

**使用 fs.writeFile() 与文件描述符**
当 `file` 是一个文件描述符时，行为几乎与直接调用 `fs.write()` 类似

*与直接调用 `fs.write()` 的区别在于，在某些异常情况下， `fs.write()` 可能只写入部分 `buffer`，需要重试以写入剩余的数据，而 `fs.writeFile()` 将会重试直到数据完全写入（或发生错误）。*

*在文件描述符的情况下，文件不会被替换！* 数据不一定写入到文件的开头，文件的原始数据可以保留在新写入的数据之前和/或之后。
```js
// 如果连续两次调用 fs.writeFile()，首先写入字符串 'Hello'，然后写入字符串 ', World'，则该文件将会包含 'Hello, World'，并且可能包含文件的一些原始数据（取决于原始文件的大小和文件描述符的位置）。 如果使用了文件名而不是描述符，则该文件将会保证仅包含 ', World'。
```
`fs.writeFileSync`为其同步版

### **fs.writev(fd: number,buffers: NodeJS.ArrayBufferView[],position?: number,cb: (err, bytesWritten: number, buffers: NodeJS.ArrayBufferView[]) => void)**
* `fd` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 
* `buffers` &nbsp;&nbsp; `<string>` &nbsp;&nbsp; `TypeArray`,`DateView`
* `position ` &nbsp;&nbsp; `<number>` &nbsp;&nbsp; 
* `callback `

使用 `writev()` 将一个 `ArrayBufferView` 数组写入 `fd` 指定的文件。

`position` 指定文件开头的偏移量（数据应该被写入的位置）。 如果 `typeof position !== 'number'`，则数据会被写入当前的位置

在 Linux 上，当以追加模式打开文件时，写入无法指定位置。 内核会忽略位置参数，并始终将数据追加到文件的末尾。

`fs.writevSync`为其同步版。  
<br/><br/><br/>



## FS 常量
### <span id="access-constance">**文件可访问性的常量**</span>
以下常量适用于 `fs.access()`。
* `F_OK` &nbsp;&nbsp;&nbsp;&nbsp; 表明文件对调用进程可见。 这对于判断文件是否存在很有用，但对 `rwx` 权限没有任何说明。 如果未指定模式，则默认值为该值。
* `R_OK` &nbsp;&nbsp;&nbsp;&nbsp; 表明调用进程可以读取文件。
* `W_OK` &nbsp;&nbsp;&nbsp;&nbsp; 表明调用进程可以写入文件。
* `X_OK` &nbsp;&nbsp;&nbsp;&nbsp; 表明调用进程可以执行文件。 **在 Windows 上无效（表现得像 `fs.constants.F_OK`）**。

### <span id="copy-constance">**文件拷贝的常量**</span>
以下常量适用于 `fs.copyFile()`。
* `COPYFILE_EXCL` &nbsp;&nbsp;&nbsp;&nbsp; 如果目标路径已存在，则拷贝操作将失败。
* `COPYFILE_FICLONE` &nbsp;&nbsp;&nbsp;&nbsp; 拷贝操作将尝试创建写时拷贝链接。 如果底层平台不支持写时拷贝，则使用备选的拷贝机制。
* `COPYFILE_FICLONE_FORCE` &nbsp;&nbsp;&nbsp;&nbsp; 拷贝操作将尝试创建写时拷贝链接。 如果底层平台不支持写时拷贝，则拷贝操作将失败。

### <span id="open-constance">**文件打开的常量**</span>
以下常量适用于 `fs.open()`。
* `O_RDONLY` &nbsp;&nbsp;&nbsp;&nbsp; 表明打开文件用于只读访问。
* `O_WRONLY` &nbsp;&nbsp;&nbsp;&nbsp; 表明打开文件用于只写访问。
* `O_RDWR` &nbsp;&nbsp;&nbsp;&nbsp; 表明打开文件用于读写访问。
* `O_CREAT` &nbsp;&nbsp;&nbsp;&nbsp; 表明如果文件尚不存在则创建该文件。
* `O_EXCL` &nbsp;&nbsp;&nbsp;&nbsp; 表明如果设置了 `O_CREAT` 标志且文件已存在，则打开文件应该失败。
* `O_NOCTTY` &nbsp;&nbsp;&nbsp;&nbsp; 表明如果路径表示终端设备，则打开该路径不应该造成该终端变成进程的控制终端（如果进程还没有终端）。??
* `O_TRUNC` &nbsp;&nbsp;&nbsp;&nbsp; 表明如果文件存在且是常规文件、并且文件成功打开以进行写入访问，则其长度应截断为零。
* `O_APPEND` &nbsp;&nbsp;&nbsp;&nbsp; 表明数据将会追加到文件的末尾。
* `O_DIRECTORY` &nbsp;&nbsp;&nbsp;&nbsp; 表明如果路径不是目录，则打开应该失败。
* `O_NOATIME` &nbsp;&nbsp;&nbsp;&nbsp; 表明文件系统的读取访问将不再导致与文件相关联的 `atime` 信息的更新。 **仅在 Linux 操作系统上可用**。
* `O_NOFOLLOW` &nbsp;&nbsp;&nbsp;&nbsp; 表明如果路径是符号链接，则打开应该失败。
* `O_SYNC` &nbsp;&nbsp;&nbsp;&nbsp; 表明文件是为同步 I/O 打开的，写入操作将会等待文件的完整性。
* `O_DSYNC` &nbsp;&nbsp;&nbsp;&nbsp; 表明文件是为同步 I/O 打开的，写入操作将会等待数据的完整性。
* `O_SYMLINK` &nbsp;&nbsp;&nbsp;&nbsp; 表明打开符号链接自身，而不是它指向的资源。
* `O_DIRECT` &nbsp;&nbsp;&nbsp;&nbsp; 表明将尝试最小化文件 I/O 的缓存效果。
* `O_NONBLOCK` &nbsp;&nbsp;&nbsp;&nbsp; 表明在可能的情况下以非阻塞模式打开文件。
* `UV_FS_O_FILEMAP` &nbsp;&nbsp;&nbsp;&nbsp; 当设置后，将会使用内存文件的映射来访问文件。 **此标志仅在 Windows 操作系统上可用。 在其他操作系统上，此标志会被忽略**。

### <span id="type-constance">**文件类型的常量**</span>
以下常量适用于 `fs.Stats` 对象的 `mode` 属性，用于决定文件的**类型**。
* `S_IFMT` &nbsp;&nbsp;&nbsp;&nbsp; 用于提取文件类型代码的位掩码。
* `S_IFREG` &nbsp;&nbsp;&nbsp;&nbsp; 表示常规文件。
* `S_IFDIR` &nbsp;&nbsp;&nbsp;&nbsp; 表示目录。
* `S_IFCHR` &nbsp;&nbsp;&nbsp;&nbsp; 表示面向字符的设备文件。
* `S_IFBLK` &nbsp;&nbsp;&nbsp;&nbsp; 表示面向块的设备文件。
* `S_IFIFO` &nbsp;&nbsp;&nbsp;&nbsp; 表示 FIFO 或管道。
* `S_IFLNK` &nbsp;&nbsp;&nbsp;&nbsp; 表示符号链接。
* `S_IFSOCK` &nbsp;&nbsp;&nbsp;&nbsp; 表示套接字。
  
### <span id="mode-constance">**文件模式的常量**</span>
以下常量适用于 `fs.Stats` 对象的 `mode` 属性，用于决定文件的**访问权限**。
* `S_IRWXU` &nbsp;&nbsp;&nbsp;&nbsp; 表明所有者可读、可写、可执行。
* `S_IRUSR` &nbsp;&nbsp;&nbsp;&nbsp; 表明所有者可读。
* `S_IWUSR` &nbsp;&nbsp;&nbsp;&nbsp; 表明所有者可写。
* `S_IXUSR` &nbsp;&nbsp;&nbsp;&nbsp; 表明所有者可执行。
* `S_IRWXG` &nbsp;&nbsp;&nbsp;&nbsp; 表明群组可读、可写、可执行。
* `S_IRGRP` &nbsp;&nbsp;&nbsp;&nbsp; 表明群组可读。
* `S_IWGRP` &nbsp;&nbsp;&nbsp;&nbsp; 表明群组可写。
* `S_IXGRP` &nbsp;&nbsp;&nbsp;&nbsp; 表明群组可执行。
* `S_IRWXO` &nbsp;&nbsp;&nbsp;&nbsp; 表明其他人可读、可写、可执行。
* `S_IROTH` &nbsp;&nbsp;&nbsp;&nbsp; 表明其他人可读。
* `S_IWOTH` &nbsp;&nbsp;&nbsp;&nbsp; 表明其他人可写。
* `S_IXOTH` &nbsp;&nbsp;&nbsp;&nbsp; 表明其他人可执行。

[简易构造文件模式](#simple-mode)。

### <span id="sign-constance">**文件系统标志**</span>
当 `flag` 选项采用字符串时，可用以下标志：
* `'a'` - 打开文件用于追加。如果文件不存在，则创建该文件。
* `'ax'` - 与 `'a'` 相似，但如果路径已存在则失败。
* `'a+'` - 打开文件用于读取和追加。如果文件不存在，则创建该文件。
* `'ax+'` - 与 `'a+'` 相似，但如果路径已存在则失败。
* `'as'` - 以同步模式打开文件用于追加。如果文件不存在，则创建该文件。
* `'as+'` - 以同步模式打开文件用于读取和追加。如果文件不存在，则创建该文件。
* `'r'` - 打开文件用于读取。如果文件不存在，则出现异常。
* `'r+'` - 打开文件用于读取和写入。如果文件不存在，则出现异常。
* `'rs+'` - 以同步模式打开文件用于读取和写入。指示操作系统绕过本地的文件系统缓存。
* `'w'` - 打开文件用于写入。如果文件不存在则创建文件，如果文件已存在则截断文件。
* `'wx'` - 与 `'w'` 相似，但如果路径已存在则失败。
* `'w+'` - 打开文件用于读取和写入。如果文件不存在则创建文件，如果文件已存在则截断文件。
* `'wx+'` - 与 `'w+'` 相似，但如果路径已存在则失败。

`flag` 也可以是一个数字，参阅 open 文档。 常用的常量可以从 `fs.constants` 获取。 在 Windows 上，标志会被适当地转换为等效的标志，例如 `O_WRONLY` 转换为 `FILE_GENERIC_WRITE`、 `O_EXCL`|`O_CREAT` 转换为能被 `CreateFileW` 接受的 `CREATE_NEW`。

特有的 `'x'` 标志（ open 中的 `O_EXCL` 标志）可以**确保路径是新创建的**。 在 POSIX 系统上，即使路径是一个符号链接且指向一个不存在的文件，它也会被视为已存在。 该特有标志不一定适用于网络文件系统。

**在 Linux 上，当以追加模式打开文件时，写入无法指定位置。 内核会忽略位置参数，并始终将数据追加到文件的末尾。**

如果要修改文件而不是覆盖文件，则标志模式应为 `'r+'` 模式而不是默认的 `'w'` 模式。

**某些标志的行为是特定于平台的**。 例如，在 macOS 和 Linux 上使用 `'a+'` 标志打开目录会返回一个错误。 而在 Windows 和 FreeBSD 上，则返回一个文件描述符或 FileHandle。
```js
// 在 macOS 和 Linux 上：
fs.open('<目录>', 'a+', (err, fd) => {
  // => [Error: EISDIR: illegal operation on a directory, open <目录>]
});

// 在 Windows 和 FreeBSD 上：
fs.open('<目录>', 'a+', (err, fd) => {
  // => null, <fd>
});
```

在 Windows 上，使用 `'w'` 标志打开现存的隐藏文件（通过 `fs.open()`、 `fs.writeFile()` 或 `fsPromises.open()`）会抛出 `EPERM`。 现存的隐藏文件可以使用 `'r+'` 标志打开用于写入。

调用 `fs.ftruncate()` 或 `fsPromises.ftruncate()` 可以用于重置文件的内容。