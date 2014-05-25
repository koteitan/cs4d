var Debug = function(){
  this.itemlist = [];
}
Debug.prototype.addItem = function(item){
  switch(item.type){
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
      ctx.fillText(item.text, 
        item.p[0], item.p[1]);
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