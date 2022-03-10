import DataShareService from '../../shared/services/DataShareService.js';
import { Utils } from '../../shared/utils/Utils.js';
export class ExtComponentList {
    constructor(){
       this.categotyEl = document.getElementById('mainCategorySec');
       this.subCategotyEl = document.getElementById('subCategory'); 
       this.componentList = JSON.parse(window.localStorage.getItem("componentList"));
       this.createComponentListView();
    }
    createComponentListView(list){
        const cmpList = this.componentList;
        const unOrderedList = document.createElement('ul');
        unOrderedList.classList.add("component-list");
        for (let i=0; i< cmpList.length; i++) {

          const list = document.createElement('li');
          
          list.textContent = `${cmpList[i].text}(${cmpList[i].compoentChild.length})`;
          list.onclick = () => {
            this.createCategorySubSction(cmpList[i].compoentChild);
          };
          unOrderedList.appendChild(list);
        }
        this.categotyEl.appendChild(unOrderedList);
      }
      createCategorySubSction(subList) {
        if(subList){
          Utils.removeChildren(this.subCategotyEl);
          const unOrderedList = document.createElement('ul');
          unOrderedList.classList.add("component-list");
          for(let i=0; i< subList.length; i++) {
            const list = document.createElement('li');
            list.textContent = subList[i].text;
            
            list.draggable="true";
            list.addEventListener('dragstart',(event)=>{
                event.dataTransfer.effectAllowed = "copyMove";
                DataShareService.dataTobeTrasferd = subList[i];
            }); 
            unOrderedList.appendChild(list);
          }
          this.subCategotyEl.appendChild(unOrderedList);
        }
    }
}