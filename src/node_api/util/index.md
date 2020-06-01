# util
util 模块用于支持 Node.js 内部 API 的需求。 大部分实用工具也可用于应用程序与模块开发者。

## util.callbackify(original)
* original Function  async 异步函数。
* 返回: 传统回调函数

将 async 异步函数（或者一个返回值为 Promise 的函数）转换成遵循异常优先的回调风格的函数，例如将 `(err, value) => ...` 回调作为最后一个参数。 在回调函数中，第一个参数为拒绝的原因（如果 Promise 解决，则为 null），第二个参数则是解决的值。
```js
const util = require('util');

async function fn() {
  return 'hello world';
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  if (err) throw err;
  console.log(ret);
});
```
`null` 在回调函数中作为一个参数有其特殊的意义，如果回调函数的首个参数为 `Promise` 拒绝的原因且带有返回值，且值可以转换成布尔值 `false`，这个值会被封装在 Error 对象里，可以通过属性 `reason` 获取。
```js
function fn() {
  return Promise.reject(null);
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  // 当 Promise 被以 `null` 拒绝时，它被包装为 Error 并且原始值存储在 `reason` 中。
  err && err.hasOwnProperty('reason') && err.reason === null;  // true
});
```

## util.debuglog(key: string): (msg: string, ...param: any[]) => void
* key 一个字符串，指定要为应用的哪些部分创建 debuglog 函数

`util.debuglog()` 方法用于创建一个函数，基于 NODE_DEBUG 环境变量的存在与否有条件地写入调试信息到 stderr。 如果 `key` 名称在环境变量的值中，则返回的函数类似于 `console.error()`。 否则，返回的函数是一个空操作。
```js
const util = require('util');
const debuglog = util.debuglog('foo');

debuglog('hello from foo [%d]', 123);
```
如果程序在环境中运行时带上 NODE_DEBUG=foo，则输出类似如下：
```
FOO 3245: hello from foo [123]
```
其中 3245 是进程 id。 如果运行时没带上环境变量集合，则不会打印任何东西。

`key` 还支持通配符
```js
const util = require('util');
const debuglog = util.debuglog('foo-bar');

debuglog('hi there, it\'s foo-bar [%d]', 2333);
```
如果在环境中使用 NODE_DEBUG=foo* 运行，那么它将输出如下内容
```
FOO-BAR 3257: hi there, it's foo-bar [2333]
```
NODE_DEBUG 环境变量中可指定多个由逗号分隔的 `key` 名称。 例如：NODE_DEBUG=fs,net,tls。

## util.deprecate<T extends Function>(fn: T, message: string, code?: string): T
* fn 将被弃用的函数。
* msg 当调用弃用的函数时显示的警告消息。
* code 弃用码。 有关代码列表，请参见弃用的 API 列。

`util.deprecate()` 方法以一种标记为已弃用的方式包装 fn（可以是函数或类）。
```js
const util = require('util');

exports.obsoleteFunction = util.deprecate(() => {
  // 一些操作。
}, 'obsoleteFunction() 已弃用，使用 newShinyFunction() 代替');
```
当被调用时， `util.deprecate()` 会返回一个函数，这个函数会使用 `'warning'` 事件触发一个 `DeprecationWarning`。 默认情况下，警告只在首次被调用时才会被触发并打印到 stderr。 警告被触发之后，被包装的函数会被调用。

如果在对 `util.deprecate()` 的多次调用中提供了相同的可选 `code`，则该 `code` 仅触发一次警告
```js
const util = require('util');

const fn1 = util.deprecate(someFunction, someMessage, 'DEP0001');
const fn2 = util.deprecate(someOtherFunction, someOtherMessage, 'DEP0001');
fn1(); // 使用代码 DEP0001 触发弃用警告。
fn2(); // 不会触发弃用警告，因为它具有相同的代码。
```
如果使用了 --no-deprecation 或 --no-warnings 命令行标记，或 `process.noDeprecation` 属性在首次弃用警告之前被设为 true，则 `util.deprecate()` 方法什么也不做。

