# Observing proxy
A proxy for observing object mutations

## Use
```javascript
var obj={name:'Peter',age:22};

_o.observe(obj,function(changes){
  for(var i=0;i<changes.length;i++)
    if(changes[i].name==='age')
      if(changes[i].object.age>changes[i].oldValue)
        console.log('Peter got older')
});

_o(obj).age=23;
//> Peter got older
```
