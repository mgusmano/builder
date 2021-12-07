import {CategorySelection} from './categoryselection/CategorySelection.js';
class MainView {
    constructor(componetList) {
        this.addOnload();
        this.createView = this.createView.bind(this);
        this.list = componetList;
    }
    createView() {
        this.categorySection = new CategorySelection(this.list);
    }
    addOnload(){
        document.addEventListener('DOMContentLoaded',()=>{
            this.createView();
        });
    }
    
}

export function renderView(componetList) {
  const view = new MainView(componetList);
}