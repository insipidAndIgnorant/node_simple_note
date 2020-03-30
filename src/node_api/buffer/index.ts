// Buff构造
// 【 from 】
// static from(array) 返回一个新的 Buffer，其中包含提供的八位字节数组的 【副本】
Buffer.from([1,2,3]) // 创建一个包含 [0x1, 0x2, 0x3] 的 Buffer

// static from(str: string, encoding?: BufferEncoding): Buffer  返回一个新的 Buffer，其中包含提供的字符串的副本。
const strBuff = Buffer.from('test', 'utf-8');


// static from(arrayBuffer: ArrayBuffer | SharedArrayBuffer, byteOffset?: number, length?: number): Buffer
// 返回一个新的 Buffer，它与给定的 ArrayBuffer【共享相同的已分配内存】
const arrayBuffer = new ArrayBuffer(8);
Buffer.from(arrayBuffer, 0, arrayBuffer.byteLength);
// 返回一个新的 Buffer，其中包含给定 Buffer 的内容的 【副本】
Buffer.from(strBuff);



// 【 alloc 】
// static alloc(size: number, fill?: string | Buffer | number, encoding?: BufferEncoding): Buffer
// 返回一个指定大小的新建的的已初始化的 Buffer。 此方法比 Buffer.allocUnsafe(size) 慢，
// 但能确保新创建的 Buffer 实例永远不会包含可能敏感的旧数据。 如果 size 不是数字，则将会抛出 TypeError
Buffer.alloc(1024, 0, 'utf-8');


// static allocUnsafe(size) 和 Buffer.allocUnsafeSlow(size) 分别返回一个指定大小的新建的未初始化的 Buffer。
// 由于 Buffer 是未初始化的，因此分配的内存片段可能包含敏感的旧数据。
// 如果 size 小于或等于 Buffer.poolSize 的一半，则 Buffer.allocUnsafe() 返回的 Buffer 实例可能是从共享的内部内存池中分配。 
// Buffer.allocUnsafeSlow() 返回的实例则从不使用共享的内部内存池


// 【 Buffer 和 TypeArray 】
// Buffer 实例也是 Uint8Array 实例，但是与 TypedArray 有微小的不同。 例如，ArrayBuffer#slice() 会创建切片的拷贝，
// 而 Buffer#slice() 是在现有的 Buffer 上创建而不拷贝，这使得 Buffer#slice() 效率更高。

// 也可以从一个 Buffer 创建新的 TypedArray 实例，但需要注意以下事项：

//      1.Buffer 对象的内存是被拷贝到 TypedArray，而不是共享。
//      2.Buffer 对象的内存是被解释为不同元素的数组，而不是目标类型的字节数组。 也就是说， new Uint32Array(Buffer.from([1, 2, 3, 4])) 
//        会创建一个带有 4 个元素 [1, 2, 3, 4] 的 Uint32Array，而不是带有单个元素 [0x1020304] 或 [0x4030201] 的 Uint32Array。
//      3.通过使用 TypedArray 对象的 .buffer 属性，可以创建一个与 TypedArray 实例共享相同内存的新 Buffer。
const arr = new Uint16Array(2);
arr[0] = 5000;
arr[1] = 4000;

// 拷贝 `arr` 的内容。
const buf1 = Buffer.from(arr);
// 与 `arr` 共享内存。
const buf2 = Buffer.from(arr.buffer);

console.log(buf1);
// 打印: <Buffer 88 a0>
console.log(buf2);
// 打印: <Buffer 88 13 a0 0f>

arr[1] = 6000;

console.log(buf1);
// 打印: <Buffer 88 a0>
console.log(buf2);
// 打印: <Buffer 88 13 70 17>


// Buffer.from() 与 TypedArray.from() 有着不同的实现。 具体来说，TypedArray 可以接受第二个参数作为映射函数，在类型数组的每个元素上调用：
// TypedArray.from(source[, mapFn[, thisArg]]); Buffer.from() 则不支持映射函数的使用：
// Buffer 实例可以使用 for..of 语法进行迭代, Buffer().values()、Buffer().keys()、和 Buffer().entries() 方法也可用于创建迭代器。



// 【 Buffer.byteLength 】
// static byteLength(string: string | NodeJS.ArrayBufferView | ArrayBuffer | SharedArrayBuffer, encoding?: BufferEncoding): number;
// 当 string 是一个 Buffer/DataView/TypedArray/ArrayBuffer/SharedArrayBuffer 时，返回实际的字节长度。
const str = '\u00bd + \u00bc = \u00be';
console.log(`${str}: ${str.length} 个字符, ` + `${Buffer.byteLength(str, 'utf8')} 个字节`);
// 打印: ½ + ¼ = ¾: 9 个字符, 12 个字节



