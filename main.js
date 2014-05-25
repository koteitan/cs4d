/*----------------------------------
  main.js
  main program and entry point
----------------------------------*/
// static var on game
// for world
var dims = 4;
var secPframe = 1; // [sec/frame]
var geomW = new Geom(2, [[-1,-1],[+1,+1]]);
var geomD;

/* -----------------------------------------------
InequalityPolytope
  indicates 4D-polytope which is described by inequality.
  the function has 3 types of constructor;
    InequalityPolytope(matrix  , sign ),
    InequalityPolytope(operator, param),
    InequalityPolytope(value          ).
  
    InequalityPolytope(matrix, sign)
      matrix = S = (dim+1)x(dim+1) 2D array 
             = matrix of coefficients of inequality;
        sign == +1
          [x,y,z,w,1]S[x,y,z,w,1]^T > 0
        sign == -1
          [x,y,z,w,1]S[x,y,z,w,1]^T < 0
        
    InequalityPolytope(operator, param);
      operator;
        InequalityPolytope("!" ,[a          ]) = invert of a.
        InequalityPolytope("|" ,[a0,a1,�c,ak]) = union.
        InequalityPolytope("&" ,[a0,a1,�c,ak]) = intersection.
        InequalityPolytope("^" ,[a0,a1,�c,ak]) = xor
      param = array of parameters
      
  -----------------------------------------------*/
