import {CategorySelection} from './categoryselection/CategorySelection.js';
class MainView {
    constructor(ast) {
        this.addOnload();
        this.createView = this.createView.bind(this);
        this.ast = ast;
    }
    createView() {
        this.categorySection = new CategorySelection(this.ast);
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