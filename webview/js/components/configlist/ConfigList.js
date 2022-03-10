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

      //Events List
      this.createEventsList(configs);
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
            break;
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

    createEventsList(configs){
      const eventListSection = document.getElementById('events-list');
      Utils.removeChildren(eventListSection);
      const divTag = document.createElement("div");
      divTag.className = 'events-list';

      const nameDiv = document.createElement("div");
      nameDiv.textContent = 'Event bindings';
      nameDiv.style.flex = 1;
      divTag.appendChild(nameDiv);

      const addIcon = document.createElement("div");
      addIcon.className = 'x-fa fa-plus';
      addIcon.style.cursor = 'pointer';
      addIcon.addEventListener('click',(event) => {
        this.createEventConfig(configs);
      });
      divTag.appendChild(addIcon);
      eventListSection.appendChild(divTag);

      //Set existing events
      const existingEvents = this.astValueMapper.listeners;
      for (const key in existingEvents) {
        this.addEventConfig(key, existingEvents[key]);
      }
    }

    createEventConfig(configs){
      const eventListSection = document.getElementById('events-list');
      const eventsList = configs.events;
      //Create and append select list
      var selectList = document.createElement("vscode-dropdown");
      // Default option
      var option = document.createElement("vscode-option");
      option.innerText = 'Select an event';
      option.style.display = 'none';
      selectList.appendChild(option);

      //Create and append the options
      for (var i = 0; i < eventsList.length; i++) {
          var option = document.createElement("vscode-option");
          option.innerText = eventsList[i].name;
          selectList.appendChild(option);
      }
      selectList.addEventListener('change', (event) => {
        const xtype = configs.xtype;
        const eventName = selectList.value;
        const methodName = `on${xtype.charAt(0).toUpperCase() + xtype.substring(1)}${eventName.charAt(0).toUpperCase() + eventName.substring(1)}`;
        this.addEventConfig(eventName, methodName);
        selectList.remove();
        this.updateEventsCode(eventName, methodName);
        this.createFunction(eventsList.find(event => event.name === eventName), methodName);
      })
      selectList.style.width = '90%';
      eventListSection.appendChild(selectList);
    }

    addEventConfig(eventName, methodName){
      // const xtype = configs.xtype;
      // const eventName = selectList.value;
      // const methodName = `on${xtype.charAt(0).toUpperCase() + xtype.substring(1)}${eventName.charAt(0).toUpperCase() + eventName.substring(1)}`;

      const eventListSection = document.getElementById('events-list');
      const divTag = document.createElement("div");
      divTag.className = 'events-list';

      const nameDiv = document.createElement("div");
      nameDiv.innerText = methodName;
      const eventNameSpan = document.createElement("span");
      eventNameSpan.style.fontStyle = 'italic';
      eventNameSpan.textContent = eventName;
      eventNameSpan.style.paddingLeft = '5px';
      nameDiv.appendChild(eventNameSpan);
      nameDiv.style.flex = 1;
      // nameDiv.style.fontStyle = 'italic';
      divTag.appendChild(nameDiv);

      const addIcon = document.createElement("div");
      addIcon.className = 'x-fa fa-remove';
      addIcon.style.cursor = 'pointer';
      addIcon.addEventListener('click',(event) => {
        this.removeEventConfig(divTag, eventName);
      });
      divTag.appendChild(addIcon);
      eventListSection.appendChild(divTag);
    }

    removeEventConfig(eventConfigElement, eventName){
      eventConfigElement.remove();
      this.updateEventsCode(eventName, null, true);
    }

    updateEventsCode(eventName, methodName, remove){
      const listeners = this.astValueMapper.listeners || {};
      if(remove){
        delete listeners[eventName];
      }else{
        listeners[eventName] = methodName;
      }
      const obj = {
        type:'string',
        name: 'listeners',
        defaultConfig: listeners
      };
      vscode.postMessage({command: 'updateConfigs', payload: obj});
    }

    createFunction(eventConfig, methodName){
      if(eventConfig){
        const params = eventConfig.params.map(param => param.name);
        // const fn = new Function(...eventConfig.params.map(param => param.name));
        const obj = {
          type:'string',
          name: methodName,
          defaultConfig: `function ${methodName}(${params.join(',')}){}`
        };
        vscode.postMessage({command: 'updateFunctions', payload: obj});
      }
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