如果设置了 --trace-deprecation 或 --trace-warnings 命令行标记，或 `process.traceDeprecation` 属性被设为 true，则弃用的函数首次被调用时会把警告与堆栈追踪打印到 stderr。

如果设置了 --throw-deprecation 命令行标记，或 `process.throwDeprecation` 属性被设为 true，则当弃用的函数被调用时会抛出一个异常。

--throw-deprecation 命令行标记和 `process.throwDeprecation` 属性优先于 --trace-deprecation 和 `process.traceDeprecation`。

## util.format(format: any, ...param: any[]): string
* format  一个类似 printf 的格式字符串。

`util.format()` 方法返回一个格式化后的字符串，使用第一个参数作为一个类似 printf 的格式的字符串，该字符串可以包含零个或多个格式占位符。 每个占位符会被对应参数转换后的值所替换。 支持的占位符有：
* %s - String 将用于转换除 `BigInt`、 `Object` 和 `-0` `外的所有值。BigInt` 值将用 n 表示，而没有用户定义 `toString` 函数的对象使用带有选项 `{ depth: 0, colors: false, compact: 3 }` 的` util.inspect()` 进行检查。
* %d - Number 将用于转换除 `BigInt` 和 `Symbol` 之外的所有值。
* %i - parseInt(value, 10) 用于除 `BigInt` 和 `Symbol` 之外的所有值。
* %f - parseFloat(value) 用于除 `BigInt` 和 `Symbol` 之外的所有值。
* %j - JSON。如果参数包含循环引用，则替换为字符串 '[Circular]'。
* %o - Object。具有通用 JavaScript 对象格式的对象的字符串表示形式。 类似于带有选项 `{ showHidden: true, showProxy: true }` 的 `util.inspect()`。 这将显示完整对象，包括非可枚举属性和代理。
* %O - Object。具有通用 JavaScript 对象格式的对象的字符串表示形式。 类似于 `util.inspect()` 但没有选项。 这将显示完整对象，不包括非可枚举属性和代理。
* %c - CSS。该说明符当前会被忽略，将会跳过任何传入的 CSS。
* %% - 单个百分号（`'%'`）。这不会消耗参数。

如果占位符没有对应的参数，则占位符不被替换。
```js
util.format('%s:%s', 'foo');
// 返回: 'foo:%s'
```
如果类型不是 string，则使用 `util.inspect()` 格式化不属于格式字符串的值。

如果传入 `util.format()` 方法的参数比占位符的数量多，则多出的参数会被强制转换为字符串，然后拼接到返回的字符串，参数之间用一个空格分隔。
```js
util.format('%s:%s', 'foo', 'bar', 'baz');
// 返回: 'foo:bar baz'
```
如果第一个参数不是一个字符串，则` util.format()` 返回一个所有参数用空格分隔并连在一起的字符串。
```js
util.format(1, 2, 3);
// 返回: '1 2 3'
```
如果只有一个参数传给 `util.format()`，它将按原样返回，不带任何格式：
```js
util.format('%% %s');
// 返回: '%% %s'
```
`util.format()` 是一种用作调试工具的同步方法。 某些输入值可能会产生严重的性能开销，从而阻止事件循环。 请谨慎使用此功能，切勿在热代码路径中使用。

## util.inherits(constructor: any, superConstructor: any): void
不建议使用 `util.inherits()`。 请使用 ES6 的 `class` 和 `extends` 关键词获得语言层面的继承支持。 这两种方式是语义上不兼容的。

从一个构造函数中继承原型方法到另一个。 `constructor` 的原型会被设置到一个从 `superConstructor` 创建的新对象上。

这主要在 `Object.setPrototypeOf(constructor.prototype, superConstructor.prototype)` 之上添加了一些输入验证。 作为额外的便利，可以通过 `constructor.super_`属性访问 `superConstructor`。

