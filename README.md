# Observing proxy
A proxy observing object state using `defineProperty` and deferred notifications. 

## Usage
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

### Advanced usage (implemented with [Object.observe](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe) in mind)

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

### With arrays

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

### Error handling
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
```

## Deferred observer notification
While proxy applies property modification immediately, it sends the observer notification call to the end of execution thread using setTimeout as wrapper.

So now if you do

```javascript
_o.observe(obj,function(changes){
  // iterate changes
});

_o(obj).p1=1;
_o(obj).p2=2;
_o(obj).p3=3;
```

observer is notified only once with `changes` argument containing latest modifications. It makes observer load sustainable to cases when observed object is intensively changed. 
