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
 [OP,p0,p1] */
var OP1_IMM = 0; /* immediate value p0 */
var OP1_NOT = 1; /* complement set of p0 */ 
var OP2_AND = 2; /* intersection of p0 and p1 */
var OP2_OR  = 3; /* union of p0 and p1 */
var OP2_SUB = 4; /* p0 and not p1 */
var OP2_XOR = 5; /* xor of p0 and p1 */
var OP2_EQ  = 6; /* p0 == p1 */
var OPN_AND = 7; /* intersection of p0 ... pN */
var OPN_OR  = 8; /* union of p0 ... pN */

 // for game
var inEqList = [
//        0   1   2    3   4   5   6
//        A  +Bx +Cy  +Dxx+Exy+Fyy <> 0
  [ -(  0 ),  1,  0.3,  0,  0,  0,  +1],
  [ -(0.5 ),  1,  0.6,  0,  0,  0,  -1],
  [ -(0.25),  0,  1,  0,  0,  0,  +1],
  [ -(0.75),  0,  1,  0,  0,  0,  -1],
];
var tree = new Array(inEqList.length+1);
tree[0] = OPN_AND;
for(var i=0;i<inEqList.length;i++){
  tree[i+1] = [OP1_IMM, inEqList[i]];
}
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
  
  /* 
  xEvList[xi] = [x, type, i, j] = x-event.
    x    = point of the event is occur. (sorted as less x with less xi.)
    type = type of event {"cross","yaxis","wall"}
    i,j  = indices of inequalities that cross.
    
  cqList[i][j] = [cx, cy]
   : the cross point with j th least x of ith inequality.
  */
  var xEvList = [[geomW.w[0][0],"wall",-1,-1], [geomW.w[1][0],"wall",-1,-1]];
  var cqList = new Array(inEqs);
  {
    var xi = 0;

    // check all cross point
    // (and make x-events)
    for(var i=0;i<inEqs;i++){
      
      cqList[i]=[];
      for(var j=0;j<inEqs;j++){
        var cq = crossPointLines(inEqList[i],inEqList[j]);
        if(!isNaN(cq[0]) &&  !isNaN(cq[1]) && 
          geomW.w[0][0]<cq[0] && cq[0]<geomW.w[1][0] &&
          geomW.w[0][1]<cq[1] && cq[1]<geomW.w[1][1]){
          // in display
          // add each cross point list
          cqList[i][cqList[i].length] = cq;

          if(i<j && inEqList[i][2]!=0 && inEqList[j][2]!=0){
            // i is normal line, j is not yaxis line and i<j
            // add cross point into x-events
            xEvList[xEvList.length] = [cq[0],"cross",i,j];
          }

        }

      }// for j
      
      cqList[i].sort(function(a,b){
        // less x makes less cqList.
        // less y makes less one if ones x are the same.
        (a[0]==b[0])?a[1]-b[1]:a[0]-b[0];
      });
        
      // if yaxis line
      // A+Bx=0 x=-A/B
    }//i

    
    // make x-events for yaxis-type-lines
    for(var i=0;i<inEqs;i++){
      if(inEqList[i][2]==0){
        xEvList[xEvList.length] = [-inEqList[i][0]/inEqList[i][1], "yaxis", i, -1];
      }
    }//i
    
    // sort xevents
    xEvList.sort(function(a,b){return a[0]-b[0]});
  }
  
  for(var i=0;i<inEqs;i++){
  for(var j=0;j<cqList[i].length;j++){
          //------------------
          ctx[0].strokeStyle='rgb(255,255,255)';
          ctx[0].beginPath();
          var dq = transPos(cqList[i][j], geomW, geomD);
          ctx[0].arc(dq[0], dq[1], 5, 0, Math.PI*2, false);
          ctx[0].stroke();
          //------------------
  }
  }



  var cqiNow = new Array(inEqs);
  for(var i=0;i<inEqs;i++) cqiNow[i]=0;
  
  ctx[0].strokeStyle='rgb(0,0,255)';
  for(var xi=0;xi<xEvList.length;xi++){
    var d0 = transPos([xEvList[xi][0],geomW.w[0][1]], geomW, geomD);
    var d1 = transPos([xEvList[xi][0],geomW.w[1][1]], geomW, geomD);
    ctx[0].beginPath();
    ctx[0].moveTo(d0[0],d0[1]);
    ctx[0].lineTo(d1[0],d1[1]);
    ctx[0].stroke();
  }
  
  {//scope
    var x = xEvList[0][0];
    var pref;
    for(var xi=1;xi<xEvList.length;xi++){ //for each x Events
      var midx = (x+xEvList[xi][0])/2;
      //-------------------------------
      ctx[0].strokeStyle='rgb(255,0,0)';
      var d0 = transPos([midx,geomW.w[0][1]], geomW, geomD);
      var d1 = transPos([midx,geomW.w[1][1]], geomW, geomD);
      ctx[0].beginPath();
      ctx[0].moveTo(d0[0],d0[1]);
      ctx[0].lineTo(d1[0],d1[1]);
      ctx[0].stroke();
      //-------------------------------
      
      /* interceptList[k] = [i,y];
      i = index of the inEqList
      y = intercept of the inEqList  
      k : less k means less y */
      var interceptList = [];
      for(var i=0;i<inEqs;i++){
        var ieq=inEqList[i];
        if(ieq[3]==0 && ieq[4]==0 && ieq[5]==0){
          //line
          if(ieq[2]!=0){
            //normal line
            var cy = (ieq[1]*midx + ieq[0])/(-ieq[2]);
            interceptList[interceptList.length]=[i,cy];
          }else{
            //yaxis
            //no cross
          }
        }else{
          //conic
          //eqa y^2 +   eqb y +       eqc  = 0
          //  F y^2 + (C+Ex)y + (A+Bx+Dxx) = 0
          var eqa = ieq[5];
          var eqb = ieq[2]+ieq[4]*midx;
          var eqc = ieq[0]+ieq[1]*midx+ieq[3]*midx*midx;
          //charactoristic equation
          var charaEq = eqb-4*eqa*eqc;
          if(charaEq>0){
            var cy;
            var sqrtCharaEq = Math.sqrt(charaEq);
            cy = (-eqb-sqrtCharaEq)/(4*eqa);
            interceptList[interceptList.length]=[i,cy];
            cy = (-eqb+sqrtCharaEq)/(4*eqa);
            interceptList[interceptList.length]=[i,cy];
          }else{
          }
          
        }
        if(!isNaN(cy) && geomW.w[0][1]<cy && cy<geomW.w[1][1]){
          //------------------
          ctx[0].strokeStyle='rgb(0,255,255)';
          ctx[0].beginPath();
          var dq = transPos([midx,cy], geomW, geomD);
          ctx[0].arc(dq[0], dq[1], 5, 0, Math.PI*2, false);
          ctx[0].stroke();
          //------------------
        }
      }
      interceptList.sort(function(a,b){return a[1]-b[1];});
      var f = new Array(interceptList.length+1);
      var prey = geomW.w[0][1];
      for(var ici=0;ici<interceptList.length+1;ici++){ //for y
        var nowy;
        if(ici<interceptList.length){
          nowy = [interceptList[ici][1], geomW.w[1][1]].min();
        }else{
          nowy = geomW.w[1][1];
        }
        var midy = (nowy + prey)/2;
        f[ici] = testPoint([midx, midy], tree);

        if(f[ici]){
          //------------------
          ctx[0].strokeStyle='rgb(255,0,255)';
          ctx[0].beginPath();
          var dq = transPos([midx,midy], geomW, geomD);
          ctx[0].arc(dq[0], dq[1], 5, 0, Math.PI*2, false);
          ctx[0].stroke();
          //------------------
        }else{
          //------------------
          ctx[0].strokeStyle='rgb(255,255,0)';
          ctx[0].beginPath();
          var dq = transPos([midx,midy], geomW, geomD);
          ctx[0].arc(dq[0], dq[1], 5, 0, Math.PI*2, false);
          ctx[0].stroke();
          //------------------
        }

          ctx[0].strokeStyle='rgb(255,255,255)';
        if(ici>0 && f[ici-1]!=f[ici]){
          /*stroke
                     ii
                    /
             j1----+----
                  / 
             j0--+------
                /
          */
          var ii = interceptList[ici-1][0];
          var j0 = xEvList[xi-1][2]!=ii?xEvList[xi-1][2]:xEvList[xi-1][3];
          var j1 = xEvList[xi  ][2]!=ii?xEvList[xi  ][2]:xEvList[xi  ][3];
          var cq0 = crossPointLines(inEqList[ii],inEqList[j0]);
          var cq1 = crossPointLines(inEqList[ii],inEqList[j1]);
          
          // display coordinate
          var dq0 = transPos(cq0, geomW, geomD);
          var dq1 = transPos(cq1, geomW, geomD);
          ctx[0].beginPath();
          ctx[0].moveTo(dq0[0],dq0[1], Math.PI*2, false);
          ctx[0].lineTo(dq1[0],dq1[1], Math.PI*2, false);
          ctx[0].stroke();
        }
        prey = nowy;
      }// for(ici) (y)
      
      if(xEvList[xi-1][1]=="yaxis"){
        //if previous is yaxis line
        //specially add lines
        for(var ici=0;ici<f.length;ici++){
          if(f[ici]!=pref[ici]){
            // display coordinate
            ctx[0].strokeStyle='rgb(255,255,255)';
            var ii = xEvList[xi-1][2];
            var cq0 = cqList[ii][cqiNow[ii]];
            cqiNow[ii]++;
            var cq1 = cqList[ii][cqiNow[ii]];
            var dq0 = transPos(cq0, geomW, geomD);
            var dq1 = transPos(cq1, geomW, geomD);
            ctx[0].beginPath();
            ctx[0].moveTo(dq0[0],dq0[1], Math.PI*2, false);
            ctx[0].lineTo(dq1[0],dq1[1], Math.PI*2, false);
            ctx[0].stroke();
          }
        }// ici
      }// if yaxis
      
      x = xEvList[xi][0];
      if(xEvList[xi][1]=="yaxis") pref = f.clone();
    }// for(xi) (x)
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
      if(r[1][6]>0){
        return r[1][0]+r[1][1]*q[0]+r[1][2]*q[1]+r[1][3]*q[0]*q[0]+r[1][4]*q[0]*q[1]+r[1][5]*q[1]*q[1] >  0;
      }else{
        return r[1][0]+r[1][1]*q[0]+r[1][2]*q[1]+r[1][3]*q[0]*q[0]+r[1][4]*q[0]*q[1]+r[1][5]*q[1]*q[1] <= 0;
      }
    case OP1_NOT: return !testPoint(q, r[1]);
    case OP2_AND: return testPoint(q, r[1]) &&  testPoint(q, r[2]);
    case OP2_OR : return testPoint(q, r[1]) ||  testPoint(q, r[2]);
    case OP2_SUB: return testPoint(q, r[1]) && !testPoint(q, r[2]);
    case OP2_XOR: return testPoint(q, r[1]) ^   testPoint(q, r[2]);
    case OP2_EQ : return testPoint(q, r[1]) ==  testPoint(q, r[2]);
    case OPN_AND: {
      var f = true;
      for(var ri=1;ri<r.length;ri++) f &= testPoint(q, r[ri]);
      return f;
    }
    case OPN_OR: {
      var f = false;
      for(var ri=1;ri<r.length;ri++) f |= testPoint(q, r[ri]);
      return f;
    }
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
var crossPointLines = function(l0, l1){
  return mulxv(
      inv([[l0[1],l0[2]],[l1[1],l1[2]]]),
      [-l0[0],-l1[0]]
    );
}

// entry --------------------------------------
window.onload=function(){
  initGui();
  procAll();
//  setInterval(procAll, 1000/frameRate);
};