## util.inspect(object: any, showHidden?: boolean, depth?: number | null, color?: boolean): string
## util.inspect(object: any, options: InspectOptions): string
* object 任何js原生值或object
* options
  * showHidden boolean 如果为true，则格式化结果中包含对象的不可枚举符号和属性。`WeakMap`和`WeakSet`条目也包括用户定义的原型属性（不包括方法属性）。默认值：false。
  * depth number 指定格式化对象时递归的次数。这对于检查大型物体很有用。递归到调用堆栈大小的最大值传递无穷大或空。默认值：2。
  * colors boolean 如果为true，则输出使用ANSI颜色代码进行样式设置。颜色可定制。请参见自定义使用检查颜色。默认值：false。
  * customInspect boolean 如果是false,`util.inspect.custom(depth，opts)`函数不被调用。默认值：true。
  * showProxy boolean 如果为true，则代理检查包括`target`和`handler`。默认值：false
  * maxArrayLength number 指定格式化时要包含的数组、`TypedArray`、`WeakMap`和`WeakSet`元素的最大数目。设置为空或无穷大以显示所有元素。设置为0或负值则不显示任何元素。默认值：100。
  * maxStringLength number 指定格式化时要包含的最大字符数。设置为空或无穷大以显示所有元素。设置为0或负则不显示字符。默认值：无穷大。
  * breakLength number 在多行中分割输入值的长度。设置为无穷大可将输入格式化为单行（与紧凑设置为真或任何大于等于1的数字结合使用）。默认值：80。
  * compact number | boolean 将此设置为false将导致每个对象键显示在新行上。它还将向比breakLength长的文本添加新行。如果设置为数字，则只要所有属性都符合breakLength，则最多n个内部元素将合并在一条线上。短数组元素也分组在一起。任何文本都不会减少到16个字符以下，无论特征长度大小如何。有关更多信息，请参见下面的示例。默认值：3。
  * sorted boolean | Function 如果设置为true或函数，则对象的所有属性、集合和映射项都将在结果字符串中排序。如果设置为true，则使用默认排序。如果设置为函数，则用作比较函数。
  * getters boolean | Function 如果设置为true，则检查`getter`。如果设置为`“get”`，则只检查没有相应`setter`的`getter`。如果设置为`“set”`，则只检查具有相应`setter`的`getter`。这可能会导致副作用，具体取决于`getter`函数。默认值：false。
  
该方法返回用于调试的对象的字符串表示形式。`util.inspect`的输出可能随时更改，不应以编程方式依赖它。可能会传递其他选项来更改结果。`util.inspect`将使用构造函数的名称和/或@@toStringTag为被检查的值生成一个可识别的标记。
```js
class Foo {
  get [Symbol.toStringTag]() {
    return 'bar';
  }
}

class Bar {}

const baz = Object.create(null, { [Symbol.toStringTag]: { value: 'foo' } });

util.inspect(new Foo()); // 'Foo [bar] {}'
util.inspect(new Bar()); // 'Bar {}'
util.inspect(baz);       // '[foo] {}'
```

