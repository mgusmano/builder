import {ComponentDropZone} from './components/componentdropzone/ComponentDropZone.js';
import { ExtComponentList } from './components/extcomponentlist/ExtComponentList.js';
class MainView {
    constructor(ast) {
        this.addOnload();
        this.createView = this.createView.bind(this);
        this.ast = ast;
    }
    createView() {
        this.categorySection = new ComponentDropZone(this.ast);
        this.componentListView = new ExtComponentList();
    }
    addOnload(){
        document.addEventListener('DOMContentLoaded',()=>{
            this.createView();
        });
    }
    
}

export function renderView(ast) {
  const view = new MainView(ast);
}