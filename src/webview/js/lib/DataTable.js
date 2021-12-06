export class DataTable {
    constructor(id){
        this.elementTorender = document.getElementById(id);
    }
    render(configs) {
        if(configSection.hasChildNodes()){
            while (configSection.firstChild) {
              configSection.removeChild(configSection.firstChild);
            }
          }
          const componentConfig = configs.configs; 
          for(let i=0;i<componentConfig.length;i++){
            const tr = document.createElement('tr');
            const td1 = document.createElement("td");
            td1.textContent = componentConfig[i].name;
            tr.appendChild(td1);
            const td2 = document.createElement("td");
            this.createFields(td2, componentConfig[i]);
            tr.appendChild(td2);
            configSection.appendChild(tr);
          } 
    }
    createFields(td2, config){
        const inputEl = document.createElement('input');
        switch(config.type){
          case 'String/Object':
          case 'String':
            inputEl.type = 'text';
            inputEl.value = config.defaultValue || '';
            td2.appendChild(inputEl);
            break;
          case 'Boolean':
            inputEl.type = 'checkbox';
            inputEl.checked = config.defaultValue;
            td2.appendChild(inputEl);
            break;
          case 'Number':
            inputEl.type = 'number';
            inputEl.value = config.defaultValue || '';
            td2.appendChild(inputEl);
            break;
          default:
            inputEl.type = 'text';
            inputEl.value = config.defaultValue || '';
            td2.appendChild(inputEl);
            break;
        }
    }
}