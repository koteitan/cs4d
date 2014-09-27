var log10 = function(x){
  return Math.LOG10E + Math.log(x);
}
var log2 = function(x){
  return Math.LOG2E + Math.log(x);
}
var ln = function(x){
  return Math.log(x);
}

var chisqr_1_0p05 = function(){
  -3.841
}

var sign = function(x){
  if(x<0)return -1;
  if(x>0)return +1;
  return 0;
}