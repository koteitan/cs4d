/*----------------------------------
  main.js
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

/* hidden list of the InequalityPolytope */ 
var _InequalityPolytope_boundaryList = [];

/* -----------------------------------------------
InequalityPolytope
  indicates 4D-polytope which is described by inequality.
  the function has 3 types of constructor;
    InequalityPolytope(matrix, sign),
    InequalityPolytope(operator, param),
    InequalityPolytope(value).
  
    InequalityPolytope(matrix, sign)
      matrix = S = 5x5 2D array 
             = matrix of coefficients of inequality;
        sign == +1
          [x,y,z,w,1]S[x,y,z,w,1]^T > 0
        sign == -1
          [x,y,z,w,1]S[x,y,z,w,1]^T < 0
        
    InequalityPolytope(operator, param);
      operator;
        InequalityPolytope("!" ,[a          ]) = invert of a.
        InequalityPolytope("|" ,[a0,a1,c,ak]) = union.
        InequalityPolytope("&" ,[a0,a1,c,ak]) = intersection.
        InequalityPolytope("^" ,[a0,a1,c,ak]) = xor
      param = array of parameters
  -----------------------------------------------*/
var InequalityPolytope = function(){
  if(arguments.length==2 && arguments[0] instanceof Array){
    /* matrix notation */
    this.type   = "inequality";
    this.matrix = _InequalityPolytope_boundaryList.pushUniquely(arguments[0]);
    this.sign   = arguments[1];
    return;
  }else if(arguments.length==1 && arguments[0].constructor==Boolean){
    /* boolean notation */
    this.type   = "boolean";
    this.value  = arguments[0];
  }else if(arguments.length==3 && arguments[0] instanceof String){
    /* string notation */
    this.type   = "operator";
    this.operator = arguments[0];
    this.param = new Array(arguments.length-1);
    for(var i=0;i<this.param.length;i++){
      this.param[i] = arguments[i+1];
    }
  }
}
InequalityPolytope.prototype.toString = function(){
  switch(this.type){
    case "boolean":
    return this.value;
    case "matrix":
      var varstr="xyzw";
      var out="";
      for(var i=0;i<this.matrix.length;i++){
        for(var j=i;j<this.matrix[i].length;j++){
          var value = i==j ? this.matrix[i][j]:this.matrix[i][j]+this.matrix[j][i];
          if(value==0){
            continue;
          }else if(Math.floor(value)==value){
            out += sprintf("%+d",value);
          }else{
            out += sprintf("%+3.3f",value);
          }
          if(i<this.matrix.length-1){
            out += varstr[i];
          }
          if(j<this.matrix.length-1){
            if(i==j){
              out += "^2";
            }else{
              out += varstr[j];
            }
          }
        }
      }
    return out + " = 0";
  }
}
InequalityPolytope.prototype.test = function(q){
  switch(this.type){
    case "matrix":
      return product(q, mul(this.matrix, q)) * this.sign > 0;
    case "boolean":
      return this.value;
    case "operator":
      switch(this.operator){
        case "!":
        return !b;
        case "|":
          var b = this.param[0].test(q);
          for(var i=1;i<this.param.length;i++) b |= this.param[i].test(q);
        return b;
        case "&":
          var b = this.param[0].test(q);
          for(var i=1;i<this.param.length;i++) b &= this.param[i].test(q);
        return b;
        case "^":
          var b = this.param[0].test(q);
          for(var i=1;i<this.param.length;i++) b ^= this.param[i].test(q);
        default:
        return false;
      }
  }
};

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
var inEqList = [];
var inEqs = inEqList.length;
// dinamic var on game
var timenow=0;