// 【 Buffer.compare 】
// Buffer.compare(buf_1, buf_2)  比较 buf_1 与 buf_2 Buffer 实例数组的排序。 相当于调用 buf_1.compare(buf_2)。
const buf_1 = Buffer.from('1234');
const buf_2 = Buffer.from('0123');
const arr_1 = [buf1, buf2];
console.log(arr_1.sort(Buffer.compare));
// 打印: [ <Buffer 30 31 32 33>, <Buffer 31 32 33 34> ]
// (结果相当于: [buf_2, buf_1])



// 【 Buffer.concat 】
// static concat(list: Uint8Array[], totalLength?: number): Buffer;
// ⚪ list <Buffer[]> | <Uint8Array[]> 要合并的 Buffer 数组或 Uint8Array 数组。
// ⚪ totalLength <integer> 合并后 list 中的 Buffer 实例的总长度

// 返回一个合并了 list 中所有 Buffer 实例的新 Buffer。
// 如果 list 中没有元素、或 totalLength 为 0，则返回一个长度为 0 的 Buffer。
// 如果没有提供 totalLength，则计算 list 中的 Buffer 实例的总长度。 但是这会导致执行额外的循环用于计算 totalLength，因此如果已知长度，则明确提供长度会更快。
// 如果提供了 totalLength，则会强制转换为无符号整数。 如果 list 中的 Buffer 合并后的总长度大于 totalLength，则结果会被截断到 totalLength 的长度

const bufC1 = Buffer.alloc(10);
const bufC2 = Buffer.alloc(14);
const bufC3 = Buffer.alloc(18);
const totalLength = bufC1.length + bufC2.length + bufC3.length;

console.log(totalLength);
// 打印: 42
const bufA = Buffer.concat([bufC1, bufC2, bufC3], totalLength);
console.log(bufA);
// 打印: <Buffer 00 00 00 00 ...>
console.log(bufA.length);
// 打印: 42



// Buffer.isBuffer(obj): boolean



// Buffer.isEncoding(encoding): boolean  检查是否支持encoding编码



// Buffer.poolSize  这是用于缓冲池的预分配的内部 Buffer 实例的大小（以字节为单位）。 该值可以修改。默认值: 8192。


// 【实例方法/属性】

// buf[index] 索引操作符 [index] 可用于获取或设置 buf 中指定的 index 位置的八位字节
// 该操作符继承自 Uint8Array，所以对越界访问的行为与 UInt8Array 相同。 也就是说，取值时返回 undefined，赋值时不作为。


// 【 buffer 】
// buf.buffer: ArrayBuffer 
// 创建此 Buffer 对象时基于的底层 ArrayBuffer 对象。
// 不能保证此 ArrayBuffer 与原始的 Buffer 完全对应。 有关详细信息，参阅 buf.byteOffset 上的说明。
const arrayBuffer1 = new ArrayBuffer(16);
const buffer = Buffer.from(arrayBuffer1);
console.log(buffer.buffer === arrayBuffer1);
// 打印: true



// 【 byteOffset 】
// buf.byteOffset: number
// 创建 Buffer 对象时基于的底层 ArrayBuffer 对象的 byteOffset。
// 当直接使用 buf.buffer 访问底层的 ArrayBuffer 时， ArrayBuffer 的第一个字节可能并不指向 buf 对象。
// 所有使用 Buffer 对象创建 TypedArray 对象时，【需要正确地指定 byteOffset】
// 创建一个小于 `Buffer.poolSize` 的 buffer。
const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// 当将 Node.js Buffer 赋值给一个 Int8 的 TypedArray 时，【记得使用 byteOffset】。
new Int8Array(nodeBuffer.buffer, nodeBuffer.byteOffset, nodeBuffer.length);



// 【 compare 】
// buf.compare(target: Uint8Array,targetStart?: number,targetEnd?: number, sourceStart?: number,sourceEnd?: number): number;
// ⚪ target <Buffer> | <Uint8Array> 要与 buf 对比的 Buffer 或 Uint8Array。
// ⚪ targetStart <integer> target 中开始对比的偏移量。默认值: 0。
// ⚪ targetEnd <integer> target 中结束对比的偏移量（不包含）。默认值: target.length。
// ⚪ sourceStart <integer> buf 中开始对比的偏移量。默认值: 0。
// ⚪ sourceEnd <integer> buf 中结束对比的偏移量（不包含）。默认值: buf.length。
const compareBuffer1 = Buffer.from('ABC');
const compareBuffer2 = Buffer.from('BCD');
const compareBuffer3 = Buffer.from('ABCDE');
compareBuffer1.compare(compareBuffer1); // 0
compareBuffer1.compare(compareBuffer2); // -1
compareBuffer2.compare(compareBuffer1); // 1



// 【 copy 】
// buf.copy(target: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number 拷贝的字节数。
// ⚪ target <Buffer> | <Uint8Array> 要拷贝进的 Buffer 或 Uint8Array。
// ⚪ targetStart <integer> target 中开始写入之前要跳过的字节数。默认值: 0。
// ⚪ sourceStart <integer> buf 中开始拷贝的偏移量。默认值: 0。
// ⚪ sourceEnd <integer> buf 中结束拷贝的偏移量（不包含）。默认值: buf.length。



