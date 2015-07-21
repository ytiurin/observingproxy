/*
 * Observing proxy v1.0
 * https://github.com/ytiurin/observing-proxy.js
 * https://github.com/ytiurin/observing-proxy.js/raw/master/LICENSE
 */

(function(){

function addChangeHandler(userChangeHandler,callOnInit)
{
  this.changeHandlers.indexOf(userChangeHandler)===-1&&this.changeHandlers
    .push(userChangeHandler);

  if(callOnInit){
    var changes=[];
    for(var key in this.sourceObject)
      if(typeof this.sourceObject[key]!=='function')
        changes.push({name:key,object:this.sourceObject,type:'update',
          oldValue:this.sourceObject[key]});

    userChangeHandler.call(this.sourceObject,changes);
  }
}

function defineObservableProperties()
{
  var propertyNames=getDeepPropertyNames(this.sourceObject,this.observableKeys);
  for(var i=0;i<propertyNames.length;i++)
    this.defineObservableProperty(propertyNames[i]);
}

function defineObservableProperty(propertyName)
{
  var isEnum=typeof this.sourceObject[propertyName]!=='function';

  function get(){
    return this.getPropertyValue(propertyName)}

  function set(userValue){
    this.setPropertyValue(propertyName,userValue)}

  Object.defineProperty(this.observableKeys,propertyName,{enumerable:isEnum,
    configurable:true,get:get.bind(this),set:set.bind(this)});
}

function getDeepPropertyNames(obj)
{
  var proto,names,protoNames,reduceNames,i,n;

  names=Object.getOwnPropertyNames(obj);
  for(i=0,n=names.length;i<n;i++)
    if(names[i].indexOf('__')===0&&names[i].lastIndexOf('__')===names[i].length-2){
      names.splice(i,1);
      i--;
      n--;
    }

  if(proto=Object.getPrototypeOf(obj))
    names=names.concat(getDeepPropertyNames(proto));

  return names;
}

function getPropertyValue(propertyName)
{
  return typeof this.sourceObject[propertyName]!=='function'?
    this.sourceObject[propertyName]:
    function(){
      var len,res,change,so;

      len=this.sourceObject.length,
      res=this.sourceObject[propertyName].apply(this.sourceObject,arguments);

      if(len&&len!==this.sourceObject.length)
        this.undefineObservableProperties(),
        this.defineObservableProperties();

      so=this.sourceObject;
      change={name:propertyName,object:so,type:'call',arguments:arguments,
        result:res};

      if(propertyName==='pop')
        change={object:so,type:'splice',index:this.sourceObject.length-1,
          removed:[res],addedCount:0};

      else if(propertyName==='push')
        change={object:so,type:'splice',index:this.sourceObject.length-1,
          removed:[],addedCount:1};

      else if(propertyName==='shift')
        change={object:so,type:'splice',index:0,removed:[res],addedCount:0};

      else if(propertyName==='splice')
        change={object:so,type:'splice',index:arguments[0],removed:res,
          addedCount:Array.prototype.slice.call(arguments,2).length};

      else if(propertyName==='unshift')
        change={object:so,type:'splice',index:0,removed:[],addedCount:1};

      this.changes.push(change);
      setTimeout(function(){this.notifyObservers()}.bind(this));

      return res;
    }.bind(this);
}

function notifyObservers()
{
  var changes=this.changes.splice(0,this.changes.length);

  if(changes.length)
    for(var i=0;i<this.changeHandlers.length;i++)
      this.changeHandlers[i].call(this,changes);
}

function removeChangeHandler(userChangeHandler)
{
  var rmInd=this.changeHandlers.indexOf(userChangeHandler);
  rmInd>-1&&this.changeHandlers.splice(rmInd,1);
}

function setPropertyValue(propertyName,propertyValue)
{
  if(this.sourceObject[propertyName]!==propertyValue){
    var oldValue=this.sourceObject[propertyName];
    this.sourceObject[propertyName]=propertyValue;
    this.changes.push({name:propertyName,object:this.sourceObject,type:
      'update',oldValue:oldValue});
    setTimeout(function(){this.notifyObservers()}.bind(this));
  }
}

function undefineObservableProperties()
{
  var propertyNames=getDeepPropertyNames(this.observableKeys);
  for(var i=propertyNames.length;i--;)
    delete this.observableKeys[i];
}

function ObservingProxy(sourceObject)
{
  this.sourceObject=sourceObject||undefined;
  this.observableKeys={};
  this.changeHandlers=[];
  this.changes=[];

  Object.defineProperty(this.observableKeys,'__observingProxy',{value:this});
  this.defineObservableProperties();
}

ObservingProxy.prototype={addChangeHandler:addChangeHandler,
  defineObservableProperties:defineObservableProperties,
  defineObservableProperty:defineObservableProperty,
  getPropertyValue:getPropertyValue,
  notifyObservers:notifyObservers,
  removeChangeHandler:removeChangeHandler,
  setPropertyValue:setPropertyValue,
  undefineObservableProperties:undefineObservableProperties};

function getObservableKeys(obj)
{
  var objProxy;

  if(!obj)
    return obj;

  if(obj.observableKeys)
    objProxy=obj;
  else
    for(var i=0;i<this.proxies.length;i++)
      if(this.proxies[i].sourceObject===obj){
        objProxy=this.proxies[i];
        break;
      }

  if(!objProxy)
    this.proxies.push(objProxy=new ObservingProxy(obj));

  return objProxy.observableKeys;
}

function observeObject(obj,handler,callOnInit)
{
  var proxy;

  if(proxy=getObservableKeys.bind(this)(obj))
    proxy.__observingProxy.addChangeHandler(handler,callOnInit);

  return this;
}

function unobserveObject(obj,handler)
{
  var proxy;

  if(proxy=getObservableKeys.bind(this)(obj))
    proxy.__observingProxy.removeChangeHandler(handler);

  return this;
}

function observingInstance()
{
  this.proxies=[];

  var ok=getObservableKeys.bind(this);
  ok.__ObservingProxy=ObservingProxy;
  ok.observe=observeObject.bind(this);
  ok.unobserve=unobserveObject.bind(this);

  return ok;
}

if(!Object.defineProperty)
  throw 'Observing proxy depend on missing Object.defineProperty method';

if(this.module&&this.module.exports)
  this.module.exports=new observingInstance;
else if(this.define&&this.define.amd)
  this.define(function(){return new observingInstance});
else
  this._o=new observingInstance;

}.bind(this)())
