"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
// 子进程
// 默认情况下， stdin、 stdout 和 stderr 的管道会在父 Node.js 进程和衍生的子进程之间建立。 这些管道具有有限的（且平台特定的）容量。 
// 如果子进程写入 stdout 时超出该限制且没有捕获输出，则子进程将会阻塞并等待管道缓冲区接受更多的数据。 
// 这与 shell 中的管道的行为相同。 如果不消费输出，则使用 { stdio: 'ignore' } 选项。
// child_process.spawn() 方法异步地衍生子进程，且不阻塞 Node.js 事件循环。
// child_process.spawnSync() 函数则以同步的方式提供了等效的功能，但会阻塞事件循环直到衍生的进程退出或终止。
// 【 exec 】
// child_process.exec(command: string, callback?: (error: ExecException | null, stdout: string, stderr: string) => void): ChildProcess;
// ⚪ command <string> 要运行的命令，并带上以空格分隔的参数。
// ⚪ options  <Object>
//      ⚪ cwd <string> 子进程的当前工作目录。默认值: null
//      ⚪ env <Object> 环境变量的键值对。默认值: process.env。
//      ⚪ encoding <string> 默认值: 'utf8'。
//      ⚪ shell <string> 用于执行命令的 shell。参阅 shell 的要求与 Windows 默认的 shell。 默认值: Unix 上是 '/bin/sh'，
//         Windows 上是 process.env.ComSpec
//      ⚪ timeout <number> 默认值: 0
//      ⚪ maxBuffer <number> stdout 或 stderr 上允许的最大字节数。如果超过限制，则子进程会被终止并且截断任何输出。
//         参阅 maxBuffer 与 Unicode 中的警告。默认值: 1024 * 1024
//      ⚪ killSignal <string> | <integer> 默认值: 'SIGTERM'
//      ⚪ uid <number> 设置进程的用户标识
//      ⚪ gid <number> 设置进程的群组标识。
//      ⚪ windowsHide <boolean> 隐藏子进程的控制台窗口（在 Windows 系统上通常会创建）。）。默认值: false
// ⚪ callback <Function> : ChildProcess 当进程终止时调用并带上输出。
//      ⚪ error <Error>
//      ⚪ stdout <string> | <Buffer>
//      ⚪ stderr <string> | <Buffer>
// 【 execFile 】
// execFile(
//     file: string,
//     args: ReadonlyArray<string> | undefined | null,
//     options: ({ encoding?: string | null } & ExecFileOptions) | undefined | null,
//     callback: ((error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) => void) | undefined | null,
// ): ChildProcess;
// ⚪ file <string> 要运行的可执行文件的名称或路径。
// ⚪ args <string[]> 字符串参数的列表
// ⚪ options <Object> 字符串参数的列表
//      ⚪ cwd, env, encoding, timeout, maxBuffer, killSignal, uid, gid, shell, windowsHide 与 【exec】 options相同
//      ⚪ windowsVerbatimArguments <boolean> 在 Windows 上不为参数加上引号或转义。在 Unix 上忽略。默认值: false。
// ⚪ callback <Function> 与 exec options相同
"child_process.execFile() \u51FD\u6570\u7C7B\u4F3C\u4E8E child_process.exec()\uFF0C\u4F46\u9ED8\u8BA4\u60C5\u51B5\u4E0B\u4E0D\u4F1A\u884D\u751F shell\u3002 \u76F8\u53CD\uFF0C\u6307\u5B9A\u7684\u53EF\u6267\u884C\u6587\u4EF6 file \u4F1A\u4F5C\u4E3A\u65B0\u8FDB\u7A0B\u76F4\u63A5\u5730\u884D\u751F\n\u7531\u4E8E\u6CA1\u6709\u884D\u751F shell\uFF0C\u56E0\u6B64\u4E0D\u652F\u6301 I/O \u91CD\u5B9A\u5411\u548C\u6587\u4EF6\u901A\u914D\u7B49\u884C\u4E3A";
"Promise \u7248\u4F1A\u8FD4\u56DE { stdout\uFF0Cstderr\uFF0Cchild } ";
// 【 fork 】
// fork(modulePath: string, args?: ReadonlyArray<string>, options?: ForkOptions): ChildProcess;
// ⚪ modulePath <string> 要在子进程中运行的模块。
// ⚪ args <string[]> 字符串参数的列表。
// ⚪ options <Object> 字符串参数的列表
//      ⚪ cwd, env, uid, gid, windowsVerbatimArguments 与 【execFile】 options相同
//      ⚪ detached <boolean> 准备子进程独立于其父进程运行。具体行为取决于平台，参阅 options.detached
//      ⚪ execPath <string> 用于创建子进程的可执行文件 【默认】将会使用父进程的 process.execPath 来衍生新的 Node.js 实例
//      ⚪ execArgv <string[]> 传给可执行文件的字符串参数的列表。默认值: process.execArgv。
//      ⚪ serialization <string> 指定用于在进程之间发送消息的序列化类型。可能的值为 'json' 和 'advanced'。
//      ⚪ execPath <string> 用于创建子进程的可执行文件
//      ⚪ silent <boolean> 如果为 true，则子进程的 stdin、stdout 和 stderr 将会被输送到父进程，
//         否则它们将会继承自父进程，详见 child_process.spawn() 的 stdio 中的 'pipe' 和 'inherit' 选项。默认值: false。
//      ⚪ stdio <Array> | <string> 参阅 options.stdio。。当提供此选项时，则它覆盖 silent 选项。
//         如果使用了数组变量，则它必须包含一个值为 'ipc' 的元素，否则将会抛出错误。例如 [0, 1, 2, 'ipc']。
"child_process.fork() \u65B9\u6CD5\u662F child_process.spawn() \u7684\u4E00\u4E2A\u7279\u4F8B\uFF0C\u4E13\u95E8\u7528\u4E8E\u884D\u751F\u65B0\u7684 Node.js \u8FDB\u7A0B\u3002 \u4E0E child_process.spawn() \u4E00\u6837\u8FD4\u56DE ChildProcess \u5BF9\u8C61\u3002\n \u8FD4\u56DE\u7684 ChildProcess \u5C06\u4F1A\u5185\u7F6E\u4E00\u4E2A\u989D\u5916\u7684\u901A\u4FE1\u901A\u9053\uFF0C\u5141\u8BB8\u6D88\u606F\u5728\u7236\u8FDB\u7A0B\u548C\u5B50\u8FDB\u7A0B\u4E4B\u95F4\u6765\u56DE\u4F20\u9012\u3002 \u8BE6\u89C1 subprocess.send()\u3002";
"\u884D\u751F\u7684 Node.js \u5B50\u8FDB\u7A0B\u72EC\u7ACB\u4E8E\u7236\u8FDB\u7A0B\uFF0C\u4F46\u4E24\u8005\u4E4B\u95F4\u5EFA\u7ACB\u7684 IPC \u901A\u4FE1\u901A\u9053\u9664\u5916\u3002 \n \u6BCF\u4E2A\u8FDB\u7A0B\u90FD\u6709\u81EA\u5DF1\u7684\u5185\u5B58\uFF0C\u5E26\u6709\u81EA\u5DF1\u7684 V8 \u5B9E\u4F8B\u3002 \u7531\u4E8E\u9700\u8981\u989D\u5916\u7684\u8D44\u6E90\u5206\u914D\uFF0C\u56E0\u6B64\u4E0D\u5EFA\u8BAE\u884D\u751F\u5927\u91CF\u7684 Node.js \u5B50\u8FDB\u7A0B\u3002";
// 【 spawn 】
// spawn(command: string, args: ReadonlyArray<string>, options: SpawnOptions): ChildProcess;
// ⚪ command <string> 要运行的命令。
// ⚪ args <string[]> 字符串参数的列表。
// ⚪ options <Object> 字符串参数的列表
//      ⚪ cwd, env, uid, gid, windowsVerbatimArguments, windowsHide, serialization   与 【execFile】 options相同
//      ⚪ argv0 <string> 显式地设置发送给子进程的 argv[0] 的值。如果没有指定，则将会被设置为 command 的值。
//      ⚪ detached <boolean> 准备子进程独立于其父进程运行。具体行为取决于平台
//      ⚪ execArgv <string[]> 传给可执行文件的字符串参数的列表。默认值: process.execArgv。
//      ⚪ serialization <string> 指定用于在进程之间发送消息的序列化类型。可能的值为 'json' 和 'advanced'。
//      ⚪ shell <boolean> | <string> 如果为 true，则在 shell 中运行 command。 
//         在 Unix 上使用 '/bin/sh'，在 Windows 上使用 process.env.ComSpec。 可以将不同的 shell 指定为字符串
"          child_process.spawn() \u4E2D\u53EF\u7528\u7684 shell \u9009\u9879\u5728 child_process.fork() \u4E2D\u4E0D\u652F\u6301\uFF0C\u5982\u679C\u8BBE\u7F6E\u5219\u5C06\u4F1A\u88AB\u5FFD\u7565";
// 【 options 】
// ⚪ detached <boolean>
"\u5728 Windows \u4E0A\uFF0C\u8BBE\u7F6E options.detached \u4E3A true \u53EF\u4EE5\u4F7F\u5B50\u8FDB\u7A0B\u5728\u7236\u8FDB\u7A0B\u9000\u51FA\u540E\u7EE7\u7EED\u8FD0\u884C\u3002 \u5B50\u8FDB\u7A0B\u6709\u81EA\u5DF1\u7684\u63A7\u5236\u53F0\u7A97\u53E3\u3002 \u4E00\u65E6\u4E3A\u5B50\u8FDB\u7A0B\u542F\u7528\u5B83\uFF0C\u5219\u65E0\u6CD5\u88AB\u7981\u7528\u3002\n\u5728\u975E Windows \u5E73\u53F0\u4E0A\uFF0C\u5982\u679C options.detached \u8BBE\u4E3A true\uFF0C\u5219\u5B50\u8FDB\u7A0B\u5C06\u4F1A\u6210\u4E3A\u65B0\u7684\u8FDB\u7A0B\u7EC4\u548C\u4F1A\u8BDD\u7684\u4E3B\u5BFC\u8005\u3002 \u5B50\u8FDB\u7A0B\u5728\u7236\u8FDB\u7A0B\u9000\u51FA\u540E\u53EF\u4EE5\u7EE7\u7EED\u8FD0\u884C\uFF0C\u4E0D\u7BA1\u5B83\u4EEC\u662F\u5426\u88AB\u5206\u79BB\u3002\n\n\u9ED8\u8BA4\u60C5\u51B5\u4E0B\uFF0C\u7236\u8FDB\u7A0B\u5C06\u4F1A\u7B49\u5F85\u88AB\u5206\u79BB\u7684\u5B50\u8FDB\u7A0B\u9000\u51FA\u3002 \u4E3A\u4E86\u9632\u6B62\u7236\u8FDB\u7A0B\u7B49\u5F85 subprocess\uFF0C\u53EF\u4EE5\u4F7F\u7528 subprocess.unref() \u65B9\u6CD5\u3002 \n\u8FD9\u6837\u505A\u5C06\u4F1A\u5BFC\u81F4\u7236\u8FDB\u7A0B\u7684\u4E8B\u4EF6\u5FAA\u73AF\u4E0D\u4F1A\u5C06\u5B50\u8FDB\u7A0B\u5305\u542B\u5728\u5176\u5F15\u7528\u8BA1\u6570\u4E2D\uFF0C\u4F7F\u5F97\u7236\u8FDB\u7A0B\u53EF\u4EE5\u72EC\u7ACB\u4E8E\u5B50\u8FDB\u7A0B\u9000\u51FA\uFF0C\u9664\u975E\u5B50\u8FDB\u7A0B\u548C\u7236\u8FDB\u7A0B\u4E4B\u95F4\u5EFA\u7ACB\u4E86 IPC \u901A\u9053\u3002\n\u5F53\u4F7F\u7528 detached \u9009\u9879\u6765\u542F\u52A8\u4E00\u4E2A\u957F\u671F\u8FD0\u884C\u7684\u8FDB\u7A0B\u65F6\uFF0C\u8BE5\u8FDB\u7A0B\u5728\u7236\u8FDB\u7A0B\u9000\u51FA\u540E\u5C06\u4E0D\u4F1A\u4FDD\u6301\u5728\u540E\u53F0\u8FD0\u884C\uFF0C\n\u9664\u975E\u63D0\u4F9B\u4E00\u4E2A\u4E0D\u8FDE\u63A5\u5230\u7236\u8FDB\u7A0B\u7684 stdio \u914D\u7F6E\u3002 \u5982\u679C\u7236\u8FDB\u7A0B\u7684 stdio \u662F\u7EE7\u627F\u7684\uFF0C\u5219\u5B50\u8FDB\u7A0B\u5C06\u4F1A\u4FDD\u6301\u7ED1\u5B9A\u5230\u63A7\u5236\u7EC8\u7AEF\u3002";
// ⚪ stdio <Array> | <string>
// options.stdio 选项用于配置在父进程和子进程之间建立的管道。 
// 默认情况下，子进程的 stdin、 stdout 和 stderr 会被重定向到 ChildProcess 对象上相应的 subprocess.stdin、subprocess.stdout 和 subprocess.stderr 流。 
// 这相当于将 options.stdio 设置为 ['pipe', 'pipe', 'pipe']。
"\u4E3A\u65B9\u4FBF\u8D77\u89C1\uFF0C options.stdio \u53EF\u4EE5\u662F\u4EE5\u4E0B\u5B57\u7B26\u4E32\u4E4B\u4E00\uFF1A\n'pipe' - \u76F8\u5F53\u4E8E ['pipe', 'pipe', 'pipe']\uFF08\u9ED8\u8BA4\u503C\uFF09\u3002\n'ignore' - \u76F8\u5F53\u4E8E ['ignore', 'ignore', 'ignore']\u3002\n'inherit' - \u76F8\u5F53\u4E8E ['inherit', 'inherit', 'inherit'] \u6216 [0, 1, 2]\n\u5426\u5219\uFF0C options.stdio \u7684\u503C\u662F\u4E00\u4E2A\u6570\u7EC4\uFF0C\u5176\u4E2D\u6BCF\u4E2A\u7D22\u5F15\u5BF9\u5E94\u4E8E\u5B50\u8FDB\u7A0B\u4E2D\u7684 fd\u3002 \nfd 0\u30011 \u548C 2 \u5206\u522B\u5BF9\u5E94\u4E8E stdin\u3001stdout \u548C stderr\u3002 \u53EF\u4EE5\u6307\u5B9A\u5176\u4ED6 fd \u4EE5\u4FBF\u5728\u7236\u8FDB\u7A0B\u548C\u5B50\u8FDB\u7A0B\u4E4B\u95F4\u521B\u5EFA\u989D\u5916\u7684\u7BA1\u9053\u3002 \u503C\u53EF\u4EE5\u662F\u4EE5\u4E0B\u4E4B\u4E00\uFF1A\n\n1. 'pipe' - \u5728\u5B50\u8FDB\u7A0B\u548C\u7236\u8FDB\u7A0B\u4E4B\u95F4\u521B\u5EFA\u4E00\u4E2A\u7BA1\u9053\u3002 \u7BA1\u9053\u7684\u7236\u7AEF\u4F5C\u4E3A child_process \u5BF9\u8C61\u4E0A\u7684 subprocess.stdio[fd] \u5C5E\u6027\u66B4\u9732\u7ED9\u7236\u8FDB\u7A0B\u3002\n    \u4E3A fd 0 - 2 \u521B\u5EFA\u7684\u7BA1\u9053\u4E5F\u53EF\u5206\u522B\u4F5C\u4E3A subprocess.stdin\u3001subprocess.stdout \u548C subprocess.stderr \u4F7F\u7528\u3002\n2. 'ipc' - \u521B\u5EFA\u4E00\u4E2A IPC \u901A\u9053\uFF0C\u7528\u4E8E\u5728\u7236\u8FDB\u7A0B\u548C\u5B50\u8FDB\u7A0B\u4E4B\u95F4\u4F20\u9012\u6D88\u606F\u6216\u6587\u4EF6\u63CF\u8FF0\u7B26\u3002 \u4E00\u4E2A ChildProcess \u6700\u591A\u53EF\u4EE5\u6709\u4E00\u4E2A IPC stdio \u6587\u4EF6\u63CF\u8FF0\u7B26\u3002 \n    \u8BBE\u7F6E\u6B64\u9009\u9879\u4F1A\u542F\u7528 subprocess.send() \u65B9\u6CD5\u3002 \u5982\u679C\u5B50\u8FDB\u7A0B\u662F\u4E00\u4E2A Node.js \u8FDB\u7A0B\uFF0C\u5219 IPC \u901A\u9053\u7684\u5B58\u5728\u5C06\u4F1A\u542F\u7528 process.send() \u548C process.disconnect() \u65B9\u6CD5\u3001\n    \u4EE5\u53CA\u5B50\u8FDB\u7A0B\u5185\u7684 'disconnect' \u548C 'message' \u4E8B\u4EF6\u3002\n\n    \u4EE5 process.send() \u4EE5\u5916\u7684\u4EFB\u4F55\u65B9\u5F0F\u8BBF\u95EE IPC \u901A\u9053\u7684 fd\u3001\u6216\u8005\u5728\u4E00\u4E2A\u4E0D\u662F Node.js \u5B9E\u4F8B\u7684\u5B50\u8FDB\u7A0B\u4E2D\u4F7F\u7528 IPC \u901A\u9053\uFF0C\u90FD\u662F\u4E0D\u652F\u6301\u7684\u3002\n\n3. 'ignore' - \u6307\u793A Node.js \u5FFD\u7565\u5B50\u8FDB\u7A0B\u4E2D\u7684 fd\u3002 \u867D\u7136 Node.js \u5C06\u4F1A\u59CB\u7EC8\u4E3A\u5B83\u884D\u751F\u7684\u8FDB\u7A0B\u6253\u5F00 fd 0 - 2\uFF0C\n    \u4F46\u5C06 fd \u8BBE\u7F6E\u4E3A 'ignore' \u5C06\u4F1A\u5BFC\u81F4 Node.js \u6253\u5F00 /dev/null \u5E76\u5C06\u5176\u9644\u52A0\u5230\u5B50\u8FDB\u7A0B\u7684 fd\u3002\n\n4. 'inherit' - \u5C06\u76F8\u5E94\u7684 stdio \u6D41\u4F20\u7ED9\u7236\u8FDB\u7A0B\u6216\u4ECE\u7236\u8FDB\u7A0B\u4F20\u5165\u3002 \u5728\u524D\u4E09\u4E2A\u4F4D\u7F6E\u4E2D\uFF0C\u8FD9\u5206\u522B\u76F8\u5F53\u4E8E process.stdin\u3001 process.stdout \u548C process.stderr\u3002 \n    \u5728\u4EFB\u4F55\u5176\u4ED6\u4F4D\u7F6E\u4E2D\uFF0C\u5219\u76F8\u5F53\u4E8E 'ignore'\u3002\n\n5. <Stream> \u5BF9\u8C61 - \u4E0E\u5B50\u8FDB\u7A0B\u5171\u4EAB\u6307\u5411 tty\u3001\u6587\u4EF6\u3001 socket \u6216\u7BA1\u9053\u7684\u53EF\u8BFB\u6216\u53EF\u5199\u6D41\u3002 \u6D41\u7684\u5E95\u5C42\u6587\u4EF6\u63CF\u8FF0\u7B26\u5728\u5B50\u8FDB\u7A0B\u4E2D\u4F1A\u88AB\u590D\u5236\u5230\u4E0E stdio \u6570\u7EC4\u4E2D\u7684\u7D22\u5F15\u5BF9\u5E94\u7684 fd\u3002 \n    \u8BE5\u6D41\u5FC5\u987B\u5177\u6709\u4E00\u4E2A\u5E95\u5C42\u7684\u63CF\u8FF0\u7B26\uFF08\u6587\u4EF6\u6D41\u76F4\u5230\u89E6\u53D1 'open' \u4E8B\u4EF6\u624D\u9700\u8981\uFF09\u3002\n\n6. \u6B63\u6574\u6570 - \u6574\u6570\u503C\u4F1A\u88AB\u89E3\u91CA\u4E3A\u5F53\u524D\u5728\u7236\u8FDB\u7A0B\u4E2D\u6253\u5F00\u7684\u6587\u4EF6\u63CF\u8FF0\u7B26\u3002 \u5B83\u4E0E\u5B50\u8FDB\u7A0B\u5171\u4EAB\uFF0C\u7C7B\u4F3C\u4E8E\u5171\u4EAB <Stream> \u5BF9\u8C61\u7684\u65B9\u5F0F\u3002 \u5728 Windows \u4E0A\u4E0D\u652F\u6301\u4F20\u5165 socket\u3002\n\n7. null \u6216 undefined - \u4F7F\u7528\u9ED8\u8BA4\u503C\u3002 \u5BF9\u4E8E stdio \u7684 fd 0\u30011 \u548C 2\uFF08\u6362\u53E5\u8BDD\u8BF4\uFF0Cstdin\u3001stdout \u548C stderr\uFF09\uFF0C\u5C06\u4F1A\u521B\u5EFA\u4E00\u4E2A\u7BA1\u9053\u3002\n    \u5BF9\u4E8E fd 3 \u53CA\u66F4\u5927\u7684\u503C\uFF0C\u5219\u9ED8\u8BA4\u4E3A 'ignore'\u3002\n";
// 【 ChildProcess 类 】
// 继承自: <EventEmitter>
// ⚪ 'close' 事件 (code: number signal: string) => void
// 当子进程的 stdio 流已被关闭时会触发 'close' 事件。 这与 'exit' 事件不同，因为多个进程可能共享相同的 stdio 流。
// ⚪ 'disconnect' 事件
// 调用父进程中的 subprocess.disconnect() 或子进程中的 process.disconnect() 后会触发 'disconnect' 事件。 
// 断开连接后就不能再发送或接收信息，且 subprocess.connected 属性为 false。
// ⚪ 'error' 事件
// 每当出现以下情况时触发 'error' 事件：
// 无法衍生进程
// 无法杀死进程
// 向子进程发送消息失败
// ⚪ 'exit' 事件 (code: number signal: string) => void
// 当子进程结束后时会触发 'exit' 事件。 如果进程退出，则 code 是进程的最终退出码，否则为 null。 
// 如果进程是因为收到的信号而终止，则 signal 是信号的字符串名称，否则为 null。 这两个值至少有一个是非空的。
"\u5F53 'exit' \u4E8B\u4EF6\u88AB\u89E6\u53D1\u65F6\uFF0C\u5B50\u8FDB\u7A0B\u7684 stdio \u6D41\u53EF\u80FD\u4F9D\u7136\u662F\u6253\u5F00\u7684\u3002\nNode.js \u4E3A SIGINT \u548C SIGTERM \u5EFA\u7ACB\u4E86\u4FE1\u53F7\u5904\u7406\u7A0B\u5E8F\uFF0C\u4E14 Node.js \u8FDB\u7A0B\u6536\u5230\u8FD9\u4E9B\u4FE1\u53F7\u4E0D\u4F1A\u7ACB\u5373\u7EC8\u6B62\u3002 \n\u76F8\u53CD\uFF0CNode.js \u5C06\u4F1A\u6267\u884C\u4E00\u7CFB\u5217\u7684\u6E05\u7406\u64CD\u4F5C\uFF0C\u7136\u540E\u518D\u91CD\u65B0\u63D0\u5347\u5904\u7406\u540E\u7684\u4FE1\u53F7\u3002";
// ⚪ 'message' 事件 (message, sendHandle) => void
// 当子进程使用 process.send() 发送消息时会触发 'message' 事件。消息通过序列化和解析进行传递
// message <Object> 一个已解析的 JSON 对象或原始值。
// sendHandle <Handle> 一个 net.Socket 或 net.Server 对象，或 undefined。
// 【 properties | function 】
// subprocess.channel  对子进程的 IPC 通道的引用
// subprocess.connected  是否可以从子进程发送和接收消息
// subprocess.disconnect() 关闭父进程与子进程之间的 IPC 通道，一旦没有其他的连接使其保持活跃，则允许子进程正常退出
// subprocess.kill(signal: number | string): boolean 向子进程发送一个信号。 如果没有给定参数，则进程将会发送 'SIGTERM' 信号,返回是否操作成功
// 虽然该函数被称为 kill，但传给子进程的信号 可能 实际上不会终止该进程。
// subprocess.killed  subprocess.kill() 成功发送信号到子进程后，该值会被设为 true。并不表明子进程是否已被终止
// subprocess.pid 子进程的进程标识符（PID）
// subprocess.ref()  调用 subprocess.unref() 之后再调用 subprocess.ref() 将会为子进程恢复已删除的引用计数，强迫父进程在退出自身之前等待子进程退出。
// subprocess.unref() 默认情况下，父进程将会等待已分离的子进程退出。 为了防止父进程等待给定的 subprocess 退出，可使用 subprocess.unref() 方法。
// 这样做将会导致父进程的事件循环不会在其引用计数中包括子进程，允许父进程独立于子进程退出，除非子进程与父进程之间已建立了 IPC 通道。
// subprocess.send(message: Serializable, sendHandle?: SendHandle, options?: MessageOptions, callback?: (error: Error | null) => void): boolean;
//      ⚪ message 传递的消息
//      ⚪ sendHandle net.Socket | net.Server 可选的 sendHandle 参数用于将 TCP 服务器或 socket 对象传给子进程
//         子进程将会接收该对象作为传给在 'message' 事件上注册的回调函数的第二个参数。 在 socket 中接收和缓冲的任何数据都不会被发送给子进程。
//      ⚪ options.keepOpen 传给 net.Socket 实例时可以使用的值。当设为 true 时，则 socket 在发送过程中会保持打开状态
// 如果通道已关闭、或当未发送的消息的积压超过阈值使其无法发送更多时， subprocess.send() 将会返回 false
// subprocess.stderr 表示子进程的 stderr 的可读流。
// subprocess.stdin 表示子进程的 stdin 的可写流。
// subprocess.stdio 一个到子进程的管道的稀疏数组
// subprocess.stdout 表示子进程的 stdout 的可读流
// example
var sp_bat_subProcess = child_process_1.spawn('node', [".\\files\\child_process\\sub_process.js"]);
sp_bat_subProcess.stdout.on('data', function (data) {
    console.log("subProcess stdout: " + data);
});
sp_bat_subProcess.stderr.on('error', function (data) {
    console.log("subProcess stderr: " + data);
});
sp_bat_subProcess.on('close', function (code) {
    console.log("subProcess exit code: " + code);
});
//# sourceMappingURL=index.js.map