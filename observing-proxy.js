/*
 * Observing proxy
 * https://github.com/ytiurin/observing-proxy.js
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 Yevhen Tiurin <yevhentiurin@gmail.com>
 */

'use strict';

!function(){

var tl=function(i,ln,ms){
  return function(ms,f){
    i++;
    if(f()) ln='info',ms='Test '+i+' passed: '+ms;
    else ln='error',ms='Test '+i+' failed: '+ms;
    console[ln](ms)}}(0);
var cl=function(){
  console.log.apply(console,arguments)};

var observingProxy=function(ts,ps,cs,hs){

  function getDeepPropertyDescriptors(o)
  {
    var ns;

    if(o){
      ns=getDeepPropertyDescriptors(Object.getPrototypeOf(o))||[];
      Array.prototype.push.apply(ns,
        Object.getOwnPropertyNames(o)
          .filter(function(k){
            return isNaN(parseInt(k))})
          .map(function(k){
            return {name:k,descriptor:Object.getOwnPropertyDescriptor(o,k)}}));
    }

    return ns;
  }

  function newProxy(t)
  {
    var p={},ns=getDeepPropertyDescriptors(t);

    for(var i=ns.length;i--;){
      delete ns[i].descriptor.value;
      delete ns[i].descriptor.writable;

      ns[i].descriptor.get=propertyGetter.bind({target:t,name:ns[i].name});
      ns[i].descriptor.set=propertySetter.bind({target:t,name:ns[i].name});

      try{
        Object.defineProperty(p,ns[i].name,ns[i].descriptor);
      }
      catch(e){}
    }

    return p;
  }

  function notifyObservers(target)
  {
    var i=targetIndex(target);

    if(cs[i].length)
      for(var l=0;l<hs[i].length;l++)
        hs[i][l].call(this,cs[i]);

    cs[i]=[];
  }

  function propertyGetter()
  {
    var r=this.target[this.name];

    if(Array.isArray(this.target)&&['pop','push','shift','splice','unshift'].
      indexOf(this.name)>-1)
      r=function(){
        var res=this.target[this.name].apply(this.target,arguments);

        cs[targetIndex(this.target)].push(({
          'pop':{object:this.target,type:'splice',index:this.target.length-1,
            removed:[res],addedCount:0},
          'push':{object:this.target,type:'splice',index:this.target.length-1,
            removed:[],addedCount:1},
          'shift':{object:this.target,type:'splice',index:0,removed:[res],
            addedCount:0},
          'splice':{object:this.target,type:'splice',index:arguments[0],
            removed:res,addedCount:Array.prototype.slice.call(arguments,2).length},
          'unshift':{object:this.target,type:'splice',index:0,removed:[],
            addedCount:1}
        })[this.name]);

        setTimeout(function(){
          notifyObservers(this.target)}.bind(this));
      }.bind(this);

    return r;
  }

  function propertySetter(userVal)
  {
    var val=this.target[this.name];
    if(val!==userVal){
      this.target[this.name]=userVal;
      cs[targetIndex(this.target)].push(
        {name:this.name,object:this.target,type:'update',oldValue:val});
      setTimeout(function(){
        notifyObservers(this.target)}.bind(this));
    }
  }

  function targetIndex(t)
  {
    var i=ts.indexOf(t);

    if(i===-1){
      i=ts.push(t)-1;
      ps.push(newProxy(t));
      cs.push([]);
      hs.push([]);
    }

    return i;
  }

  if(this&&this.test_o)
    tl('getDeepPropertyDescriptors',function(){
      return getDeepPropertyDescriptors([1,2,3]).length===38});

  if(this&&this.test_o)
    tl('Property getter',function(){
      var s={p1:1};
      return newProxy(s).p1===s.p1});

  if(this&&this.test_o)
    tl('Property setter',function(){
      var s={p1:1};
      newProxy(s).p1=2;
      return s.p1===2});

  if(this&&this.test_o)
    tl('Array splice',function(){
      var s=[];
      newProxy(s).push(1);
      return s.length===1});

  return {
    addChangeHandler:function(target,changeHandler,callOnInit){
      var i=targetIndex(target);
      hs[i].indexOf(changeHandler)===-1&&hs[i].push(changeHandler);

      if(callOnInit){
        var changes=Object.getOwnPropertyNames(target).map(function(key){
          return {name:key,object:target,type:'update',oldValue:target[key]}
        });
        changeHandler.call(target,changes);
      }
    },
    getProxy:function(target){
      return ps[targetIndex(target)];
    },
    removeChangeHandler:function(target,changeHandler){
      var i=targetIndex(target),rmInd;
      if((rmInd=hs[i].indexOf(changeHandler))>-1)
        hs[i].splice(rmInd,1);
    }
  }
}.bind(this)([],[],[],[]);

function _o(target,changeHandler)
{
  if(changeHandler)
    observingProxy.addChangeHandler(target,changeHandler);

  return observingProxy.getProxy(target);
}

if(!Object.defineProperty)
  throw 'Observing proxy depend on missing Object.defineProperty method';

if(this.module&&this.module.exports)
  this.module.exports=_o;
else if(this.define&&this.define.amd)
  this.define(function(){return _o});
else
  this._o=_o;

if(this&&this.test_o)
  tl('getProxy',function(){
    var s={p1:1};
    return observingProxy.getProxy(s).p1===s.p1});

if(this&&this.test_o)
  !function(){
    var u;
    var s={p1:1};
    observingProxy.addChangeHandler(s,function f(changes){
      clearTimeout(u);
      tl('addChangeHandler',function(){return true});
    });
    observingProxy.getProxy(s).p1=2;
    u=setTimeout(function(){
      tl('addChangeHandler',function(){return false});
    });
  }();

if(this&&this.test_o)
  !function(){
    var u;
    var f=function(){
      clearTimeout(u);
      tl('removeChangeHandler',function(){return false});
    };
    var s={p1:1};
    observingProxy.addChangeHandler(s,f);
    observingProxy.removeChangeHandler(s,f);
    observingProxy.getProxy(s).p1=2;
    u=setTimeout(function(){
      tl('removeChangeHandler',function(){return true});
    });
  }();

}.bind(this)()
