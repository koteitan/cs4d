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

 // for game
var inEqList = [
// Ax +By +C    <> 0
//              -+
  [1/10, -1, +0.8, +1],
  [   2, -1, -1  , -1],
  [  -1, -1, +1  , -1],
];
var tree;
  tree = [
    OP2_AND,
    [OP2_AND, [OP1_IMM, inEqList[0]], [OP1_IMM, inEqList[1]]],
    [OP1_IMM, inEqList[2]]
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
  var geomD = new Geom(2, [[0,dy],[dx,0]]);
  
  /* find set of cross point cqList[cqi]=[i,j,x,y];
    i,j = indices of inEqList.
    x,y = cross point.
    cqi : less cqi means less x.
  */
  var cqList = [];
  var cqList_each = new Array(inEqs);
  var cqs = 0;
  {
    var cqi = 0;
    for(var i=0;i<inEqs;i++){
      cqList_each[i]=[];
      for(var j=0;j<inEqs;j++){
        if(i!=j){
          var tmp = crossPoint(inEqList[i],inEqList[j]);
          if(geomW.w[0][0]<tmp[0] && tmp[0]<geomW.w[1][0] &&
             geomW.w[0][1]<tmp[1] && tmp[1]<geomW.w[1][1]){
            // in display
            // add each cross point list
            cqList_each[i][cqList_each[i].length]=tmp;
             // add cross point list
            if(i<j){
              cqList[cqs]=[i,j,tmp[0],tmp[1]];
              cqs++;
            }
          }// in display
        }
      }//j
      cqList_each[i].sort(function(a,b){return a[0]-b[0]});
    }//i
    cqList.sort(function(a,b){return a[2]-b[2];});
  }
  

        /* interceptList[k] = [i,y];
      i = index of the inEqList
      y = intercept of the inEqList  
      k : less k means less y */


  var cqiNow_each = new Array(inEqs);
  for(var i=0;i<inEqs;i++) cqiNow_each[i]=0;
  
  ctx[0].strokeStyle='rgb(255,0,0)';
  for(var cqi=0;cqi<cqs;cqi++){
    var dc = transPos([cqList[cqi][2],cqList[cqi][3]], geomW, geomD);
    ctx[0].beginPath();
    ctx[0].arc(dc[0], dc[1], 4, 0, Math.PI*2, false);
    ctx[0].stroke();
  }
  
  {//scope
    var x = geomW.w[0][0];
    for(var cqi=0;cqi<cqs;cqi++){ //for cqi (x)
      var midx = (x+cqList[cqi][2])/2;
      
      // calc intercepts
      interceptList = [];
      for(var i=0;i<inEqs;i++){
        var cy = (inEqList[i][0]*midx + inEqList[i][2])/(-inEqList[i][1]);
        if(geomW.w[0][1]<cy && cy<geomW.w[1][1]){
          interceptList[interceptList.length]=[i,cy];
          //------------------
          ctx[0].strokeStyle='rgb(0,255,255)';
          ctx[0].beginPath();
          var dq = transPos([midx,cy], geomW, geomD);
          ctx[0].arc(dq[0], dq[1], 10, 0, Math.PI*2, false);
          ctx[0].stroke();
          //------------------
        }
      }
      interceptList.sort(function(a,b){return a[1]-b[1];});
      interceptList[interceptList.length] = [-1,geomW.w[1][1]];
      var f = -1;
      var y = geomW.w[0][1];
      for(var isi=0;isi<interceptList.length;isi++){ //for y
        var midy = (interceptList[isi][1] + y)/2;
        

        var newf = testPoint([midx, midy],tree);

        if(newf){
          ctx[0].strokeStyle='rgb(255,0,255)';
        }else{
          ctx[0].strokeStyle='rgb(0,0,255)';
        }
        //------------------
        ctx[0].beginPath();
        var dq = transPos([midx,midy], geomW, geomD);
        ctx[0].arc(dq[0], dq[1], 5, 0, Math.PI*2, false);
        ctx[0].stroke();
        //------------------

        
          ctx[0].strokeStyle='rgb(255,255,255)';
        if(f!=-1 && f!=newf){
//        if(0){
          //stroke
          var ii = interceptList[isi-1][0];
          var cq0 = cqList_each[ii][cqiNow_each[ii]];
          if(cq0[0] < midx) cqiNow_each[ii]++;
          var cq1 = cqList_each[ii][cqiNow_each[ii]];
          
          // display coordinate
          var dq0 = transPos(cq0, geomW, geomD);
          var dq1 = transPos(cq1, geomW, geomD);
          ctx[0].beginPath();
          ctx[0].moveTo(dq0[0],dq0[1], Math.PI*2, false);
          ctx[0].lineTo(dq1[0],dq1[1], Math.PI*2, false);
          ctx[0].stroke();
        }
        f = newf;
        y = interceptList[isi][1];
      }// for(isi) (y)
      x = cqList[cqi][2];
    }// for(cqi) (x)
  }//scope
  

  ctx[0].strokeStyle='rgb(0,255,0)';
  for(var x=-1;x<+1;x+=0.04){
    for(var y=-1;y<+1;y+=0.04){
      var dc = transPos([x,y], geomW, geomD);
      if(testPoint([x,y],tree)){
        ctx[0].beginPath();
        ctx[0].arc(dc[0], dc[1], 2, 0, Math.PI*2, false);
        ctx[0].stroke();
      }else{
        ctx[0].beginPath();
        ctx[0].moveTo(dc[0],dc[1]);
        ctx[0].lineTo(dc[0]+1,dc[1]);
        ctx[0].stroke();
      }
    }
  }
  
};

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


