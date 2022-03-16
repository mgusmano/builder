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

      //Custom Functions
      this.createCustomFunctions(configs);
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
        const listeners = this.astValueMapper.listeners || {};
        if(listeners[eventName]){
          return;
        }
        const methodName = `on${xtype.charAt(0).toUpperCase() + xtype.substring(1)}${eventName.charAt(0).toUpperCase() + eventName.substring(1)}`;
        this.addEventConfig(eventName, methodName);
        selectList.remove();
        this.updateEventsCode(eventName, methodName);
        this.createEventFunction(eventsList.find(event => event.name === eventName), methodName);
      })
      selectList.style.width = '90%';
      eventListSection.appendChild(selectList);
    }

    addEventConfig(eventName, methodName){
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
      divTag.appendChild(nameDiv);

      const addIcon = document.createElement("div");
      addIcon.className = 'x-fa fa-remove';
      addIcon.style.cursor = 'pointer';
      addIcon.addEventListener('click',(event) => {
        this.removeEventConfig(divTag, eventName, methodName);
      });
      divTag.appendChild(addIcon);
      eventListSection.appendChild(divTag);
    }

    removeEventConfig(eventConfigElement, eventName, methodName){
      eventConfigElement.remove();
      this.updateEventsCode(eventName, null, true);
      const obj = {
        type:'Function',
        name: methodName,
        remove: true
      };
      vscode.postMessage({command: 'updateFunctions', payload: obj});
    }

    updateEventsCode(eventName, methodName, remove){
      if(!this.astValueMapper.listeners){
        this.astValueMapper.listeners = {};
      }
      const listeners = this.astValueMapper.listeners;
      if(remove){
        delete listeners[eventName];
      }else{
        listeners[eventName] = methodName;
      }
      const obj = {
        type:'string',
        name: 'listeners',
        defaultConfig: listeners,
        skipCodeUpdate: true
      };
      vscode.postMessage({command: 'updateConfigs', payload: obj});
    }

    createCustomFunctions(configs){
      const customFunctionsSection = document.getElementById('custom-functions');
      Utils.removeChildren(customFunctionsSection);
      const divTag = document.createElement("div");
      divTag.className = 'events-list';

      const nameDiv = document.createElement("div");
      nameDiv.textContent = 'Functions';
      nameDiv.style.flex = 1;
      divTag.appendChild(nameDiv);

      const addIcon = document.createElement("div");
      addIcon.className = 'x-fa fa-plus';
      addIcon.style.cursor = 'pointer';
      addIcon.addEventListener('click',(event) => {
        this.addFunctionView(configs);
      });
      divTag.appendChild(addIcon);
      customFunctionsSection.appendChild(divTag);

      //Set existing custom functions
      for (const key in this.astValueMapper) {
        const configValue = this.astValueMapper[key];
        if(configValue && configValue.type === 'FunctionExpression'){
          if(!(this.astValueMapper.listeners && Object.values(this.astValueMapper.listeners).includes(key)) && key.substring(0,2) !== 'on'){
            this.addFunctionConfigView(key, configValue.params.map(param => param.name));
          }
        }
      }
    }

    addFunctionView(){
      const customFunctionsSection = document.getElementById('custom-functions');
      //Create and append select list
      var functionName = document.createElement("vscode-text-field");
      functionName.style.width = '100%';
      functionName.style.paddingLeft ='10px';
      const addIcon = document.createElement("span");
      addIcon.slot = 'end';
      addIcon.className = 'x-fa fa-light fa-arrow-right';
      addIcon.style.cursor = 'pointer';
      addIcon.addEventListener('click', (event) => {
        this.addFunctionConfigView(functionName.value);
        functionName.remove();
      })
      functionName.appendChild(addIcon);
      functionName.addEventListener('keyup', (event) => {
        if (event.code === 'Enter') {
          this.addFunctionConfigView(functionName.value);
          functionName.remove();
        }
      })
      customFunctionsSection.appendChild(functionName);
    }

    addFunctionConfigView(functionName, params = []){
      const customFunctionsSection = document.getElementById('custom-functions');

      const updateFunction = () => {
        vscode.postMessage({
          command: 'updateConfigs', 
          payload: {
            type:'Function',
            name: functionName,
            defaultConfig: params
          }
        });
      }
      
      const divTag = document.createElement("div");

      const functionDiv = document.createElement("div");
      functionDiv.className = 'events-list';

      const chevron = document.createElement("span");
      chevron.className = 'x-fa fa-light fa-chevron-right';
      chevron.style.cursor = 'pointer';
      chevron.style.paddingLeft = '5px';

      
      chevron.addEventListener('click', (event) => {
        
        if(event.target.classList.contains('fa-chevron-right')){
          chevron.classList.remove('fa-chevron-right');
          chevron.classList.add('fa-chevron-down');
          functionParamsEl.style.display = '';
        }else{
          chevron.classList.remove('fa-chevron-down');
          chevron.classList.add('fa-chevron-right');
          functionParamsEl.style.display = 'none';
        }
        
      })
      functionDiv.appendChild(chevron);
      const nameDiv = document.createElement("div");
      nameDiv.innerText = functionName;
      nameDiv.style.flex = 1;
      nameDiv.style.paddingLeft = '5px';
      functionDiv.appendChild(nameDiv);

      const removeIcon = document.createElement("div");
      removeIcon.className = 'x-fa fa-light fa-remove';
      removeIcon.style.cursor = 'pointer';
      removeIcon.addEventListener('click',(event) => {
        vscode.postMessage({command: 'updateFunctions', payload: {
          type:'Function',
          name: functionName,
          remove: true,
          currentView: true
        }});
        divTag.remove();
      });
      functionDiv.appendChild(removeIcon);
      divTag.appendChild(functionDiv);
      const functionParamsEl = this.functionParamsEl();
      functionParamsEl.value = params.join(', ');
      functionParamsEl.addEventListener('keyup', (event) => {
        if (event.code === 'Enter') {
          params = functionParamsEl.value.split(',').map(param => param.trim());
          updateFunction();
        }
      });
      
      const addIcon = document.createElement("span");
      addIcon.slot = 'end';
      addIcon.className = 'x-fa fa-light fa-arrow-right';
      addIcon.style.cursor = 'pointer';
      addIcon.addEventListener('click', (event) => {
        params = functionParamsEl.value.split(',').map(param => param.trim());
        updateFunction();
      })
      functionParamsEl.appendChild(addIcon);
      divTag.appendChild(functionParamsEl);
      customFunctionsSection.appendChild(divTag);
      updateFunction();
      
    }

    functionParamsEl(params){
      var paramsField = document.createElement("vscode-text-field");
      paramsField.textContent = 'params';
      paramsField.style.paddingLeft = '20px';
      paramsField.style.display = 'none';
      return paramsField;
    }

    createEventFunction(eventConfig, methodName){
      if(eventConfig){
        const params = eventConfig.params.map(param => {
          if(param.name === "this"){
            param.name = "component";
          }
          return param.name;
        });
        const obj = {
          type:'Function',
          name: methodName,
          defaultConfig: params
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