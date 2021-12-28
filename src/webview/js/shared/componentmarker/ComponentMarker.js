import { Overlay } from "../overlay/Overlay.js";
export class ComponentMarker extends Overlay {
    constructor(){
        super();
        this.overlay.classList.add('dropOverlay');
    }
    markComponenent(pos,size){
        this.updatePositionAndSize(pos,size);
        this.overlay.style.backgroundColor = '';
        this.overlay.style.border = '2px solid blue';
        this.overlay.style.opacity = "inherit";
    }
    unMarkComponent(){
        this.overlay.hide();
    }
    createValidDropZone(pos,size){
        this.updatePositionAndSize(pos,size);
        this.overlay.style.backgroundColor = 'green';
        this.overlay.style.border = `2px solid green`;
        this.overlay.style.opacity = `.3`;
    }
    createInvalidDropZone(pos,size){
        this.updatePositionAndSize(pos,size);
        this.overlay.style.backgroundColor = 'red';
        this.overlay.style.border = `2px solid red`;
        this.overlay.style.opacity = `.3`;
    }
    updatePositionAndSize(pos,size){
        if(size){
            this.updateSize(size);
        }
        if(pos){
            this.showAt(pos);
        }
    }
}