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
        if(this.zoneMsg){
            this.zoneMsg.remove();
        }
    }
    unMarkComponent(){
        this.overlay.hide();
    }
    createValidDropZone(pos,size,text){
        this.updatePositionAndSize(pos,size);
        // if(text){
        //     this.updateZoneMessage(text);
        // }
        this.overlay.style.backgroundColor = 'green';
        this.overlay.style.border = `2px solid green`;
        this.overlay.style.opacity = `.3`;
    }
    createInvalidDropZone(pos,size, text){
        this.updatePositionAndSize(pos,size);
        this.overlay.style.backgroundColor = 'red';
        this.overlay.style.border = `2px solid red`;
        this.overlay.style.opacity = `.3`;
        // if(text){
        //     this.updateZoneMessage(text);
        // }
    }
    updatePositionAndSize(pos,size){
        if(size){
            this.updateSize(size);
        }
        if(pos){
            this.showAt(pos);
        }
    }
    updateZoneMessage(text){
        if(this.zoneMsg){
            this.zoneMsg.remove();
        }
        this.zoneMsg = document.createElement("div");
        this.zoneMsg.classList.add('ext-overlay-info');
        this.zoneMsg.innerText = text;
        this.overlay.appendChild(this.zoneMsg);
    }
}