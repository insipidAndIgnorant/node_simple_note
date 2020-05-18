# path
path 模块提供了一些用于处理文件与目录的路径的实用工具

## Windows 与 POSIX 的对比
path 模块的默认操作会因 Node.js 应用程序运行所在的操作系统而异。 具体来说，当在 Windows 操作系统上运行时， path 模块会假定正被使用的是 Windows 风格的路径。

因此，使用 `path.basename()` 可能会在 POSIX 和 Windows 上产生不同的结果：
```js
// posix
path.basename('C:\\temp\\myfile.html');
// 返回: 'C:\\temp\\myfile.html'

// windows
path.basename('C:\\temp\\myfile.html');
// 返回: 'myfile.html'
console.log(path.resolve('C:\\'))
```

如果要在任意操作系统上使用 Windows 文件路径时获得一致的结果，则使用 `path.win32`

如果要在任意操作系统上使用 POSIX 文件路径时获得一致的结果，则使用 `path.posix`

在 Windows 上，Node.js 遵循独立驱动器工作目录的概念。 当使用没有反斜杠的驱动器路径时，可以观察到此行为。 例如， `path.resolve('C:\\')` 可能会返回与 `path.resolve('C:')` 不同的结果。


### **path.basename(p: string, ext?: string): string**
`path.basename()` 方法返回 `p` 的最后一部分，类似于 Unix 的 basename 命令。 尾部的目录分隔符将被忽略
```js
path.basename('/foo/bar/baz/asdf/quux.html');
// 返回: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// 返回: 'quux'
```
如果 `p` 不是字符串、或给定了 `ext` 但不是字符串，则抛出 TypeError。

### **path.delimiter: string**
提供平台特定的路径定界符：
* ; 用于 Windows
* : 用于 POSIX
```js
console.log(process.env.PATH);
// posix
// 打印: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

// windows
// 打印: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'
```

### **path.dirname(path: string): string**
`path.dirname()` 方法返回 `path` 的目录名，类似于 Unix 的 dirname 命令。 尾部的目录分隔符将被忽略
```js
path.dirname('/foo/bar/baz/asdf/quux');
// 返回: '/foo/bar/baz/asdf'
```
如果 `path` 不是字符串，则抛出 TypeError。

### **path.extname(path: string): string**
`path.extname()` 方法返回 `path` 的扩展名，从最后一次出现 `.`（句点）字符到 `path` 最后一部分的字符串结束。 如果在 `path` 的最后一部分中没有 `.` ，或者如果 `path` 的基本名称（参见 `path.basename()`）除了第一个字符以外没有 `.`，则返回空字符串。
```js
path.extname('index.html');
// 返回: '.html'

path.extname('index.coffee.md');
// 返回: '.md'

path.extname('index.');
// 返回: '.'

path.extname('index');
// 返回: ''

path.extname('.index');
// 返回: ''

path.extname('.index.md');
// 返回: '.md'
```

### **path.format(pathObject: FormatInputPathObject): string**
* pathObject
  * dir?: string
  * root?: string
  * base?: string
  * ext?: string
  * name?: string

`path.format()` 方法从对象返回路径字符串。 与 `path.parse()` 相反

当为 `pathObject` 提供属性时，注意以下组合，其中一些属性优先于另一些属性：
* 如果提供了 `pathObject.dir`，则忽略 `pathObject.root`。
* 如果 `pathObject.base` 存在，则忽略 `pathObject.ext` 和 `pathObject.name`。

```js
// posix
// 如果提供了 `dir`、 `root` 和 `base`，
// 则返回 `${dir}${path.sep}${base}`。
// `root` 会被忽略。
path.format({
  root: '/ignored',
  dir: '/home/user/dir',
  base: 'file.txt'
});
// 返回: '/home/user/dir/file.txt'

// 如果未指定 `dir`，则使用 `root`。 
// 如果只提供 `root`，或 'dir` 等于 `root`，则将不包括平台分隔符。 
// `ext` 将被忽略。
path.format({
  root: '/',
  base: 'file.txt',
  ext: 'ignored'
});
// 返回: '/file.txt'

// 如果未指定 `base`，则使用 `name` + `ext`。
path.format({
  root: '/',
  name: 'file',
  ext: '.txt'
});
// 返回: '/file.txt'


// windows
path.format({
  dir: 'C:\\path\\dir',
  base: 'file.txt'
});
// 返回: 'C:\\path\\dir\\file.txt'
```

### **path.isAbsolute(path: string): boolean**
`path.isAbsolute()` 方法检测 `path` 是否为绝对路径。如果给定的 `path` 是零长度字符串，则返回 false。
```js
// posix
path.isAbsolute('/foo/bar'); // true
path.isAbsolute('/baz/..');  // true
path.isAbsolute('qux/');     // false
path.isAbsolute('.');        // false