循环引用通过使用引用索引指向其锚点：
```js
const { inspect } = require('util');

const obj = {};
obj.a = [obj];
obj.b = {};
obj.b.inner = obj.b;
obj.b.obj = obj;

console.log(inspect(obj));
// <ref *1> {
//   a: [ [Circular *1] ],
//   b: <ref *2> { inner: [Circular *2], obj: [Circular *1] }
// }
```
以下示例检查util对象的所有属性：
```js
const util = require('util');

console.log(util.inspect(util, { showHidden: true, depth: null }));
```
以下示例突出显示了compact选项的效果：
```js
const util = require('util');

const o = {
  a: [1, 2, [[
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
      'eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'test',
    'foo']], 4],
  b: new Map([['za', 1], ['zb', 'test']])
};
console.log(util.inspect(o, { compact: true, depth: 5, breakLength: 80 }));

// { a:
//   [ 1,
//     2,
//     [ [ 'Lorem ipsum dolor sit amet, consectetur [...]', // A long line
//           'test',
//           'foo' ] ],
//     4 ],
//   b: Map(2) { 'za' => 1, 'zb' => 'test' } }

// Setting `compact` to false changes the output to be more reader friendly.
console.log(util.inspect(o, { compact: false, depth: 5, breakLength: 80 }));

// {
//   a: [
//     1,
//     2,
//     [
//       [
//         'Lorem ipsum dolor sit amet, consectetur ' +
//           'adipiscing elit, sed do eiusmod tempor ' +
//           'incididunt ut labore et dolore magna ' +
//           'aliqua.,
//         'test',
//         'foo'
//       ]
//     ],
//     4
//   ],
//   b: Map(2) {
//     'za' => 1,
//     'zb' => 'test'
//   }
// }

// Setting `breakLength` to e.g. 150 will print the "Lorem ipsum" text in a
// single line.
// Reducing the `breakLength` will split the "Lorem ipsum" text in smaller
// chunks.
```

`showHidden`选项允许检查`WeakMap`和`WeakSet`条目。如果条目多于`maxarrayleng`，则无法保证显示哪些条目。这意味着两次检索相同的`WeakSet`条目可能会导致不同的输出。此外，没有剩余强引用的条目随时可能被垃圾收集。
```js
const { inspect } = require('util');

const obj = { a: 1 };
const obj2 = { b: 2 };
const weakSet = new WeakSet([obj, obj2]);

console.log(inspect(weakSet, { showHidden: true }));
// WeakSet { { a: 1 }, { b: 2 } }
```
`sorted`选项确保对象的属性插入顺序不会影响`util.inspect()`的结果。
```js
const { inspect } = require('util');
const assert = require('assert');

const o1 = {
  b: [2, 3, 1],
  a: '`a` comes before `b`',
  c: new Set([2, 3, 1])
};
console.log(inspect(o1, { sorted: true }));
// { a: '`a` comes before `b`', b: [ 2, 3, 1 ], c: Set(3) { 1, 2, 3 } }
console.log(inspect(o1, { sorted: (a, b) => b.localeCompare(a) }));
// { c: Set(3) { 3, 2, 1 }, b: [ 2, 3, 1 ], a: '`a` comes before `b`' }

const o2 = {
  c: new Set([2, 1, 3]),
  a: '`a` comes before `b`',
  b: [2, 3, 1]
};
assert.strict.equal(
  inspect(o1, { sorted: true }),
  inspect(o2, { sorted: true })
);
```
`util.inspect`是用于调试的同步方法。其最大输出长度约为128 MB。导致较长输出的输入将被截断。

### 自定义 util.inspect 的颜色
可以通过 `util.inspect.styles` 和 `util.inspect.colors` 属性全局地自定义 `util.inspect` 的颜色输出（如果已启用）。

`util.inspect.styles` 是一个映射，关联一个样式名到一个 `util.inspect.colors` 颜色。

默认的样式与关联的颜色有：
* bigint - yellow
* boolean - yellow
* date - magenta
* module - underline
* name - (no styling)
* null - bold
* number - yellow
* regexp - red
* special - cyan (例如 Proxies)
* string - green
* symbol - green
* undefined - grey

颜色样式使用 ANSI 控制码，可能不是所有终端都支持。 要验证颜色支持，请使用 `tty.hasColors()`。

下面列出了预定义的控制代码（分为“修饰符”、“前景颜色”和“背景颜色”）。

#### 修饰符
修饰符支持在不同的终端中不同。如果得不到支持，它们大多会被忽略。
* reset 将所有（颜色）修饰符重置为其默认值
* bold 字体加粗
* italic 字体倾斜
* underline 下划线
* strikethrough 删除线
* hidden 隐藏字体
* dim 暗淡
* overlined 上划线
* blink 闪烁
* inverse 前/背景色交换
* doubleunderline 双下划线
* framed 边框