var InequalityPolytope = function(){
  if(arguments.length==2 && arguments[0] instanceof Array){
    /* matrix notation */
    this.type   = "matrix";
    this.matrix = arguments[0];
    this.sign   = arguments[1];
    return;
  }else if(arguments.length==1 && arguments[0].constructor==Boolean){
    /* boolean notation */
    this.type   = "boolean";
    this.value  = arguments[0];
  }else if(arguments.length==2 && arguments[0].constructor==String){
    /* string notation */
    this.type   = "operator";
    this.operator = arguments[0];
    this.param = arguments[1];
  }
};
InequalityPolytope.prototype.toString = function(){
  switch(this.type){
    case "boolean":
    return this.value;
    case "operator":
      var out = "";
      for(var i=0;i<this.param.length;i++){
        out += "(" + this.param[i].toString() + ")";
        if(i<this.param.length-1) out += this.operator;
      }
    return out;
    case "matrix":
      var varstr="xyzw";
      var matrix;
      if(this.matrix[0] instanceof Array){
        matrix = this.matrix;
      }else{
        matrix = this.ineqlist[this.matrix];
      }
      var out="";
      for(var i=0;i<this.matrix.length;i++){
        for(var j=i;j<this.matrix[i].length;j++){
          var value = i==j ? this.matrix[i][j]:this.matrix[i][j]+this.matrix[j][i];
          if(value==0){
            continue;
          }else if(value==+1 
            && (i<this.matrix.length-1 || j<this.matrix.length-1)){
            out += sprintf("+",value);
          }else if(value==-1 
            && (i<this.matrix.length-1 || j<this.matrix.length-1)){
            out += sprintf("-",value);
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
    return out + (this.sign?">":"<") + "0";
  }
}
/* test the equation "this" at point q.
  q = [x,y,z,w,1].
  return value = true / false
  ex. 
  new InequalityPolytope(
    [[0,0,0,0,1],
     [0,0,0,0,2],
     [0,0,0,0,3],
     [0,0,0,0,4],
     [1,2,3,4,0]],+1).test([5,6,7,8,1])
  returns true because
    2x+4y+6z+8w>0 at (x,y,z,w)==(5,6,7,8)
    == 10+24+42+64>0 
    == true
*/
InequalityPolytope.prototype.test = function(q){
  switch(this.type){
    case "matrix":
      var m;
      if(this.matrix[0] instanceof Array){
        m = this.matrix;
      }else{
        m = this.ineqlist[this.matrix];
      }
      return product(q, mul(m, q)) * this.sign > 0;
    case "boolean":
      return this.value;
    case "operator":
      switch(this.operator){
        case "!":
        return !b;
        case "|":
          var b = this.param[0].test(q);
          for(var i=1;i<this.param.length;i++) b = b || this.param[i].test(q);
        return b;
        case "&":
          var b = this.param[0].test(q);
          for(var i=1;i<this.param.length;i++) b = b && this.param[i].test(q);
        return b;
        case "^":
          var b = this.param[0].test(q) | 0;
          for(var i=1;i<this.param.length;i++) b ^= this.param[i].test(q);
        default:
        return b==1;
      }
    return;
  }
};
/* test with replacing boundaryMatrix with assumption. 
  q             : 1D array. test point.
  boundaryMatrix: 2D array. indicating test boundary 
  assumption    : boolean
  see InequalityPolytope.prototype.test().
*/
InequalityPolytope.prototype.testReplacedBoundary = function(q, boundaryMatrix, assumption){
  switch(this.type){
    case "matrix":
      var m;
      if(this.matrix[0] instanceof Array){
        m = this.matrix;
      }else{
        m = this.ineqlist[this.matrix];
      }
      if(m.isEqual(boundaryMatrix)){
        return assumption;
      }else{
        return product(q, mul(m, q)) * this.sign > 0;
      }
    case "boolean":
      return this.value;
    case "operator":
      switch(this.operator){
        case "!":
        return !b;
        case "|":
          var b = this.param[0].test(q);
          for(var i=1;i<this.param.length;i++) b = b || this.param[i].testReplacedBoundary(q,boundary,assumption);
        return b;
        case "&":
          var b = this.param[0].test(q);
          for(var i=1;i<this.param.length;i++) b = b && this.param[i].testReplacedBoundary(q,boundary,assumption);
        return b;
        case "^":
          var b = this.param[0].test(q) | 0;
          for(var i=1;i<this.param.length;i++) b ^= this.param[i].testReplacedBoundary(q,boundary,assumption);
        default:
        return b==1;
      }
    return;
  }
};

/* list unique inequalities -------------------
  eqlist = all inequalities
           listed uniquely.
---------------------------------------------- */
InequalityPolytope.prototype.listInequalities = function(eqlist){
  switch(this.type){
    case "matrix":
      eqlist.pushUniquely(this.matrix);
    break;
    case "boolean":
    break;
    case "operator":
      for(var i=0;i<this.param.length;i++){
        this.param[i].listInequalities(eqlist);
      }
    break;
    default:
    break;
  }
  return eqlist;
}
/* list cross points ----------------------------
  returns:
    cplist[ei] = [x, y, e] 
               = eqlist[ei] and e are crossing
                 on each other at (x,y) 
---------------------------------------------- */
InequalityPolytope.prototype.listCrossPoints = function(){
  // list inequalities
  this.eqlist = this.listInequalities([]);
  this.cplist = new Array(this.eqlist.length);
  
  var crossPoint = function(eq0, eq1){
    if(eq0.length == 3 && eq0[0][0]==0 && eq0[1][1]==0 &&
       eq1.length == 3 && eq1[0][0]==0 && eq1[1][1]==0){
      //2d lines
      var cx0 = eq0[0][2]+eq0[2][0];
      var cy0 = eq0[1][2]+eq0[2][1];
      var c10 = eq0[2][2];
      var cx1 = eq1[0][2]+eq1[2][0];
      var cy1 = eq1[1][2]+eq1[2][1];
      var c11 = eq1[2][2];
      var cq = mulxv(
        inv([[cx0,cy0],[cx1,cy1]]),
        [-c10,-c11]);
      if(cq[0]==NaN || cq[1]==NaN){
        return [];
      }else{
        return cq;
      }
    }else{
      //2d lines only
      return [];
    }
  }// crossPoint()
  
  for(var i=0;i<this.eqlist.length;i++){
    this.cplist[i]=[];
    var e=this.eqlist[i];
    // find all cross point in display for line i
    for(var j=i+1;j<this.eqlist.length;j++){
      var cq = crossPoint(e, this.eqlist[j]);
      if(cq.length==2 && 
        geomW.w[0][0]<=cq[0] && cq[0]<=geomW.w[1][0] &&
        geomW.w[0][1]<=cq[1] && cq[1]<=geomW.w[1][1]){
        // if within display
        this.cplist[i].push([cq[0], cq[1], e]);
      }
    }// for j
    
    // sort corss points
    if(e.length == 3 && e[0][0]==0 && e[1][1]==0){
      //line
      if(e[1][0]!=0){
        // oblique line
        this.cplist.sort(function(a,b){return a[0]-b[0];});
      }else{
        // vertical line
        this.cplist.sort(function(a,b){return a[1]-b[1];});
      }
    }else{
      // conic line
      /*         (a,b,c  (x
         (x,y,1)  d,e,f   y
                  g,h,i)  1)
      = ax^2 + ey^2 + (b+d)xy + (c+g)x + (f+h)y + i = 0
      = m[0][0]x^2 + m[1][1]y^2 + m[2][2] + 
      + (m[0][1]+m[1][0])xy 
      + (m[0][2]+m[2][0])x 
      + (m[1][2]+m[2][1])y  = f = 0
      df/dy = 2m[1][1]y + (m[0][1]+m[1][0])x + m[1][2]+m[2][1]
      df/dx = 2m[0][0]x + (m[0][1]+m[1][0])y + m[0][2]+m[2][0]
      */
      this.cplist.sort(function(a,b){
        var am = a[2];
        var bm = b[2];
        return Math.atan2(
          (am[0][0]+am[0][0])*a[0]
         +(am[1][2]+am[2][1])*a[1]
         +(am[0][2]+am[2][0])     ,
          (am[1][1]+am[1][1])*a[1]
         +(am[0][2]+am[2][0])*a[0]
         +(am[1][2]+am[2][1])
         )     -Math.atan2(
          (bm[0][0]+bm[0][0])*b[0]
         +(bm[1][2]+bm[2][1])*b[1]
         +(bm[0][2]+bm[2][0])     ,
          (bm[1][1]+bm[1][1])*b[1]
         +(bm[0][2]+bm[2][0])*b[0]
         +(bm[1][2]+bm[2][1])
        );
      });//sort
    }//else
  }//i
}
InequalityPolytope.prototype.listSegments = function(){
  this.seglist = [];
  for(var ei=0;ei<this.cplist.length;ei++){
    var cl = this.cplist[ei];
    var me = this.eqlist[ei];
    var D  = 1/10000;
    for(var ci=0;ci<cl.length-1;ci++){
      /* make test point */
      if(1){
        var m = [(cl[ci+0][0]+cl[ci+1][0])/2, 
                 (cl[ci+0][1]+cl[ci+1][1])/2];
        debug.addItem({
          strokeStyle:"yellow",
          type:"circle", 
          c   :transPos(m, geomW, geomD), 
          r   :10});
        debug.addItem({
          fillStyle:"yellow",
          type:"text",
          text:"(ei="+ei+" ci="+ci+")",
          p   :transPos(m, geomW, geomD)});
        if(this.testReplacedBoundary(m, me, true) 
        != this.testReplacedBoundary(m, me, false)){
          var s = new Segment({
            type:"line", 
            p0  :cl[ci+0], 
            p1  :cl[ci+0]
          });
          this.seglist.push(s);
        }
      }else{
      }
    }//ci
  }//ei
}
InequalityPolytope.prototype.draw = function(ctx){
  for(var si=0;si<this.seglist.length;si++){
    this.seglist[si].draw(ctx);
  }
}
var Segment = function(param){
  this.param = param;
  switch(this.param.type){
    case "line":
    this.draw = function(ctx){
      ctx.beginPath();
      ctx.moveTo(this.param.p[0][0],this.param.p[0][1]);
      ctx.lineTo(this.param.p[1][0],this.param.p[1][1]);
      ctx.stroke();
    };
    break;
    default:
    break;
  }
}

// dinamic var on game
var timenow=0;
var debug = new Debug();

//ENTRY POINT --------------------------
window.onload=function(){
  initGui();
  initBody();
  procDraw();
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
/*
  var innersphere = new InequalityPolytope([[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,-(21/54)*(21/54)]],-1);
  */
  ip0 = new InequalityPolytope([
    [0,  0  , 0.5],
    [0,  0  , 0  ],
    [0.5,0  , 0  ]],+1);
  ip1 = new InequalityPolytope([
    [0,  0  , 0  ],
    [0,  0  , 0.5],
    [0  ,0.5, 0  ]],+1);
  ip2 = new InequalityPolytope([
    [0,  0  , 0.5],
    [0,  0  , 0.5],
    [0.5,0.5,-0.5]],-1);
  ip3 = new InequalityPolytope("&",[ip0,ip1,ip2]);
  
  /* add display boundaries */
  wip = new InequalityPolytope("&",[
    new InequalityPolytope([[0,0,1/2],[0,0,0],[1/2,0,+1]],+1),
    new InequalityPolytope([[0,0,1/2],[0,0,0],[1/2,0,-1]],-1),
    new InequalityPolytope([[0,0,0],[0,0,1/2],[0,1/2,+1]],+1),
    new InequalityPolytope([[0,0,0],[0,0,1/2],[0,1/2,-1]],-1)
  ]);
  iproot = new InequalityPolytope("&",[ip3,wip]);
  iproot.listCrossPoints();
  iproot.listSegments();
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
  
  iproot.draw();
  
  // draw all cross points [BLUE] ------------
  var radius = 4;
  ctx[0].strokeStyle='rgb(0,0,255)';
  for(var x=-1;x<+1;x+=0.04){
    for(var y=-1;y<+1;y+=0.04){
      var dc = transPos([x,y], geomW, geomD);
      if(iproot.test([x,y,1])){
        ctx[0].beginPath();
        ctx[0].arc(dc[0], dc[1], radius, 0, Math.PI*2, false);
        ctx[0].stroke();
      }else{
        ctx[0].beginPath();
        ctx[0].moveTo(dc[0]-radius/2,dc[1]-radius/2);
        ctx[0].lineTo(dc[0]+radius/2,dc[1]+radius/2);
        ctx[0].stroke();
        ctx[0].beginPath();
        ctx[0].moveTo(dc[0]-radius/2,dc[1]+radius/2);
        ctx[0].lineTo(dc[0]+radius/2,dc[1]-radius/2);
        ctx[0].stroke();
      }
    }
  }
  // draw all cross points [GREEN] ------------
  ctx[0].strokeStyle='rgb(0,255,0)';
  for(var e=0;e<iproot.cplist.length;e++){
    for(var c=0;c<iproot.cplist[e].length;c++){
      var d = transPos([iproot.cplist[e][c][0],iproot.cplist[e][c][1]], geomW, geomD);
      ctx[0].beginPath();
      ctx[0].arc(d[0], d[1], radius, 0, Math.PI*2, false);
      ctx[0].stroke();
    }
  }
  debug.draw(ctx[0]);
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
//  http://members.jcom.home.ne.jp/dslender/math/2jibunrui.pdf
