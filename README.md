[![npm](https://img.shields.io/npm/v/observingproxy.svg?maxAge=2592000)](https://www.npmjs.com/package/observingproxy)
[![npm](https://img.shields.io/npm/dm/observingproxy.svg?maxAge=2592000)](https://www.npmjs.com/package/observingproxy)

# Observing proxy
A proxy for observing object state changes.

This module is based on the [`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) method and serves as an interface to the user provided object, notifying subscribers about the user object changes.

```javascript
var obj={person:'Eddie',age:22};

_o.onUpdate(obj,{
  age:function(value){
    if(value>this.oldValue)
      console.log('Happy birthday, Peter!')
  },
  person:function(value){
    console.log(this.oldValue+' is now '+value);
  }
});

_o(obj).person='Peter';
//> Eddie is now Peter
_o(obj).age++;
//> Happy birthday, Peter!
```

## Install
```
npm install observingproxy
```
or
```
bower install observingproxy
```

## Advanced usage (implemented with [Object.observe](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe) in mind)

```javascript
var obj={person:'Peter',age:22};

_o.observe(obj,function(changes){
  for(var i=0;i<changes.length;i++)
    if(changes[i].name==='age')
      if(changes[i].object.age>changes[i].oldValue)
        console.log('Happy birthday, Peter!')
});

_o(obj).age++;
//> Happy birthday, Peter!
```

> Note: it works only with property `update`. `add` or `delete` operations are not supported.

## With arrays

```javascript
var arr=[1,2,3];

_o.observe(arr,function(changes){
  for(var i=0;i<changes.length;i++)
    if(changes[i].type==='splice')
      console.log('Array changed')
});

_o(arr).push(4);
//> Array changed
```

## Error handling and destructor
```javascript
var observer=_o.onUpdate(null,'name',function(value){
  //...
});

// Throw observation exception here
try{
  observer.report();
}
catch(e){throw e}
// Observing proxy error: target is null

// Destroy your observer
observer.destroy();
```

## Deferred observer notification
While proxy applies property modification immediately, it sends the observer notification call to the end of execution thread using `setTimeout` method as a wrapper.

So now, if you do

```javascript
_o.observe(obj,function(changes){
  // iterate changes
});

_o(obj).p1=1;
_o(obj).p2=2;
_o(obj).p3=3;
```

observer is notified only once with `changes` argument containing latest modifications. It makes observer a load sustainable to an observed object being intensively modified.
