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
  geomD = new Geom(2, [[0,0],[dx,dy]]);
  var c=new Array(inEqs);
  for(var i=0;i<inEqs;i++){
    c[i]=new Array(inEqs);
    for(var j=i+1;j<inEqs;j++){
      c[i][j] = crossPoint(inEqList[i],inEqList[j]);
      var dc = transPos([c[i][j][0],c[i][j][1]], geomW, geomD);
      ctx[0].beginPath();
      ctx[0].arc(dc[0], dc[1], 10, 0, Math.PI*2, false);
      ctx[0].stroke();
    }
  }
};


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


