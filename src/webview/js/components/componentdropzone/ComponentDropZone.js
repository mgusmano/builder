import getExtjsComponentMapper from '../../constants/ComponentList.js';
import {ComponentMarker} from '../../shared/componentmarker/ComponentMarker.js';
import {ConfigList} from '../configlist/ConfigList.js';

import DataShareService from '../../shared/services/DataShareService.js';
export class ComponentDropZone {
    constructor(ast) {
       this.ast = ast;
       this.astValueMapper = {};
       this.componentTargets = JSON.parse(window.localStorage.getItem('componentTargets'));
       this.loadDroptarget();
       this.subscribeTomessage();
       this.addListeners();
       this.setClassicOrModern();
       this.componentMask = new ComponentMarker();
    }
    setClassicOrModern(){
      const toolkit = window.localStorage.getItem('toolkit');
      const mapper = getExtjsComponentMapper(toolkit);
      this.componentMapper = mapper;
      this.droppableCls = Object.keys(mapper);
    }
    createAstValueMapper(ast){
      this.astValueMapper = {};
      const astObjMapper = ast;
      for(let i=0;i<astObjMapper.length;i++){
        this.astValueMapper[astObjMapper[i].key.name || astObjMapper[i].key.value] = astObjMapper[i].value.value;
      }
    }
    addListeners(){
      document.getElementById('show-code').addEventListener('click',()=>{
        vscode.postMessage({command: 'showCode'});
      });

      document.getElementById('content-frame').addEventListener('click',(event)=>{
        this.contentFrameClick(event);
      },false);

      window.addEventListener('resize', ()=> {
        if(this.componentMask){
          this.componentMask.hide();
        }
      });
    }
    contentFrameClick(event){ 
      event.stopImmediatePropagation();
      this.parent = event.target;
      while(this.parent!==null){
        if(this.parent.classList.length>0 && this.isClassPresent()){
          const type = this.componentMapper[this.parentCls];
          if(type) {
            this.markComponenent();
            const lc = this.locateComponent();
            vscode.postMessage({command: 'showConfig',location:lc, payload: {type}});
            event.preventDefault();
          }
          break;
        }
        this.parent = this.parent.parentElement;
      }
    }
    markComponenent(){
      const offset = this.parent.getBoundingClientRect();
      const size = {height: `${offset.height}px`, width: `${offset.width}px`};
      const pos = {top:`${offset.top}px`, left: `${offset.left}px`};
      this.componentMask.markComponenent(pos,size);
    }
    subscribeTomessage() {
        window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
          case 'loadConfig': {
            this.createConfigList(JSON.parse(message.payload),message.ast);
            break;
          }
          case 'reloadView':{
            //this.updateConfigValues(message);
          }
        }
      });
    }
    updateConfigValues(data){
      this.ast = data.ast;
      //this.createAstValueMapper();
      const tableRows = document.querySelectorAll('#config-section table tr');
      if(!tableRows || tableRows.length === 0){
       return;
      }
      this.updateViewConfigs(tableRows);
    }
    updateViewConfigs(tableRows){
      const componentConfig = this.currentConfig.configs;
      for(let i=0;i<componentConfig.length;i++){
        if(this.astValueMapper[componentConfig[i].name]!==undefined){
          const valueAtt = componentConfig[i].type === 'Boolean'?'checked':'value';
          tableRows[i].children[1].firstChild[valueAtt] = this.astValueMapper[componentConfig[i].name];
        }
      }
    }

    createConfigList(configs, ast) {
      this.currentConfig = configs;
      this.astValueMapper = ast;
      if(!this.configList){
        this.configList = new ConfigList();
      }
      this.configList.createConfigList(configs, ast);
  }
  loadDroptarget(){
    const dropZone = document.getElementById('content-frame');
    dropZone.addEventListener('dragenter', (event)=>{
      this.dragEnter(event);
    }, false);
    
    dropZone.addEventListener('dragover', (event)=>{
        this.dragOver(event);
    }, false);

    dropZone.addEventListener('drop', (event)=>{
      this.drop(event);
    }, false);

  }
  dragEnter(event){
    this.parent = event.target;
    while(this.parent!==null){
      
      if(this.parent.classList.length>0 && this.isClassPresent()){
        const type = this.componentMapper[this.parentCls];
        const isDropable = this.isDropable(type);
        
        const offset = this.parent.getBoundingClientRect();
        const size = {height: `${offset.height}px`, width: `${offset.width}px`};
        const pos = {top:`${offset.top}px`, left: `${offset.left}px`};
        
        if(isDropable){
          this.componentMask.createValidDropZone(pos, size);
        } else {
          this.componentMask.createInvalidDropZone(pos, size);
        }
        break;
      }
      this.parent = this.parent.parentElement;
    }
  }
  isClassPresent(){
    const cls = [];
    for(let i=0; i< this.parent.classList.length; i++){
      if(this.droppableCls.includes(this.parent.classList[i])){
        // this.parentCls = this.parent.classList[i];
        //debugger;
        cls.push(this.parent.classList[i]);
        // return true;
      }
    }
    if((cls.length > 0)) {
      this.parentCls = cls[0];
      return true;
    }
    // if(cls.length > 1){
    //   this.parentCls = cls[1];
    //   return true;
    // }
    // else if(cls.length === 1){
    //   this.parentCls = cls[0];
    //   return true;
    // }
    return false;
  }
  
  isDropable(type){
    const targets = this.componentTargets;
    if(targets[type]){
      const primatyCollectionBaseType = targets[type].primatyCollectionBaseType;
      for(let i=0;i<primatyCollectionBaseType.length;i++){
        if(targets[DataShareService.dataTobeTrasferd.xtype].extensionHierarchy.includes(primatyCollectionBaseType[i])){
          return true;
        }
      }
    }
    return false;
  }
  getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      bottom: rect.bottom,
    };
  } 
  
  drop(event){
    if(this.componentMask){
      this.componentMask.hide();
    }
    const type = this.componentMapper[this.parentCls];
    const isDropable = this.isDropable(type);
    if(isDropable){
      const location = this.locateComponent('drop');
      vscode.postMessage({command: 'updateCode',location:location, payload: DataShareService.dataTobeTrasferd});
    }
  }

  locateComponent(action) {
    let parent = this.parent;
    const lc = [];

    while(parent!==null){
      const cssClass = parent.classList.length>0 && this.isComponentClassPresent(parent.classList);
      if(cssClass){
        const type = this.componentMapper[cssClass];
        if(parent.parentElement){
          const xtypeMapper = {
            xtype: type,
            index : Array.prototype.indexOf.call(parent.parentElement.children,parent)
          };
          lc.push(xtypeMapper);
        }
      }
      parent = parent.parentElement;
    }
    lc.reverse();

    if(action === 'drop'){
      const dropType = {
        xtype: DataShareService.dataTobeTrasferd.xtype,
        newItem:true,
      };
      lc.push(dropType);
    }
    return this.createCompnentHirarchy(lc);
  }
  createCompnentHirarchy(lc){
    let ch = [];
    for(let i=0;i<lc.length;i++){
      ch.push({
        index: lc[i].index
      });
      if(lc[i+1]){
        const extendsHirarchy =  this.componentTargets[lc[i+1].xtype].extensionHierarchy;
        const primaryCollection = this.componentTargets[lc[i].xtype].primaryCollection
        for(let j=0;j<primaryCollection.length;j++){
          if(extendsHirarchy.includes(primaryCollection[j].baseType)){
            ch.push({
              propertyName: primaryCollection[j].name,
              dataType: primaryCollection[j].type
            });
            break;
          }
        }
      }
    }
    return ch;
  }

  isComponentClassPresent(classList){
    const cls = [];
    for(let i=0; i< classList.length;i++){
      if(this.droppableCls.includes(classList[i])){
        cls.push(classList[i]);
        //return classList[i];
      }
    }

    if(cls.length > 1){
      return cls[1];
    }
    else if(cls.length === 1){
      return cls[0];
    }
  }

  dragOver(event){
    event.preventDefault();
  }
}
