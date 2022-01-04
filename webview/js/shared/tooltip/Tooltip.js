import { Overlay } from "../overlay/Overlay.js";
export class ToolTip extends Overlay {
    addCustomStyles(){
        this.overlay.classList.add('tooltip');
    }
    updateTooltip(tiptext){
        if(!this.overlay){
            return;
        }
        this.overlay.innerText = tiptext;
    }
}