var CrossPoint = function(l0, l1){
  this.cq = mulxv(
    inv([[l0[1],l0[2]],[l1[1],l1[2]]]),
    [-l0[0],-l1[0]]
  );
}
//ENTRY POINT --------------------------
window.onload=function(){
//  initGui();
  initBody();
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
//body
var initBody=function(){
  var innersphere = new InequalityPolytope([[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,-(21/54)*(21/54)]],-1);
};
//gui
var initGui=function(){
  for(var i=0;i<1;i++){
    canvas[i] = document.getElementById("canvas"+i);
    if(!canvas[i]||!canvas[i].getContext) return false;
    ctx[i] = canvas[i].getContext('2d');
  }
  isKeyTyping = false;
  geomD = new Geom(2, [[0,canvas[0].height],[canvas[0].width,0]]);
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
  
  /* 
  cqList[cqi] = [x, y, i, j] = cross point list
    x,y  = cross point
    i,j  = indices of inequalities that cross.
  */
  var cqList = [];
  {
    // find all cross point in display
    for(var i=0;i<inEqs;i++){
      
      for(var j=0;j<inEqs;j++){
        var cq = crossPoint(inEqList[i],inEqList[j]);
        if(!isNaN(cq[0]) &&  !isNaN(cq[1]) && 
          geomW.w[0][0]<=cq[0] && cq[0]<=geomW.w[1][0] &&
          geomW.w[0][1]<=cq[1] && cq[1]<=geomW.w[1][1]){
          // if in display
          
          if(i<j){
            cqList[cqList.length] = [cq[0],cq[1],i,j];
          }
        }
      }// for j
    }//i
    
    // sort corss points
    cqList.sort(function(a,b){
      if(a[0]==b[0]){
        return a[1]-b[1]
      }else{
        return a[0]-b[0]
      }
    });
  }


  var cqiNow = new Array(inEqs);
  for(var i=0;i<inEqs;i++) cqiNow[i]=0;
  
  ctx[0].strokeStyle='rgb(0,0,255)';
  for(var cqi=0;cqi<cqList.length;cqi++){
    var d0 = transPos([cqList[cqi][0],geomW.w[0][1]], geomW, geomD);
    var d1 = transPos([cqList[cqi][0],geomW.w[1][1]], geomW, geomD);
    ctx[0].beginPath();
    ctx[0].moveTo(d0[0],d0[1]);
    ctx[0].lineTo(d1[0],d1[1]);
    ctx[0].stroke();
  }
  var prex = cqList[0][0];
  var prediffx = prex;
  var pref;
  for(var cqi=1;cqi<cqList.length;cqi++){ //for each cross points
    var nowx = cqList[cqi][0];
    if(nowx==geomW.w[0][0] || nowx==geomW.w[0][1]){
      // on boundary of the world
      
      // do not draw
      prediffx = prex;
      
    }else if(prex!=nowx && !(
      cqList[cqi-1][2]==cqList[cqi][2] ||
      cqList[cqi-1][2]==cqList[cqi][3] ||
      cqList[cqi-1][3]==cqList[cqi][3] 
    )){
      var midx = (prex+nowx)/2;
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
          /* find j0 and j1
          
                         ii
                        /
                 j1----+----
                      /:
                     / :
                    x  :
                   /:  :
                  / :  :
             j0--+---------
                /:  :  :
                 c0 :  c1
                    midx
                
          */
          var ii = interceptList[ici-1][0];
          var c0=[-Infinity,0];
          var c1=[+Infinity,0];
          var j0=0,j1=0;
          for(var cqi2=0;cqi2<cqList.length;cqi2++){
            if(ii==cqList[cqi2][2] || ii==cqList[cqi2][3]){
              // cross point of ii is found
              var x = cqList[cqi2][0];
              var y = cqList[cqi2][1];
              var j = (ii==cqList[cqi2][2]) ? cqList[cqi2][2]:cqList[cqi2][3];
              if(x<midx){
                if(c0[0] < x){
                  // nearest x is found
                  c0 = [x,y];
                  j0  = j;
                }
              }else{
                if(x < c1[0]){
                  // nearest x is found
                  c1 = [x,y];
                  j1  = j;
                }
              }
            }
          }
          //draw
          drawBoundary(inEqList[ii],c0,c1);
        }
        prey = nowy;
      }// for(ici) (y)
      prediffx = nowx;
    
    }else{ // if(prex!=nowx)
      //prex==nowx (if yaxis line)

      /*      ii
              b^      
              { ........ c1
            ^b       
          j1  b         
              b   
              b         
              b^      
              {......... c0
            ^b      
          j0
      */

      if(cqList[cqi-1][1]==cqList[cqi][1]) continue;
      var ii,j0,j1;
      if(cqList[cqi-1][2]==cqList[cqi][2]){
        ii = cqList[cqi-1][2];
        j0 = cqList[cqi-1][3];
        ii = cqList[cqi  ][2];
        j1 = cqList[cqi  ][3];
      }
      if(cqList[cqi-1][2]==cqList[cqi][3]){
        ii = cqList[cqi-1][2];
        j0 = cqList[cqi-1][3];
        j1 = cqList[cqi  ][2];
        ii = cqList[cqi  ][3];
      }
      if(cqList[cqi-1][3]==cqList[cqi][2]){
        j0 = cqList[cqi-1][2];
        ii = cqList[cqi-1][3];
        ii = cqList[cqi  ][2];
        j1 = cqList[cqi  ][3];
      }
      if(cqList[cqi-1][3]==cqList[cqi][3]){
        j0 = cqList[cqi-1][2];
        ii = cqList[cqi-1][3];
        j1 = cqList[cqi  ][2];
        ii = cqList[cqi  ][3];
      }
      
      var c0=crossPoint(inEqList[ii], inEqList[j0]);
      var c1=crossPoint(inEqList[ii], inEqList[j1]);
      
      var midx0 = (prediffx+nowx)/2;
      var nextdiffx = geomW.w[0][1];
      for(var cqi2=cqi+1;cqi2<cqList.length;cqi2++){
        if(cqList[cqi2][0] > nowx){
          nextdiffx = cqList[cqi2][0];
          break;
        }
      }
      var midx1 = (nowx+nextdiffx)/2;
      var midy = (c0[1]+c1[1])/2;
      var f0 = testPoint([midx0, midy],tree);
      var f1 = testPoint([midx1, midy],tree);
      if(f0!=f1){
        drawBoundary(inEqList[ii], c0, c1);
      }// f0!=f1
    }// if yaxis
    
    prex = nowx;
  }// for(cqi) (x)
  

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
var drawBoundary = function(ineq, c0, c1){
  if(ineq[3]==0 && ineq[4]==0 && ineq[5]==0){
    //1st order
    var dq0 = transPos(c0, geomW, geomD);
    var dq1 = transPos(c1, geomW, geomD);
    ctx[0].beginPath();
    ctx[0].moveTo(dq0[0],dq0[1], Math.PI*2, false);
    ctx[0].lineTo(dq1[0],dq1[1], Math.PI*2, false);
    ctx[0].stroke();
  }else{
    //2nd
  }
}
