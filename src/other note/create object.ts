namespace FactorMode {
    function factor(a: any) {
        const obj: any = {};
        obj.a = a;
        return obj;
    }
    const a = factor(1);
    // no instance of
}


namespace ConstructorMode {
    class A {
        constructor() {
            (<any>this).func = function(){};
        }
    };
    // or
    // function A(a: any) {
    //     this.func = function(){};
    // }
    const a = new A();
    // no function reused
}


namespace PrototypeMode {
    function A() {};
    A.prototype.a = [1,2,3];
    A.prototype.func = function() {}

    const a = new (<any>A)();
    // address reference
}


namespace ConstructorWithPrototype {
    class A {
        constructor () {
        }
    }
    (<any>A).prototype.func = function() {}
    const a = new A();
}


namespace ParasiticStructure {
    class Origin {};
    function Parasitic(a: any) {
        const obj: any = new Origin();
        obj.a = a;

        return obj;
    }
    const a = Parasitic(1);
    // no instance of
}

namespace StableStructure {
    function A (a: any) {
        const privateVar = 0;
        const o: any = new Object();
        o.getPrivate = function() { return privateVar };
        return o;
    }
    const a = A(1);
    // no instance of
}

