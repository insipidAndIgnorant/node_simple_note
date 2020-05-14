# Module
在 Node.js 模块系统中，每个文件都被视为一个独立的模块。

通过在特殊的 `exports` 对象上指定额外的属性，可以将函数和对象添加到模块的根部。

模块内的本地变量是私有的，因为模块由 Node.js 封装在一个函数中（详见[模块封装器](#module-warpper)）。 

模块系统在 `require('module')` 模块中实现。

## <span id="main-module">访问主模块</span>
当 Node.js 直接运行一个文件时， `require.main` 会被设为它的 `module`。 这意味着可以通过 `require.main === module` 来判断一个文件是否被直接运行：

对于 foo.js 文件，如果通过 `node foo.js` 运行则为 true，但如果通过 `require('./foo')` 运行则为 false。

因为 `module` 提供了一个 `filename` 属性（通常等同于 `__filename`），所以可以通过检查 `require.main.filename` 来获取当前应用程序的入口点。

## .mjs 扩展名
不可以 `require()` 具有 `.mjs` 扩展名的文件。 试图这样做会抛出错误。 .mjs 扩展名是保留给 ECMAScript 模块，无法通过 `require()` 加载。 有关更多详细信息，请参见 ECMAScript 模块。


## 缓存
模块在第一次加载后会被缓存。 这也意味着（类似其他缓存机制）如果每次调用 `require('foo')` 都解析到同一文件，则返回相同的对象。

多次调用 `require(foo)` 不会导致模块的代码被执行多次。 这是一个重要的特性。 借助它, 可以返回“部分完成”的对象，从而允许加载依赖的依赖, 即使它们会导致循环依赖。

如果想要多次执行一个模块，可以导出一个函数，然后调用该函数。


## 模块缓存的注意事项
模块是基于其解析的文件名进行缓存的。 由于调用模块的位置的不同，模块可能被解析成不同的文件名（比如从 node_modules 目录加载），这样就不能保证 `require('foo')` 总能返回完全相同的对象。

此外，在不区分大小写的文件系统或操作系统中，被解析成不同的文件名可以指向同一文件，*但缓存仍然会将它们视为不同的模块，并多次重新加载*。 例如， `require('./foo')` 和 `require('./FOO')` 返回两个不同的对象，而不会管 ./foo 和 ./FOO 是否是相同的文件。

## 核心模块
核心模块定义在 Node.js 源代码的 lib/ 目录下。

`require()` 总是会优先加载核心模块。 例如， `require('http')` 始终返回内置的 HTTP 模块，即使有同名文件。

## 循环
在循环依赖时，会提前返回一个未完成的副本，终止循环。

如a依赖b, b依赖a。当a为入口时：a->加载b->b加载a->加载a未完成副本->b加载完成->a加载完成


## 文件模块
如果按确切的文件名没有找到模块，则 Node.js 会尝试带上 .js、 .json 或 .node 拓展名再加载。

.js 文件会被解析为 JavaScript 文本文件， .json 文件会被解析为 JSON 文本文件。 .node 文件会被解析为通过 `process.dlopen()` 加载的编译后的插件模块。

以 '/' 为前缀的模块是文件的绝对路径。 例如， `require('/home/marco/foo.js')` 会加载 /home/marco/foo.js 文件。

以 './' 为前缀的模块是相对于调用 require() 的文件的。 也就是说， circle.js 必须和 foo.js 在同一目录下以便于 `require('./circle')` 找到它。

当没有以 '/'、 './' 或 '../' 开头来表示文件时，这个模块必须是一个核心模块或加载自 node_modules 目录。

如果给定的路径不存在，则 `require()` 会抛出一个 code 属性为 'MODULE_NOT_FOUND' 的 Error。

## 目录作为模块
可以把程序和库放到一个单独的目录，然后提供一个单一的入口来指向它。 把目录递给 `require()` 作为一个参数，有三种方式。

第一种方式是在根目录下创建一个 package.json 文件，并指定一个 main 模块。 例子， package.json 文件类似：
```
{ "name" : "some-library",
  "main" : "./lib/some-library.js" }
```
如果这是在 ./some-library 目录中，则 `require('./some-library')` 会试图加载 ./some-library/lib/some-library.js。

这就是 Node.js 处理 package.json 文件的方式。

如果目录里没有 package.json 文件，或者 'main' 入口不存在或无法解析，则 Node.js 将会试图加载目录下的 index.js 或 index.node 文件。 例如，如果上面的例子中没有 package.json 文件，则 `require('./some-library')` 会试图加载：
```
./some-library/index.js
./some-library/index.node
```
如果这些尝试失败，则 Node.js 将会使用默认错误报告整个模块的缺失：
```
Error: Cannot find module 'some-library'
```


## 从 node_modules 目录加载
如果传递给 require() 的模块标识符不是一个核心模块，也没有以 '/' 、 '../' 或 './' 开头，则 Node.js 会从当前模块的父目录开始，尝试从它的 /node_modules 目录里加载模块。 Node.js 不会附加 node_modules 到一个已经以 node_modules 结尾的路径上。

如果还是没有找到，则移动到再上一层父目录，直到文件系统的根目录。

例子，如果在 '/home/ry/projects/foo.js' 文件里调用了 require('bar.js')，则 Node.js 会按以下顺序查找：

/home/ry/projects/node_modules/bar.js
/home/ry/node_modules/bar.js
/home/node_modules/bar.js
/node_modules/bar.js
这使得程序本地化它们的依赖，避免它们产生冲突。

通过在模块名后包含一个路径后缀，可以请求特定的文件或分布式的子模块。 例如， `require('example-module/path/to/file')` 会把 path/to/file 解析成相对于 example-module 的位置。 后缀路径同样遵循模块的解析语法。

## 从全局目录加载
如果 NODE_PATH 环境变量被设为一个以冒号分割的绝对路径列表，则当在其他地方找不到模块时 Node.js 会搜索这些路径。

在 Windows 系统中， NODE_PATH 是以分号（;）间隔的。

在当前的模块解析算法被定义之前， NODE_PATH 最初是创建来支持从不同路径加载模块的。

虽然 NODE_PATH 仍然被支持，但现在不太需要，因为 Node.js 生态系统已制定了一套存放依赖模块的约定。 有时当人们没意识到 NODE_PATH 必须被设置时，依赖 NODE_PATH 的部署会出现意料之外的行为。 有时一个模块的依赖会改变，导致在搜索 NODE_PATH 时加载了不同的版本（甚至不同的模块）。

此外，Node.js 还会搜索以下的全局目录列表：

1: $HOME/.node_modules
2: $HOME/.node_libraries
3: $PREFIX/lib/node
其中 $HOME 是用户的主目录， $PREFIX 是 Node.js 里配置的 node_prefix。

这些主要是历史原因。

强烈建议将所有的依赖放在本地的 node_modules 目录。 这样将会更快地加载，且更可靠。


## <span id="module-warpper">模块封装器</span>
在执行模块之前，node会使用一个如下的模块封装器将其封装
```js
// 遵循 Commosjs 规范
(function(exports, require, module, __filename, __dirname) {
// 模块的代码实际上在这里
});
```
通过这样做，Node.js 实现了以下几点：
* 它保持了顶层的变量（用 `var`、 `const` 或 `let` 定义）作用在模块范围内，而不是全局对象。
* 它有助于提供一些看似全局的但实际上是模块特定的变量，例如：
  * 实现者可以用于从模块中导出值的 `module` 和 `exports` 对象。
  * 包含`module`绝对文件名和目录路径的快捷变量 `__filename` 和 `__dirname` 

<br/><br/><br/>

## 模块作用域

### **__dirname: string**
当前模块的目录名。 与 `path.dirname(__filename)` 相同。

示例，从 /Users/mjr 运行 node example.js：
```js
console.log(__dirname);
// 打印: /Users/mjr
console.log(path.dirname(__filename));
// 打印: /Users/mjr
```

### **__filename: string**
当前模块的文件名。 这是当前的模块文件的绝对路径（符号链接会被解析）。

对于主程序，这不一定与命令行中使用的文件名相同。

有关当前模块的目录名，参见 [__dirname](#dirname)。

示例：

从 /Users/mjr 运行 node example.js：
```js
console.log(__filename);
// 打印: /Users/mjr/example.js
console.log(__dirname);
// 打印: /Users/mjr
```
给定两个模块：a 和 b，其中 b 是 a 的依赖文件，且目录结构如下：

/Users/mjr/app/a.js
/Users/mjr/app/node_modules/b/b.js
b.js 中的 __filename 的引用会返回 /Users/mjr/app/node_modules/b/b.js，而 a.js 中的 __filename 的引用会返回 /Users/mjr/app/a.js。


### **exports: Object**
这是一个对于 module.exports 的更简短的引用形式。查看关于 [exports 快捷方式](#)的章节，详细了解什么时候使用 exports、什么时候使用 module.exports。

### **module: Object**
对当前模块的引用, 查看关于 [module 对象](#module)的章节。 module.exports 用于指定一个模块所导出的内容，即可以通过 require() 访问的内容。

### **require(id: string): Module**
用于引入模块、 JSON、或本地文件。 可以从 node_modules 引入模块。 可以使用相对路径（例如 ./、 ./foo、 ./bar/baz、 ../foo）引入本地模块或 JSON 文件，路径会根据 `__dirname` 定义的目录名或当前工作目录进行处理。 POSIX 风格的相对路径会以与操作系统无关的方式解析，这意味着上面的示例将会在 Windows 上以与在 Unix 系统上相同的方式工作。

### **require.cache**
被引入的模块将被缓存在这个对象中。 从此对象中删除键值对将会导致下一次 require 重新加载被删除的模块。 这不适用于原生插件，因为它们的重载将会导致错误。

可以添加或替换入口。 在加载原生模块之前会检查此缓存，如果将与原生模块匹配的名称添加到缓存中，则引入调用将不再获取原生模块。 谨慎使用！

### **require.main: string**
Module 对象，表示当 Node.js 进程启动时加载的入口脚本。 参见[访问主模块](#main-module)。


### **require.resolve(id: string, options?: { paths?: string[]; }): string**
* `id` 需要解析的模块路径。
* `options`
  * `paths` 从中解析模块位置的路径。 如果存在，则使用这些路径而不是默认的解析路径，但 GLOBAL_FOLDERS 除外，例如 $HOME/.node_modules，它们总是包含在内。 这些路径中的每一个都用作模块解析算法的起点，这意味着从该位置开始检查 node_modules 层次结构。

使用内部的 `require()` 机制查询模块的位置，此操作只返回解析后的文件名，*不会加载该模块*。

如果找不到模块，则会抛出 MODULE_NOT_FOUND 错误。

### **require.resolve.paths(request): string[]**
返回一个数组，其中包含解析 request 过程中被查询的路径，如果 request 字符串指向核心模块（例如 http 或 fs）则返回 null。

<br/><br/><br/>

## <span id="module">module 对象</span>
在每个模块中， module 的自由变量是对表示当前模块的对象的引用。 为方便起见，还可以通过全局模块的 exports 访问 module.exports。 module 实际上不是全局的，而是每个模块本地的

### **module.children: module[]**
被该模块引用的模块对象。

### **module.exports**
module.exports 对象由 Module 系统创建。 有时这是不可接受的；许多人希望他们的模块成为某个类的实例。 为此，需要将期望导出的对象赋值给 module.exports。 将期望的对象赋值给 exports 会简单地重新绑定本地的 exports 变量，这可能不是所期望的。

对 module.exports 的赋值必须立即完成。 不能在任何异步中完成。例如`setTimeout`

### **module.filename: string**
模块的完全解析后的文件名。


### **module. id: string**
模块的标识符。 通常是完全解析后的文件名。

### **module.loaded: boolean**
模块是否已经加载完成，或正在加载中。

### **module.parent: module**
最先引用该模块的模块。

### **module.paths: string[]**
模块的搜索路径。

### **module.require(id: string): module**
`module.require()` 方法提供了一种加载模块的方法，就像从原始模块调用 `require()` 一样。

为了做到这个，需要获得一个 `module` 对象的引用。 因为 `require()` 会返回 `module.exports`，且 `module` 通常只在一个特定的模块代码中有效，所以为了使用它，必须显式地导出。

### **module.builtinModules: string[]**
罗列 Node.js 提供的所有模块名称。可以用来判断模块是否为第三方所维护。

注意， module 在此处含义与模块封装器所提供的 module 是不同的。可以通过引入 Module 模块访问：
```js
const builtin = require('module').builtinModules;
```

### **module.createRequire(path: string | URL): NodeRequire**
* `path` 用于构造 require 函数的文件名。必须是一个文件 URL 对象、文件 URL 字符串、或绝对路径字符串。
```js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// sibling-module.js 是一个 CommonJS 模块。
const siblingModule = require('./sibling-module');
```



<br/><br/><br/>

## <span id="exports">exports 快捷方式</span>
`exports` 变量是在模块的文件级作用域内可用的，且在模块执行之前赋值给 `module.exports`。

它允许使用快捷方式，因此 `module.exports.f = ...` 可以更简洁地写成 `exports.f = ...`。 但是，就像任何变量一样，如果为 `exports` 赋予了新值，则它将不再绑定到 `module.exports`：
```js
module.exports.hello = true; // 从模块的引用中导出。
exports = { hello: false };  // 不导出，仅在模块中可用。
```