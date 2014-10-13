Array.prototype.min = function(){
  var ret=this[0];
  for(var i=1;i<this.length;i++){
    ret = ret<this[i]?ret:this[i];
  }
  return ret;
}
Array.prototype.max = function(){
  var ret=this[0];
  for(var i=1;i<this.length;i++){
    ret = ret>this[i]?ret:this[i];
  }
  return ret;
}
Array.prototype.argmax = function(){
  var ret=0;
  for(var i=1;i<this.length;i++){
    ret = this[ret]>this[i]?ret:i;
  }
  return ret;
}
Array.prototype.argmin = function(){
  var ret=0;
  for(var i=1;i<this.length;i++){
    ret = this[ret]<this[i]?ret:i;
  }
  return ret;
}
Array.prototype.sum = function(){
  var ret = this[0];
  for(var i=1;i<this.length;i++){
    ret += this[i]
  }
  return ret;
}
Array.prototype.mean = function(){
    return this.sum()/this.length;
}
Array.prototype.clone = function(){
  var ret = new Array(this.length);
  for(var i=0;i<this.length;i++){
    if(this[i].constructor==Array){
      ret[i]=this[i].clone();
    }else{
      ret[i]=this[i];
    }
  }
  return ret;
}

Array.prototype.isEqual = function(a){
  if(this.length!=a.length) return false;
  for(var i=0;i<this.length;i++){
    if(this[i] instanceof Array){
      if(!(a[i] instanceof Array)) return false;
      if(!this[i].isEqual(a[i])) return false;
    }else{
      if(this[i]!=a[i]) return false;
    }
  }
  return true;
}
/* -----------------------------------------
  push uniquely
  i = a.pushUniquely(e);
    if e is already member of a:
      push e into a if e is not member of a,
      and return the index of e in new a.
    else
      and return the index of e in a.
  usage:
      x=[2,3,4];
      i=x.pushUniquely(10);
      // x = [2,3,4,10];
      // i = 3;
      
      x=[2,3,4];
      i=x.pushUniquely(3);
      // x = [2,3,4];
      // i = 1;
-------------------------------------------- */
Array.prototype.pushUniquely = function(e){
  for(var i=0;i<this.length;i++){
    var ae = this[i];
    if(ae instanceof Array && e instanceof Array){
      if(ae.isEqual(e)) return i;
    }else{
      if(ae==e) return i;
    }
  }
  return this.push(e)-1;
}
Array.zeros = function(v){
  var v0 = v[0];
  var ans = new Array(v0);
  if(v.length==1){
    for(var i=0;i<v0;i++) ans[i] = 0;
  }else{
    var v1=v.clone();
    v1.shift();
    for(var i=0;i<v0;i++) ans[i] = Array.zeros(v1);
  }
  return ans;
}