// 【 迭代 】
// buf.entries()  用 buf 的内容创建并返回一个 [index, byte] 形式的迭代器。 for (const pair of buf.entries()) { pair[0]...; pair[1]... }
// buf.keys() 创建并返回 buf 键名（索引）的迭代器。for (const key of buf.keys()) {}
// buf.values() 创建并返回 buf 键值（字节）的迭代器。  for (const value of buf.values()) {}



// buf.equals(otherBuffer)  如果 buf 与 otherBuffer 具有完全相同的字节，则返回 true，否则返回 false。



// 【 fill 】
// buf.fill(value: string | Uint8Array | number, offset?: number, end?: number, encoding?: BufferEncoding): this;
// ⚪ value <string> | <Buffer> | <Uint8Array> | <integer> 用来填充 buf 的值。
// ⚪ offset <integer> 开始填充 buf 的偏移量。默认值: 0。
// ⚪ end <integer> 结束填充 buf 的偏移量（不包含）。默认值: buf.length。
// ⚪ encoding <string> 如果 value 是字符串，则指定 value 的字符编码。默认值: 'utf8'。



// 【 查找 】
// buf.includes(value: string | number | Buffer, byteOffset?: number, encoding?: BufferEncoding): boolean;
// ⚪ value <string> | <Buffer> | <Uint8Array> | <integer> 要查找的值。
// ⚪ byteOffset <integer> buf 中开始查找的偏移量。默认值: 0。
// ⚪ encoding <string> 如果 value 是字符串，则指定 value 的字符编码。默认值: 'utf8'。

// buf.indexOf(value: string | number | Uint8Array, byteOffset?: number, encoding?: BufferEncoding): number;
// buf.lastIndexOf(value: string | number | Uint8Array, byteOffset?: number, encoding?: BufferEncoding): number;

// buf.length: number  返回内存中【分配】给 buf 的字节数。 不一定反映 buf 中可用数据的字节量。readonly



// buf.subarray(start?: number, end?: number): Buffer;
// ⚪ start <integer> 新 Buffer 开始的位置。默认值: 0。
// ⚪ end <integer> 新 Buffer 结束的位置（不包含）。默认值: buf.length。
// 返回一个新的 Buffer，它引用与原始的 Buffer 相同的内存，但是由 start 和 end 索引进行偏移和裁剪。
// 指定大于 buf.length 的 end 将会返回与 end 等于 buf.length 时相同的结果。
// 修改新的 Buffer 切片将会修改原始 Buffer 中的内存，因为两个对象分配的内存是重叠的。
// 指定负的索引会导致切片的生成是相对于 buf 的末尾而不是开头。

// buf.slice([start[, end]])



// buf.toJSON()  返回 buf 的 JSON 格式。 当字符串化 Buffer 实例时，JSON.stringify() 会调用该函数。
const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
const json = JSON.stringify(buf);
console.log(json);
// 打印: {"type":"Buffer","data":[1,2,3,4,5]}
const copy = JSON.parse(json, (key, value) => {
  return value && value.type === 'Buffer' ?
    Buffer.from(value.data) :
    value;
});
console.log(copy);
// 打印: <Buffer 01 02 03 04 05>



// buf.(encoding?: string, start?: number, end?: number): string
// ⚪ encoding <string> 使用的字符编码。默认值: 'utf8'。
// ⚪ start <integer> 开始解码的字节偏移量。默认值: 0。
// ⚪ end <integer> 结束解码的字节偏移量（不包含）。默认值: buf.length。



// buf.write(string: string, offset: number, encoding?: BufferEncoding): number 已写入的字节数。
// ⚪ string <string> 要写入 buf 的字符串。
// ⚪ offset <integer> 开始写入 string 之前要跳过的字节数。默认值: 0。
// ⚪ length <integer> 要写入的字节数。默认值: buf.length - offset。
// ⚪ encoding <string> string 的字符编码。默认值: 'utf8'。
const writeBuf = Buffer.alloc(256);
const len = writeBuf.write('\u00bd + \u00bc = \u00be', 0);
console.log(`${len} 个字节: ${writeBuf.toString('utf8', 0, len)}`);
// 打印: 12 个字节: ½ + ¼ = ¾



// buffer.kMaxLength  分配给单个 Buffer 实例的最大内存。



// buffer.transcode(source, fromEnc, toEnc)  将指定的 Buffer 或 Uint8Array 实例从一个字符编码重新编码到另一个字符。 返回新的 Buffer 实例。
// ⚪ source <Buffer> | <Uint8Array> 一个 Buffer 或 Uint8Array 实例。
// ⚪ fromEnc <string> 当前字符编码。
// ⚪ toEnc <string> 目标字符编码。

