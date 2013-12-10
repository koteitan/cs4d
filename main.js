/*----------------------------------
  4dsoko_main.js
  main program and entry point
----------------------------------*/
// static var on game
var isDebug1=false; //debug flag
var isDebug2=false; //debug flag
 // for world
var dims = 4;
var secPframe = 1; // [sec/frame]
var geomW = new Geom(2, [[-1,-1],[+1,+1]]);
var geomD;

 // for game
var inEqList = [
// Ax +By +C    <> 0
//              -+
  [1/10, -1, +0.8, +1],
  [  10, -1, -8  , +1],
  [  -1, -1, +1  , -1],
];
var inEqs = inEqList.length;
// dinamic var on game
var timenow=0;
//ENTRY POINT --------------------------
window.onload=function(){
  initGui();
//  setInterval(procAll, 1000/frameRate); // main loop
}
//MAIN LOOP ------------------------
var procAll=function(){
    procDraw();
}
//var for gui ----------------------------
var canvas = new Array(1);
var ctx    = new Array(1);
var isRequestedDraw = true;
var frameRate;
frameRate  = 60; // [fps]
var isKeyTyping;
//initialize -----------
//gui
var initGui=function(){
  for(var i=0;i<1;i++){
    canvas[i] = document.getElementById("canvas"+i);
    if(!canvas[i]||!canvas[i].getContext) return false;
    ctx[i] = canvas[i].getContext('2d');
  }
  isKeyTyping = false;
} 
var procDraw=function(){
  var dx = canvas[0].width;
  var dy = canvas[0].height;
  ctx[0].strokeWeight='1';
  //clear ---------
  ctx[0].lineWidth='1';
  ctx[0].clearRect(0, 0, dx-1, dy-1);
  //border ---------
  ctx[0].lineWidth='1';
  ctx[0].strokeStyle='rgb(0,0,0)';
  ctx[0].strokeRect(0, 0, dx-1, dy-1);
  //border ---------
  ctx[0].lineWidth='1';
  ctx[0].strokeStyle='rgb(255,255,255)';
  var geomD = new Geom(2, [[0,0],[dx,dy]]);
  
  /* find set of cross point cqList[cqi]=[i,j,x,y];
    i,j = indices of inEqList.
    x,y = cross point.
    cqi : less cqi means less x.
  */
  var cqList = new Array(inEqs*(inEqs-1)/2);
  var cqs = 0;
  {
    var cqi = 0;
    for(var i=0;i<inEqs;i++){
      for(var j=i+1;j<inEqs;j++){
        var tmp = crossPoint(inEqList[i],inEqList[j]);
        cqList[cqi++] = [i,j,tmp[0],tmp[1]]; 
      }
    }
    cqList.sort(function(a,b){return a[2]-b[2];});
    cqs = cqi;
  }
  
  /* interceptList[k] = [i,y];
  i = index of the inEqList
  y = intercept of the inEqList  
  k : less k means less y */
  interceptList = new Array(inEqs);
  for(var i=0;i<inEqs;i++){
    var y = (inEqList[i][0]*geomW.w[0] + inEqList[i][2])/(-inEqList[i][1]);
    interceptList[i]=[i,y];
  }
  interceptList.sort(function(a,b){return a[0]-b[0];});
  
  for(var cqi=0;cqi<cqs;cqi++){
    for(var i=0;i<inEqs;i++){
      
    }
  }
  
  
  for(var i=0;i<inEqs;i++){
    for(var j=i+1;j<inEqs;j++){
//      var dc = transPos([c[i][j][0],c[i][j][1]], geomW, geomD);
//      ctx[0].beginPath();
//      ctx[0].arc(dc[0], dc[1], 10, 0, Math.PI*2, false);
// ctx[0].stroke();
    }
  }
};

/* inequalities operator 
 [OP,p0,p1]
*/
var OP1_IMM = 0; /* immediate value p0 */
var OP1_NOT = 1; /* complement set of p0 */ 
var OP2_AND = 2; /* intersection of p0 and p1 */
var OP2_OR  = 3; /* union of p0 and p1 */
var OP2_SUB = 4; /* p0 and not p1 */
var OP2_XOR = 5; /* xor of p0 and p1 */
var OP2_EQ  = 6; /* p0 == p1 */
/* test the point q with inequalities tree r */
var testPoint = function(q,r){
  switch(r[0]){
    case false: return false;
    case true : return true;
    case OP1_IMM:
      if(r[1][3]>0){
        return r[1][0]*q[0]+r[1][1]*q[1]+r[1][2]>0;
      }else{
        return r[1][0]*q[0]+r[1][1]*q[1]+r[1][2]<0;
      }
    case OP1_NOT: return !testPoint(q, r[1]);
    case OP2_AND: return testPoint(q, r[1]) &&  testPoint(q, r[2]);
    case OP2_OR : return testPoint(q, r[1]) ||  testPoint(q, r[2]);
    case OP2_SUB: return testPoint(q, r[1]) && !testPoint(q, r[2]);
    case OP2_XOR: return testPoint(q, r[1]) ^   testPoint(q, r[2]);
    case OP2_EQ : return testPoint(q, r[1]) ==  testPoint(q, r[2]);
    default     : return false;
  }
}

var print=function(str){
  document.getElementById('debugout').innerHTML = str;
}
/*
  
  in:
   l0 = [A,B,E] : indicates the line Ax+By+E=0
   l1 = [C,D,F] : indicates the line Cx+Dy+F=0
  out:
   [x,y]
*/
var crossPoint = function(l0, l1){
  return mulxv(
      inv([[l0[0],l0[1]],[l1[0],l1[1]]]),
      [-l0[2],-l1[2]]
    );
}

// entry --------------------------------------
window.onload=function(){
  initGui();
  procAll();
//  setInterval(procAll, 1000/frameRate);
};


