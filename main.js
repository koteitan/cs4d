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

 // for game
var inEqList = [
//    0   1   2    3   4   5   6
//    A  +Bx +Cy  +Dxx+Exy+Fyy <> 0
  [+0.8, 0.1, -1,  0,  0,  0,  +1],
  [-1  ,   2, -1,  0,  0,  0,  -1],
  [+1  ,  -1, -1,  0,  0,  0,  -1],
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
  
  /* 
  xEvList[xi] = x 
   : the xi th least x in which some event occur.
     
  cqList[i][j] = [cx, cy]
   : the cross point with j th least x of ith inequality.
  */
  var xEvList = [geomW.w[0][0], geomW.w[1][0]];
  var cqList = new Array(inEqs);
  var xis = 2;
  {
    var xi = 0;
    for(var i=0;i<inEqs;i++){
      cqList[i]=[];
      if(inEqList[i][1]!=0 && inEqList[i][2]==0 && inEqList[i][3]==0 && inEqList[i][4]==0 && inEqList[i][5]==0){
        //yŽ²‚É•½s‚È’¼ü A+Bx=0 x=-A/B
        xEvList[xis] = -inEqList[i][0]/inEqList[i][1];
        xis++;
      }else{
        for(var j=0;j<inEqs;j++){
          if(i!=j){
            var cq;
            //’¼ü
            cq = crossPointLines(inEqList[i],inEqList[j]);
            if(geomW.w[0][0]<cq[0] && cq[0]<geomW.w[1][0] &&
               geomW.w[0][1]<cq[1] && cq[1]<geomW.w[1][1]){
              // in display
              // add each cross point list
              cqList[i][cqList[i].length] = cq;
               // add cross point list
              if(i<j){
                if(inEqList[j][2]==0){
                  //i‚©j‚ªyŽ²‚É•½s‚È’¼ü
                  //nop
                }else{
                  //•’Ê‚Ì’¼ü“¯Žm
                  xEvList[xis] = cq[0];
                  xis++;
                }
              }//i<j
            }// in display
          }//i!=j
        }//j
      }//if
      cqList[i].sort(function(a,b){return a[0]-b[0]});
    }//i
    xEvList.sort();
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
  for(var xi=0;xi<xis;xi++){
    var d0 = transPos([xEvList[xi],geomW.w[0][1]], geomW, geomD);
    var d1 = transPos([xEvList[xi],geomW.w[1][1]], geomW, geomD);
    ctx[0].beginPath();
    ctx[0].moveTo(d0[0],d0[1]);
    ctx[0].lineTo(d1[0],d1[1]);
    ctx[0].stroke();
  }
    
  {//scope
    var x = xEvList[0];
    for(var xi=1;xi<xis;xi++){ //for xi (x)
      var midx = (x+xEvList[xi])/2;
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
          //’¼ü
          if(ieq[2]!=0){
            //•’Ê‚Ì’¼ü
            var cy = (ieq[1]*midx + ieq[0])/(-ieq[2]);
            interceptList[interceptList.length]=[i,cy];
          }else{
            //y Ž²‚É•½s‚È’¼ü
            //Œð“_‚È‚µ
          }
        }else{
          //‚QŽŸ‹Èü
          //eqa y^2 +   eqb y +       eqc  = 0
          //  F y^2 + (C+Ex)y + (A+Bx+Dxx) = 0
          var eqa = ieq[5];
          var eqb = ieq[2]+ieq[4]*midx;
          var eqc = ieq[0]+ieq[1]*midx+ieq[3]*midx*midx;
          //“Á«•û’öŽ®
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
      interceptList[interceptList.length] = [-1,geomW.w[1][1]];
      var f = -1;
      var y = geomW.w[0][1];
      for(var isi=0;isi<interceptList.length;isi++){ //for y
        var midy = (interceptList[isi][1] + y)/2;
        //------------------
        ctx[0].strokeStyle='rgb(255,255,0)';
        ctx[0].beginPath();
        var dq = transPos([midx,midy], geomW, geomD);
        ctx[0].arc(dq[0], dq[1], 5, 0, Math.PI*2, false);
        ctx[0].stroke();
        //------------------
        
        var newf = testPoint([midx, midy],tree);

        if(newf){
        //------------------
        ctx[0].strokeStyle='rgb(255,0,255)';
        ctx[0].beginPath();
        var dq = transPos([midx,midy], geomW, geomD);
        ctx[0].arc(dq[0], dq[1], 5, 0, Math.PI*2, false);
        ctx[0].stroke();
        //------------------
        }

        
          ctx[0].strokeStyle='rgb(255,255,255)';
        if(f!=-1 && f!=newf){
//        if(0){
          //stroke
          var ii = interceptList[isi-1][0];
          var cq0 = cqList[ii][cqiNow[ii]];
          if(cq0[0] < midx) cqiNow[ii]++;
          var cq1 = cqList[ii][cqiNow[ii]];
          
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
      x = xEvList[xi];
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


