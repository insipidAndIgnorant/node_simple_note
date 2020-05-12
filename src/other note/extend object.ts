namespace PrototypeLink {
    function SuperFunc () {
        // this.p = true;
    };
    SuperFunc.prototype.getp = function() { return this.p }

    function SubFunc() {
        // this.p = false;
    }
    SubFunc.prototype = new (<any>SuperFunc)();

    
    // constructor : function
    // 只有【对象】才有此属性， 表示对象的构造函数
    

    // __Proto__ : object
    // 只有【对象】才有此属性， 表示对象的原型 / 构造函数的prototype


    // prototype : object
    // 只有【函数】才有此属性， 表示实例对象共有的属性方法


    // 函数也是一种 对象
    


    new (<any>SubFunc)().constructor // SuperFunc
    // sub.constructor: sub自身没有constructor, 从sub.__proto__继承;
    // sub.__proto__即SubFunc.prototype也没有constructor; 
    // SubFunc.prototype__由SuperFunc实例化，所以从SubFunc.prototype.__proto__即SuperFunc.prototype继承
    // SuperFunc.prototype.constructor指向SuperFunc


    new (<any>SubFunc)().__proto__; // {p: true}  instance of SuperFunc
    // SubFunc.__proto__指向sub构造函数的prototype也就是SubFunc.prototype

    new (<any>SubFunc)().constructor.prototype; // {getp: ƒ, constructor: SuperFunc}
    // 也就是 SuperFunc.prototype;

    SubFunc.prototype;  // {p: true}  instance of SuperFunc
    // SubFunc.prototype = new SuperFunc(); 设置SuperFunc实例为新prototype,因此SubFunc.prototype没有constructor
    // getP在SuperFunc.prototype/sub.__proto__.__Proto__上
    


    new (<any>SuperFunc)().constructor  // SuperFunc

    new (<any>SuperFunc)().__proto__; // {getp: ƒ, constructor: SuperFunc}
    // 除了构造函数，还有显式设置的getp

    new (<any>SuperFunc)().constructor.prototype; // {getp: ƒ, constructor: SuperFunc}
    // 也就是SuperFunc.prototype;

    SuperFunc.prototype; // {getp: ƒ, constructor: SuperFunc} instance Object
}

namespace ExtendsClass {
    class Super {
        constructor() {
            // code
        };
        p = true; // on instance

        getp() { // on __proto__
            return this.p;
        };

        getA = function aaa() {  // on instance
        }
    }

    // class constructor外【方法】是在__proto__上， 【属性】在【实例】中;  constructor内为实例属性(a = func or b = c)


    class Sub extends Super {
        constructor() {
            super();
        }
    }

    // another prototypeLink, but look like extends
    // function Super () {
    //     // code
    //     this.p = true;
    //     this.getA = function aaa() {}
    // }
    // Super.prototype.getp = function() { return this.p };

    // function Sub () {
    //     Super.call(this);
    // }
    // Sub.prototype =  new Super(); 
    // // 与extends不同的是： extends是用父类的constructor创建子类的实例属性，sub.__proto__ :{ constructor: Sub }，因而子类是自己的实例属性 sub: { p: true, getA:f };
    // // 而这里是将父类的实例属性挂在子类原型上 sub.__proto__ : { p:true, getA:f, constructor: Sub },子类继承属性 sub: { }。 
    // // 可以在Sub内使用Super.call(this) (借用构造函数)使子类拥有实例属性，但原型上依旧会有父类实例属性
    // Sub.prototype.constructor = Sub; // 恢复与自身断开的连接
    // Sub['__proto__'] = Super   // or: Reflect.setPrototypeOf(Sub, Super)


    new (<any>Sub)()['__proto__'];   // { constructor: Sub }  //// instance of Super
   

    Sub.prototype; // { constructor: Sub }  //// instance of Super

    new Sub().constructor;   // Sub

    (<any>Sub)['__proto__'];  // Super

    Sub.constructor.constructor.prototype;  // Native Code
}


// 原型式继承
namespace PrototypeExtend {
    export function object(o: any) {
        function F() {};
        F.prototype = o;

        return new (<any>F)();
    }

    // like Object.creat() only one param
}


// 寄生式继承
namespace ParasiticExtend {
    function parasitic(origin: any) {
        const another = PrototypeExtend.object(origin); // 创建副本
        another.addFunc = function() {} // 在副本上增强
    }
}

// 组合寄生
namespace CombinedParsitic {
    function combinedparsitic(Sub: any, Super: any) {
        const superProto = PrototypeExtend.object(Super.prototype);
        Sub.prototype = superProto;
        Sub.prototype.constructor = Sub;
    }
}