#### 前景颜色
* black
* red
* green
* yellow
* blue
* magenta
* cyan
* white
* gray 
* redBright
* greenBright
* yellowBright
* blueBright
* magentaBright
* cyanBright
* whiteBright

#### 背景颜色
* bgBlack
* bgRed
* bgGreen
* bgYellow
* bgBlue
* bgMagenta
* bgCyan
* bgWhite
* bgGray 
* bgRedBright
* bgGreenBright
* bgYellowBright
* bgBlueBright
* bgMagentaBright
* bgCyanBright
* bgWhiteBright

### 自定义对象的查看函数
对象可以定义自己的 `[util.inspect.custom](depth, opts)` 函数， `util.inspect()` 会调用并使用查看对象时的结果：
```js
const util = require('util');

class Box {
  constructor(value) {
    this.value = value;
  }

  [util.inspect.custom](depth, options) {
    if (depth < 0) {
      return options.stylize('[Box]', 'special');
    }

    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });

    // 五个空格的填充，因为那是 "Box< " 的大小。
    const padding = ' '.repeat(5);
    const inner = util.inspect(this.value, newOptions)
                      .replace(/\n/g, `\n${padding}`);
    return `${options.stylize('Box', 'special')}< ${inner} >`;
  }
}

const box = new Box(true);

util.inspect(box);
// 返回: "Box< true >"
```
自定义的 `[util.inspect.custom](depth, opts)` 函数通常返回一个字符串，但也可以返回一个任何类型的值，它会相应地被 `util.inspect()` 格式化。
```js
const util = require('util');

const obj = { foo: '这个不会出现在 inspect() 的输出中' };
obj[util.inspect.custom] = (depth) => {
  return { bar: 'baz' };
};

util.inspect(obj);
// 返回: "{ bar: 'baz' }"
```

### util.inspect.custom
除了可以通过`util.inspect.custom`访问外，此符号还全局注册，并且可以在任何环境中作为`'nodejs.util.inspect.custom'`访问
```js
const inspect = Symbol.for('nodejs.util.inspect.custom');

class Password {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return 'xxxxxxxx';
  }

  [inspect]() {
    return `Password <${this.toString()}>`;
  }
}

const password = new Password('r0sebud');
console.log(password);
// Prints Password <xxxxxxxx>
```

### util.inspect.defaultOptions
`defaultOptions` 值允许对被 `util.inspect` 使用的默认选项进行自定义。 这对 `console.log` 或 `util.format` 等显式调用 `util.inspect` 的函数很有用。 它需被设为一个对象，包含一个或多个有效的 `util.inspect()` 选项。 也支持直接设置选项的属性。
```js
const util = require('util');
const arr = Array(101).fill(0);

console.log(arr); // 打印截断的数组
util.inspect.defaultOptions.maxArrayLength = null;
console.log(arr); // 打印完整的数组
```

## util.isDeepStrictEqual(val1, val2)
如果val1和val2之间存在深度严格相等，则返回true。否则，返回false。

## util.promisify(original)
传入一个遵循常见的错误优先的回调风格的函数（即以 `(err, value) => ...` 回调作为最后一个参数），并返回一个返回 promise 的版本。
```js
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);
stat('.').then((stats) => {
  // 使用 `stats`。
}).catch((error) => {
  // 处理错误。
});
```
或者，等效地使用 async function:
```js
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);

async function callStat() {
  const stats = await stat('.');
  console.log(`该目录归 ${stats.uid} 拥有`);
}
```
如果存在 `original[util.promisify.custom]` 属性，则 `promisify` 将会返回其值，参见自定义的 `promise` 化函数。

`promisify()` 在所有情况下都会假定 `original` 是一个以回调作为其最后参数的函数。 如果 `original` 不是一个函数，则 `promisify()` 将会抛出错误。 如果 `original` 是一个函数但其最后一个参数不是一个错误优先的回调，则它将仍会传入一个错误优先的回调作为其最后一个参数。