// windows
path.isAbsolute('//server');    // true
path.isAbsolute('\\\\server');  // true
path.isAbsolute('C:/foo/..');   // true
path.isAbsolute('C:\\foo\\..'); // true
path.isAbsolute('bar\\baz');    // false
path.isAbsolute('bar/baz');     // false
path.isAbsolute('.');           // false
```

### **path.join(...paths: string[]): string**
`path.join()` 方法使用平台特定的分隔符作为定界符将所有给定的 `path` 片段连接在一起，然后规范化生成的路径。

零长度的 `path` 片段会被忽略。 如果连接的路径字符串是零长度的字符串，则返回 `'.'`，表示当前工作目录。
```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// 返回: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar');
// 抛出 'TypeError: Path must be a string. Received {}'

// path.reslove以根目录为起点，path.join先拼接再path.normalize(path)
```

### **path.normalize(path: string): string**
`path.normalize()` 方法规范化给定的 `path`，解析 `'..'` 和 `'.'` 片段。

当找到多个连续的路径段分隔字符时（例如 POSIX 上的 /、Windows 上的 \ 或 /），则它们将被替换为单个平台特定的路径段分隔符（POSIX 上的 /、Windows 上的 \）。 尾部的分隔符会保留。

如果 path 是零长度的字符串，则返回 `'.`，表示当前工作目录。

```js
// posix
path.normalize('/foo/bar//baz/asdf/quux/..');
// 返回: '/foo/bar/baz/asdf'

// windows
path.normalize('C:\\temp\\\\foo\\bar\\..\\');
// 返回: 'C:\\temp\\foo\\'
path.win32.normalize('C:////temp\\\\/\\/\\/foo/bar');
// 返回: 'C:\\temp\\foo\\bar'
```

### **path.parse(path: string): FormatInputPathObject**
`path.parse()` 方法返回一个对象，其属性表示 `path` 的重要元素。 尾部的目录分隔符将被忽略
```js
path.parse('/home/user/dir/file.txt');
// 返回:
// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }

// ┌─────────────────────┬────────────┐
// │          dir        │    base    │
// ├──────┬              ├──────┬─────┤
// │ root │              │ name │ ext │
// "  /    home/user/dir / file  .txt "
// └──────┴──────────────┴──────┴─────┘



// windows
path.parse('C:\\path\\dir\\file.txt');
// 返回:
// { root: 'C:\\',
//   dir: 'C:\\path\\dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }

// ┌─────────────────────┬────────────┐
// │          dir        │    base    │
// ├──────┬              ├──────┬─────┤
// │ root │              │ name │ ext │
// " C:\      path\dir   \ file  .txt "
// └──────┴──────────────┴──────┴─────┘
```

### **path.posix: PlatformPath**
`path.posix` 属性提供对 `path` 方法的 POSIX 特定实现的访问

### **path.win32: PlatformPath**
`path.posix` 属性提供对 `path` 方法的 Windows 特定实现的访问


### **path.relative(from: string, to: string): string**
`path.relative()` 方法根据当前工作目录返回 `from` 到 `to` 的相对路径。 如果 `from` 和 `to` 各自解析到相同的路径（分别调用 `path.resolve()` 之后），则返回零长度的字符串。

如果将零长度的字符串传入 `from` 或 `to`，则使用当前工作目录代替该零长度的字符串。

```js
// posix
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
// 返回: '../../impl/bbb'


// windows
path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb');
// 返回: '..\\..\\impl\\bbb'
```

### **path.resolve(...pathSegments: string[]): string**
`path.resolve()` 方法将路径或路径片段的序列解析为绝对路径。

给定的路径序列从右到左进行处理，每个后续的 `path` 前置，直到构造出一个绝对路径。 例如，给定的路径片段序列：`/foo、 /bar、 baz`，调用 `path.resolve('/foo', '/bar', 'baz')` 将返回 `/bar/baz`。

如果在处理完所有给定的 `path` 片段之后还未生成绝对路径，则再加上当前工作目录。

生成的路径已规范化，并且除非将路径解析为根目录，否则将删除尾部斜杠。

零长度的 `path` 片段会被忽略。

如果没有传入 `path` 片段，则 `path.resolve()` 将返回当前工作目录的绝对路径
```js
path.resolve('/foo/bar', './baz');
// 返回: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/');
// 返回: '/tmp/file'

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
// 如果当前工作目录是 /home/myself/node，
// 则返回 '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

### **path.sep: string**
提供平台特定的路径片段分隔符：
* Windows 上是 `\`。
* POSIX 上是 `/`。

```js
// posix
'foo/bar/baz'.split(path.sep);
// 返回: ['foo', 'bar', 'baz']

// widows
'foo\\bar\\baz'.split(path.sep);
// 返回: ['foo', 'bar', 'baz']
```
在 Windows 上，正斜杠（/）和反斜杠（\）都被接受为路径片段分隔符。 但是， path 方法只添加反斜杠（\）。

### **path.toNamespacedPath(path: string): string**
仅在 Windows 系统上，返回给定 `path` 的等效名称空间前缀路径。 如果 `path` 不是字符串，则将返回 `path` 而不进行修改。

此方法仅在 Windows 系统上有意义。 在 POSIX 系统上，该方法不可操作，并且始终返回 `path` 而不进行修改。
