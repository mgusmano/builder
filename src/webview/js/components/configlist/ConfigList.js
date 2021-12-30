import { ToolTip } from '../../shared/tooltip/Tooltip.js';
import { Utils } from '../../shared/utils/Utils.js';
export class ConfigList {
    constructor(){ 
        this.toolTip = new ToolTip();
    }
    createConfigList(configs, defaultValues){
      this.astValueMapper = defaultValues;
      const configSection = document.querySelector('#config-section table');
      Utils.removeChildren(configSection);
      const filterEl = document.getElementById("filter-field");
      filterEl.style.display = '';
      this.addFilterEvents(filterEl);
      const componentConfig = configs.configs; 

      for(let i=0;i < componentConfig.length;i++){
        const tableRow = document.createElement('tr');
        const labelCell = document.createElement("td");
        labelCell.classList.add('config-label');
        const divTag = document. createElement("div");
        divTag.textContent = componentConfig[i].name;
        labelCell.appendChild(divTag);
        const helpIcon = document. createElement("div");
        helpIcon.classList.add('help-icon');
        helpIcon.addEventListener('mouseenter',(event) => {
          event.stopPropagation();
          this.updateTooltipText(event,componentConfig[i]);
        });

        helpIcon.addEventListener('mouseleave',()=>{
          this.removeOverlay();
        });
        labelCell.appendChild(helpIcon);
        tableRow.appendChild(labelCell);
        const valueCell = document.createElement("td");
        this.createFields(valueCell, componentConfig[i]);
        tableRow.appendChild(valueCell);
        configSection.appendChild(tableRow);
      } 
    }
    createFields(valueCell, config){
        let inputEl;
        let valueProperty = 'value';
        switch(config.type){
          case 'String/Object':
          case 'String':
            inputEl = document.createElement('vscode-text-field');
            break;
          case 'Boolean':
            inputEl = document.createElement('vscode-checkbox');
            valueProperty = 'checked';
          case 'Number':
            inputEl = document.createElement('vscode-text-field');
            inputEl.type = 'number';
            break;
          default:
            inputEl = document.createElement('vscode-text-field');
            break;
        }

        inputEl[valueProperty] = this.astValueMapper[config.name]||config.defaultValue || '';
        inputEl.style.width = '90%';
        valueCell.appendChild(inputEl);
        this.addConfigPanelFieldEvents(config, inputEl);
    }
    addConfigPanelFieldEvents(config, inputEl){
      
      if(config.type !=='Boolean') {
        inputEl.addEventListener('focus',(event)=>{
          event.stopImmediatePropagation();
        });

        inputEl.addEventListener('blur',(event)=>{
          event.stopPropagation();  
          this.onBlur(event,config);
        });

        inputEl.addEventListener('keypress',(event)=>{
          event.stopPropagation();
          this.onEnter(event,config);
        });
      }
      else if(config.type ==='Boolean') {
        inputEl.addEventListener('change',(event)=>{
            this.onCheckChange(event, config);
        });
      }
    }
    onBlur(event, config){
      this.updateCode(event, config);
    }
    onCheckChange(event, config){
      event.stopPropagation();
      const obj = {
        type:'string',
        name:config.name,
        defaultConfig:event.target.checked
      };
      vscode.postMessage({command: 'updateConfigs', payload: obj});
    }

    onEnter(event, config) {
      if (event.key === 'Enter') {
        this.updateCode(event, config);
      } 
    }
    updateCode(event, config){
      let value1 = '';
      try {
        value1 = eval(event.target.value);
      }
      catch(error){
        value1 = event.target.value;
      }
      const obj = {
        type:'string',
        name:config.name,
        defaultConfig:value1
      };
      vscode.postMessage({command: 'updateConfigs', payload: obj});
    }
    updateTooltipText(event, config){
        if (!config.description){
          return;
        }
        const offset = Utils.getOffset(event.target);
        const pos = {
          top: `${offset.top+20}px`,
          left: `${offset.left+30}px`
        };
    
        this.toolTip.showAt(pos);
        this.toolTip.updateTooltip(config.description);
      }
      removeOverlay(){
        this.toolTip.hide();
      }

      addFilterEvents(filrerEl){

        filrerEl.addEventListener('keyup',(event)=>{
          const search = event.target.value.toLowerCase(),
              list = document.querySelectorAll("#config-section table tr");
      
          for (let i=0;i<list.length;i++) {
              let item = list[i].children[0].innerText.toLowerCase();
              if (item.indexOf(search) === -1) { 
                list[i].classList.add("hide"); 
              }
              else {  list[i].classList.remove("hide"); }
          }
        });
      } 
}