/*----------------------------
debugcanvas.js
 debugging tool of canvas
-----------------------------*/
/* usage:

var canvas  = document.getElementById("canvas");
var ctx     = canvas.getContext('2d');
var drawall = function(){debug.draw();}
setInterval(drawall, 100);

var debug = new Debug();
debug.group = [];
var p = [ [1,2],[3,4],[5,6] ];
for (i=0;i<3;i++){
  debug.additem({
    type :"pointer",
    group:debug.group,
    text :"particle"+i,
    p    :p[i])});
  );
}

*/
var Debug = function(){
  this.itemlist = [];
}
Debug.prototype.addItem = function(item){
  switch(item.type){
    /* item.type == 'pointer'
         item.fillStyle   = fill style
         item.strokeStyle = stroke style
         item.font        = fontname
         item.p           = [x,y]       
         item.group       = list of the group in which 
            keeping away from each other */
    case "pointer":
    item.group.push(item);
    var o = Math.floor(Math.random()*4)*Math.PI/2  +Math.PI/4
           +           Math.random()   *Math.PI/8;
    item.textp = [item.p[0]+50*Math.cos(o), item.p[1]+50*Math.sin(o)];
    item.textv = [0, 0];
    item.draw = function(ctx){
      if(!(typeof item.font === "undefined")){
        ctx.font = item.font;
      }
      if(!(typeof item.fillStyle === "undefined")){
        ctx.fillStyle  = item.fillStyle;
      }
      if(!(typeof item.strokeStyle === "undefined")){
        ctx.strokeStyle  = item.strokeStyle;
      }
      item.tw = ctx.measureText(item.text).width;
      ctx.fillText(item.text, 
                   item.textp[0]-item.tw/2, 
                   item.textp[1]-1);
      ctx.beginPath();
      ctx.moveTo  (item.textp[0]+item.tw/2,item.textp[1]);
      ctx.lineTo  (item.textp[0]-item.tw/2,item.textp[1]);
      ctx.lineTo  (item.    p[0]          ,item.    p[1]);
      ctx.stroke();
      
      /* motion */
      item.textp[0] += item.textv[0];
      item.textp[1] += item.textv[1];
      item.textv[0] *= 0.8;
      item.textv[1] *= 0.8;
      /* rebound item with each other */
      for(var i=0;i<item.group.length;i++){
        var j = item.group[i];
        if(j!==item){
          if(Math.abs(item.textp[0]-j.textp[0]) < (item.tw+j.tw)/2 &&
             Math.abs(item.textp[1]-j.textp[1]) < 10){
            item.textv[0] = 5*sign(item.textp[0]-j.textp[0]);
            item.textv[1] = 5*sign(item.textp[1]-j.textp[1]);
          }
        }
      }
      /* rebound item with boundary of canvas */
      if(item.textp[0]<                +item.tw) item.textv[0]=+5;
      if(item.textp[0]>ctx.canvas.width-item.tw) item.textv[0]=-5;
      if(item.textp[1]<                 +10) item.textv[1]=+5;
      if(item.textp[1]>ctx.canvas.height-10) item.textv[1]=-5;
    }
    break;
    /* item.strokeStyle = stroke style
       item.font        = fontname
       item.p           = [x,y]       */
    case "text":
    item.draw = function(ctx){
      if(!(typeof item.font === "undefined")){
        ctx.font = item.font;
      }
      if(!(typeof item.fillStyle === "undefined")){
        ctx.fillStyle  = item.fillStyle;
      }
      ctx.fillText(item.text, item.p[0], item.p[1]);
    }
    break;
    /* item.strokeStyle = stroke style
       item.lineWidth   = line width
       item.c           = [x,y] = position of center
       item.r           = radius */
    case "circle":
    item.draw = function(ctx){
      if(!(typeof item.lineWidth === "undefined")){
        ctx.lineWidth  = item.lineWidth;
      }
      if(!(typeof item.strokeStyle === "undefined")){
        ctx.strokeStyle  = item.strokeStyle;
      }
      ctx.beginPath();
      ctx.arc(item.c[0], item.c[1], 
        item.r, 0, Math.PI*2, false);
      ctx.stroke();
    }
    break;
    /* item.strokeStyle = stroke style
       item.lineWidth   = line width
       item.p           = [[x0,y0],[x1,y1] ] */
    case "line":
    item.draw = function(ctx){
      if(!(typeof item.lineWidth === "undefined")){
        ctx.lineWidth  = item.lineWidth;
      }
      if(!(typeof item.strokeStyle === "undefined")){
        ctx.strokeStyle  = item.strokeStyle;
      }
      ctx.beginPath();
      ctx.moveTo(item.p[0][0],item.p[0][1]);
      ctx.lineTo(item.p[1][0],item.p[1][1]);
      ctx.stroke();
    }
    break;
    default:
    break;
  }
  this.itemlist.push(item);
}
Debug.prototype.draw = function(ctx){
  for(var i=0;i<this.itemlist.length;i++){
    this.itemlist[i].draw(ctx);
  }
}