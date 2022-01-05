export class Overlay {
    
    constructor(){
        this.create();
    }
    create(){
      if(this.overlay){
          this.remove();
      }  
      this.overlay = document.createElement("div");
      this.overlay.classList.add('ext-overlay');
      if(this.addCustomStyles){
        this.addCustomStyles();
      }
      this.updateSize();
      document.body.append(this.overlay);
    }
    updateSize({height='auto',width='auto'}={}){
        if(!this.overlay){
            return;
        }
        this.overlay.style.height = height ;
        this.overlay.style.width = width ;
    }
    updatePosition({top,left} = {}){
        if(top){
            this.overlay.style.top = top;
        }
        if(left){
            this.overlay.style.left = left;
        }
    }
    remove(){
        this.overlay.remove();
    }
    hide(){
        if(!this.overlay){
            return;
        }
        this.overlay.style.display = 'none';
    }
    show(){
        if(!this.overlay){
            return;
        }
        this.overlay.style.display = 'inherit';
    }
    showAt(pos){
        this.show();
        this.updatePosition(pos);
    }
}