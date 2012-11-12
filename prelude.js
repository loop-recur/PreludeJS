;(function (window, undefined) { 

  // ADD TYPE SIGNATURES
  // Add definintion docs at top explaining autocurry
  // Helpers
  
  // Detect free variables "exports" and "global", and create 
  // "prelude" namespace
  var freeExports = typeof exports == 'object' && exports,
      freeGlobal = typeof global == 'object' && global,
      functional = {},
      prelude = {},
      oldPrelude = {};
 
  //+ argsToList :: Arguments -> [a] 
  function argsToList(x) {
    return Array.prototype.slice.call(x);
  }

  //+ isArray :: a -> Bool
  function isArray(obj) {
    return (obj && obj.constructor == Array);
  }

  //+ isObj :: a -> Bool
  function isObj(obj) {
    return (typeof obj == "object" && !isArray(obj));
  }

  //+ Integer -> (? -> a) -> [a]
  nTimes = function(times, fun) {
    var result = [];
    for(var i=0;i<times;i++ ){ result = cons(fun(), result); }
    return result;
  }.autoCurry();

  //+ log :: a -> a
  log = function(what) {
    console.log(what);
    return what;
  }

  //+ log2 :: String -> a -> a
  log2 = function(one, two) {
    log(one);
    return log(two);
  }.autoCurry();

  //+ unfolder ::
  unfoldr = function(step, seed) {
    var output = [], result;
    
    while (result = step(seed)) {
      output.push(result[0]);
      seed = result[1];
    }
    
    return output;
  }.autoCurry();



  // Array

  //+ take :: Integer -> [a] -> [a]
  take = function(n, xs) {
    return xs.slice(0, n);
  }.autoCurry();

  //+ drop :: Integer -> [a] -> [a]
  drop = function(n, xs) {
    return xs.slice(n, xs.length);
  }.autoCurry();

  //+ unshift :: [a] -> b -> [b,a]
  unshift = function(xs, other) {
    return other.concat(xs);
  }.autoCurry();

  //+ cons :: [a] -> b -> [a,b]
  cons = function(xs, other) {
    return [xs].concat(other);
  }.autoCurry();

  //+ concat :: [a] -> b -> [a,b]
  concat = function(xs, other) {
    return xs.concat(other);
  }.autoCurry();

  //+ first :: [a] -> a
  first = function(xs) {
    if(!xs) throw("Calling first on non-array");
    return xs[0];
  };

  //+ rest :: [a] -> [a] 
  rest = function(xs) {
    return (typeof xs == "string") ? xs.substr(1, xs.length) : xs.slice(1, xs.length);
  };

  //+ last :: [a] -> a
  last = function(xs) {
    return xs[xs.length -1];
  };

  //+ join :: String -> [String] -> String
  join = function(token, xs) {
    return xs.join(token);
  }.autoCurry();

  //+ groupsOf :: Integer -> [a] -> [[a]]
  groupsOf = function(n, xs) {
    if(!xs.length) return [];
    return cons(take(n, xs), groupsOf(n, drop(n,xs)));
  }.autoCurry();

  zipWith = function(xs, ys) {
    return map(function(f){ return map(f, ys); }, xs);
  }.autoCurry();

  //+ uniq :: [a] -> [a] 
  uniq = function(xs) {
    var result = [];
    for(var i=0;i<xs.length;i++ ) { if(result.indexOf(xs[i]) < 0) result.push(xs[i]); };
    return result;
  }

  //+ uniqBy :: () -> [a] 
  uniqBy = function(fun, xs) {
    var result = [], len = xs.length, fun = fun.toFunction();
    for(var i=0;i<len;i++ ) {
      if(map(fun)(result).indexOf(fun(xs[i])) < 0) {
        result.push(xs[i]);
      }
    };
    return result;
  }.autoCurry();

  //+ reverse :: [a] -> [a]
  reverse = function(xs) {
    var mempty = (typeof xs == "string") ? "" : [];
    return reduce(function(x, acc){ return acc.concat(x); }, mempty, xs);
  }.autoCurry();

  //+ sort :: [a] -> [a]
  sort = function(xs) {
    return xs.sort();
  }

  //+ element :: [a] -> b -> Bool
  element = function(arr, x) {
    return arr.indexOf(x) >= 0
  }.autoCurry();

  //+ flatten :: [[a]] -> [a]
  flatten = reduce(function(a,b){return a.concat(b);}, []);

  // altered from prototype
  //+ sortBy ::
  sortBy = function(fun, xs) {
    var _sortBy = function(iterator, xs, context) {
      return map('.value', map(function(value, index) {
        return {
          value: value,
          criteria: iterator.call(context, value, index)
        };
      }, xs).sort(function(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
      }));
    }
    var f = fun.toFunction();
    return _sortBy(f, xs);
  }.autoCurry();

  //+ groupBy :: () -> [a] -> {false: [a], true: [a]}
  groupBy = function(fun, xs) {
    var f = fun.toFunction();
    var _makeHash = function(obj, x) {
      var val = f(x);
      if(!obj[val]) obj[val] = [];
      obj[val].push(x);
      return obj;
    }
    
    return reduce(_makeHash, {}, xs);
  }.autoCurry();


  //+ filterByProperty ::
  filterByProperty = function(prop, val, xs) {
    return compose(first, filter(function(p){return p[prop] == val}))(xs);
  }.autoCurry();



  // String
  //+ strip :: String -> String
  strip = function(str) {
    return str.replace(/\s+/g, "");
  }

  //+ split :: String -> String -> [String]
  split = function(token, xs) {
    return xs.split(token);
  }.autoCurry();

  //+ test :: RegEx -> String -> Bool
  test = function(expr, x) {
    return expr.test(x);
  }.autoCurry();

  //+ match :: RegEx -> String -> [] 
  match = function(expr, x) {
    return x.match(expr);
  }.autoCurry();

  //+ replace :: RegEx -> String -> String -> String
  replace = function(pattern, sub, str) {
    return str.replace(pattern, sub);
  }.autoCurry();



  // Conditional
  //+ when :: Bool -> (? -> a) -> a
  when = function(pred, f) {
    return function() {
      if(pred.apply(this, arguments)) return f.apply(this, arguments);
    }
  }.autoCurry();

  //+ ifelse :: Bool -> (? -> a) -> (? -> b) -> a|b
  ifelse = function(pred, f, g) {
    return function() {
      return pred.apply(this, arguments) ? f.apply(this, arguments) : g.apply(this, arguments);
    }
  }.autoCurry();

  //+ negate :: Bool -> Bool
  negate = function(bool) {
    return !bool;
  }

  //+ andand :: a -> b -> Bool 
  andand = function(x, y) {
    return x && y;
  }.autoCurry();

  //+ oror :: a -> b -> Bool
  oror = function(x, y) {
    return x || y;
  }.autoCurry();



  // Object
  //+ setVal :: String -> Object -> a -> a
  setVal = function(attribute, x, val) {
    x[attribute] = val;
    return val;
  }.autoCurry();

  //+ setVals ::
  setVals = function(obj1, obj2) {
    var target = {};
    for(k in obj1) { target[k] = obj1[k].toFunction()(obj2); }
    return target;
  }.autoCurry();

  //+ getVal :: String -> Object -> a
  getVal = function(attribute, x) {
    return function(){ return x[attribute]; };
  }.autoCurry();

  //+ merge :: Object -> Object -> Object
  merge = function(x,y) {
    var target = {};
    for(property in x) target[property] = x[property];
    
    for(property in y) {
      if(isObj(y[property])) {
        merge(target[property], y[property]);
      } else {
        if(target && y) target[property] = y[property];
      }
    }
    return target;
  }.autoCurry();

  //+ unionWith :: () -> Object -> Object -> Object
  unionWith = function(f, x, y) {
    f = f.toFunction();
    var target = {};
    for(property in x){ if(x.hasOwnProperty(property)) target[property] = x[property]; }
    
    for(property in y) {
      if(y.hasOwnProperty(property)) {
          if(isObj(y[property].valueOf())) {
            unionWith(f, target[property], y[property]);
          } else {
            if(x[property]) {
              target[property] = f(x[property], y[property]);
            } else {
              target[property] = y[property];
            }
          }
        }
      }
    return target;
  }.autoCurry();



  // Math
  //+ random :: Integer -> Integer
  random = function(i) {
    return Math.floor(Math.random()*i);
  }

  //+ subtract :: Number -> Number -> Number
  subtract = function(x,y){
    return y - x;
  }.autoCurry();

  //+ sum :: [Number] -> Number
  sum = reduce('+', 0);

  //+ div :: Number -> Number -> Number
  div = function(x,y){ return x / y; }

  //+ average :: [Number] -> Number
  average = function(xs) {
    return parseFloat(div(sum(xs), xs.length), 10);
  }



  // Other
  //+ repeat :: a -> Integer -> [a]
  repeat = function(arg, n) {	
    return nTimes(n, id.curry(arg));
  }.autoCurry();

  //+ sleep :: Integer -> _
  sleep = function(millis) {
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
  }

  // Add functions to the "functional" namespace,
  // autoCurry() functions where appropriate
  prelude.argsToList = argsToList;
  prelude.isArray = isArray;
  prelude.isObj = isObj;

  // Detect free variable "global" and use it as "window"
  if (freeGlobal.global === freeGlobal) {
    window = freeGlobal;
  }

  // Used to restore the original reference in "noConflict()"
  oldPrelude = window.prelude;

  // Reverts the "functional" variable to its previous value and 
  // returns a reference to the "functional" function.
  // example:
  //   var functional = functional.noConflict();
  prelude.noConflict = function noConflict() {
    window.prelude = oldPrelude;
    return this;
  }

  // Expose all functions to the global namespace, or specified environment
  prelude.expose = function expose(env) {
    var fn;
    env = env || window;
    for (fn in prelude) {
      if (fn !== 'expose' && prelude.hasOwnProperty(fn)) {
        env[fn] = prelude[fn];
      }
    }
  };

  // Expose FunctionalJS library
  // Some AMD build optimizers, like r.js, check for specific condition
  // patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose FunctionalJs to the global object even when an AMD loader
    // is present, in case FunctionalJS was injected by a third-party
    // script and not intended to be loaded as module. The global
    // assignment can be reverted in the FunctionalJS module via its
    // "noConflict()" method.
    window.prelude = prelude;

    // Define an anonymous AMD module, require functional.js lib
    define(['functional'], function (functional) { return prelude; });
  }

  // Check for "exports" after "define", in case a build optimizer adds
  // an "exports" object.
  else if (freeExports) {
    // Require functional.js lib
    functional = require('../FunctionalJS/functional');
    
    // Node.js or RingoJS v0.8.0+
    if (typeof module == 'object' && module && module.exports == freeExports) {
      module.exports = prelude;
    }
    // Narwhal or RingoJS v0.7.0-
    else {
      freeExports.prelude = prelude;
    }
  }

}(this));
