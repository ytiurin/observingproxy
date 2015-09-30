# Observing proxy
A proxy for observing object state.

## Usage
```javascript
var obj={person:'Peter',age:22};

_o.observeProperty(obj,'age',function(value){
  if(value>this.oldValue)
    console.log('Happy birthday, Peter!')
});

_o(obj).age++;
//> Happy birthday, Peter!
```

Advanced usage (with [Object.observe](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe) in mind)

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

With arrays:

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
