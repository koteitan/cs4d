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
