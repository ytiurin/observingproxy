# Observing proxy

This module is based on the [`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) method and serves as a proxy to the user provided object, notifying subscribers about the object changes.

```javascript
// Your observable object
var obj = { person: "Eddie", age: 22 }
// Subscribe to object changes
_o.onUpdate( obj, {
  // age value change
  age: function( value ) {
    if ( value > this.oldValue )
      console.log( "Happy birthday, Peter!" )
  },
  // person value change
  person: function( value ) {
    console.log( this.oldValue + " is now " + value )
  }
})
// Change object properties using proxy
_o( obj ).person = "Peter"
//> Eddie is now Peter
_o( obj ).age++
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
_o.observe( obj, function( changes ) {
  // `changes` is an array of changes
  // that occured recently
  for ( var i = 0; i < changes.length; i++ )
    if ( changes[ i ].name === "age" )
      if ( changes[ i ].object.age > changes[ i ].oldValue )
        console.log( "Happy birthday, Peter!" )
})
// Change object property using proxy
_o( obj ).age++
//> Happy birthday, Peter!
```

> Note: Observation works only when property operation is `update`. There is no support for `add` or `delete` operations.

## With arrays

```javascript
// Your observable array
var arr = [ 1, 2, 3 ]
// Subscribe for array changes
_o.observe( arr, function( changes ) {
  // Iterate through changes
  for ( var i = 0; i < changes.length; i++ )
    // Check if array changed
    if ( changes[ i ].type === "splice" )
      console.log( "Array changed" )
})
// Add item to the array
_o( arr ).push( 4 )
//> Array changed
```

## Error handling and destructor
```javascript
// Let's create observer for `null` object
var observer = _o.onUpdate( null, 'name', function( value ) {
  //...
})
// and try to report an error
try {
  // If there was any error during the observer contruction,
  // an exception will be thrown
  observer.report()
}
catch( e ) {
  // Observing proxy error: target is null
}
// Destroy your observer
observer.destroy()
```

## Deferred observer notification
While proxy changes an observed object properties immediately, it sends all the notification calls to the end of the execution thread using `setTimeout` as a wrapper.

So when you do:

```javascript
_o.observe( obj, function( changes ) {
  console.log( changes )
});
// Change several properties
_o( obj ).p1 = 1
_o( obj ).p2 = 2
_o( obj ).p3 = 3
//> [{ name: "p1", object: Object, oldValue: 0, type: "update" },
//> { name: "p2", object: Object, oldValue: 0, type: "update" },
//> { name: "p3", object: Object, oldValue: 0, type: "update" }]
```

observer is notified only once with `changes` containing latest modifications. It makes observer a load sustainable to an observed object being intensively modified.