除非特殊处理，否则在类方法或使用 `this` 的其他方法上使用 `promisify()` 可能无法正常工作：
```js
const util = require('util');

class Foo {
  constructor() {
    this.a = 42;
  }

  bar(callback) {
    callback(null, this.a);
  }
}

const foo = new Foo();

const naiveBar = util.promisify(foo.bar);
// TypeError: Cannot read property 'a' of undefined
// naiveBar().then(a => console.log(a));

naiveBar.call(foo).then((a) => console.log(a)); // '42'

const bindBar = naiveBar.bind(foo);
bindBar().then((a) => console.log(a)); // '42'
```

### 自定义的 promise 化函数
使用 `util.promisify.custom` 符号可以重写 `util.promisify()` 的返回值：
```js
const util = require('util');

function doSomething(foo, callback) {
  // ...
}

doSomething[util.promisify.custom] = (foo) => {
  return getPromiseSomehow();
};

const promisified = util.promisify(doSomething);
console.log(promisified === doSomething[util.promisify.custom]);
// 打印 'true'
```
对于原始函数不遵循将错误优先的回调作为最后一个参数的标准格式的情况，这很有用。

例如，使用一个接受 `(foo, onSuccessCallback, onErrorCallback) `的函数:
```js
doSomething[util.promisify.custom] = (foo) => {
  return new Promise((resolve, reject) => {
    doSomething(foo, resolve, reject);
  });
};
```
如果定义了` promisify.custom `但不是一个函数，则 `promisify()` 将会抛出错误。

## util.TextDecoder 类
```js
const decoder = new TextDecoder('shift_jis');
let string = '';
let buffer;
while (buffer = getNextChunkSomehow()) {
  string += decoder.decode(buffer, { stream: true });
}
string += decoder.decode(); // 流的末尾。
```


### new TextDecoder([encoding[, options]])
* encoding string 标识此文本解码器实例支持的编码. Default: 'utf-8'.
* options
  * fatal boolean 如果解码失败是致命的，则为true。禁用ICU时不支持此选项（请参阅国际化）。默认值：false。
  * ignoreBOM boolean 如果为true，则文本解码器将在解码结果中包含字节顺序标记。如果为false，则字节顺序标记将从输出中移除。此选项仅在编码为“utf-8”、“utf-16be”或“utf-16le”时使用

创建新的文本解码器实例。编码可以指定支持的编码之一或别名。

`TextDecoder`类也可用于全局对象。

### textDecoder.decode(input?: BufferSource, options?: TextDecodeOptions): string
* option.stream boolean 如果需要额外的数据块，则为true,默认false

解码输入并返回字符串。如果`options.stream`如果为true，则在输入末尾出现的任何不完整字节序列都将在内部缓冲，并在下次调用textDecoder.decode()输出.

### textDecoder.encoding: string
文本解码器实例支持的编码。

### textDecoder.fatal: boolean
=== options.fata

### textDecoder.ignoreBOM
=== options.ignoreBOM

## util.TextEncoder 类
`TextEncoder` 类在全局对象上也可用。

### textEncoder.encode(input?: string): Uint8Array
对输入字符串进行UTF-8编码，并返回包含编码字节的uint8数组。

### textEncoder.encodeInto(source: string, destination: Uint8Array): TextEncoderEncodeIntoResult
* src The text to encode.
* destination The array to hold the encode result.

TextEncoderEncodeIntoResult:
* read number The read Unicode code units of src.
* written number The written UTF-8 bytes of dest.

### textEncoder.encoding
TextEncoder实例支持的编码。始终设置为“utf-8”。

## util.types
`util.types`为不同类型的内置对象提供类型检查。与`instanceof`或`Object.prototype.toString.call(value)`不同，这些检查不检查从JavaScript（如它们的原型）访问的对象的属性，并且通常具有调用C++的开销。

结果通常无法保证值在JavaScript中公开的属性或行为类型。它们主要适用于喜欢在JavaScript中进行类型检查的插件开发人员。

### util.types.is...
检查是否为该类型