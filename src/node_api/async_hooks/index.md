# AsyncHook

## **AsyncHook**

### **AsyncHook.executionAsyncId(): number**
    返回当前执行上下文
### **AsyncHook.triggerAsyncId(): number**
    负责调用当前正在执行的回调的资源ID。
### **AsyncHook.createHook(HookCallbacks:{init?; before?, after?, destroy? promiseResolve?}): AsyncHook**
AsyncHook.createHook(HookCallbacks:{init?; before?, after?, destroy? promiseResolve?}): <AsyncHook>  

用于禁用和启用`hook`的实例    
注册每个异步操作的不同生存期事件要调用的函数。  
异步操作(如`console.log`)将导致调用`AsyncHooks`回调,在`AsyncHooks`回调函数中使用异步操作将导致无限递归    

* init(asyncId:number,type: string,triggerAsyncId: number,resource: Object):void  
*在对象构造期间调用`init`。此回调运行时资源可能尚未完成构造，因此“`asyncId`”引用的资源的所有字段可能尚未填充*

    asyncId 异步资源的唯一ID  
    type  异步资源的类型  
    triggerAsyncId 在这个异步资源被创建的执行上下文中的异步资源唯一ID  
    resource 代表异步操作的资源的引用，需要在销毁过程中释放 
 
    当一个类被创建的时候被调用，可能会发射一个异步事件。这并不意味着`before`/`after`必须在`destroy`之前被调用，只是存在这种可能
    每一个新的资源在当前的Node.js实例中都被指派了一个唯一ID

* before(asyncId: number):void  
*在调用资源回调之前调用before。对于句柄（例如TCPWrap）可以调用0-N次，对于请求（例如FSReqCallback）则可以精确地调用1次。*  

    当一个异步操作开始（比如，一个`TCP`服务器接收到一个新链接）或者结束（例如写数据到磁盘）的时候，会调用一个回调通知用户。`before`回调是刚才说的开始时的回调。  
    asyncId &nbsp;&nbsp; 执行回调函数的资源的唯一标识。   
    before &nbsp;&nbsp; 回调将会被调用0到N次。`before`回调被调用0次的典型例子是，异步操作被取消，例如，没有一个`TCP`服务器接收链接。像`TCP`服务器这样的持久异步资源会调用`before`回调多次，像`fs.open()`这样的操作只会调用一次。

* after(asyncId: number):void  
*after在资源回调结束后调用*  

    `before`的回调结束后，立即调用。  
    如果一个未捕获的异常在执行回调时抛出，则`after`会在  `uncaughtException` 事件被发射，或者一个`domain`的句柄运行之后执行。

* destroy(asyncId: number):void  
*当AsyncWrap实例被销毁时调用*  

    当`asyncId`标识的资源被销毁时调用。它同样被嵌入器API `emitDestroy()`异步调用。  
    有些资源依赖垃圾收集进行清理，所以如果一个引用是把`resource`对象传递到`init`，则有可能`destroy`将永远不会被调用，会在应用中导致一个内存溢出。如果资源不依赖垃圾回收，则这不是一个问题。

* promiseResolve(asyncId: number)  
*只有Promise会引起调用,(promise状态为resloved时触发)*

## **hook**

### **hooks.disable()**
从要执行的全局回调池中禁用给定实例的回调。禁用挂钩之后，除非启用挂钩，否则不会再次调用它。
### **hooks.enable()**
启用给定`AsyncHook`实例的回调。如果未提供回调，则启用空操作。