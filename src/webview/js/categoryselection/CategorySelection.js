import getExtjsComponentMapper from '../constants/ComponentList.js';
export class CategorySelection {
    constructor(ast) {
       this.categotyEl = document.getElementById('mainCategorySec');
       this.subCategotyEl = document.getElementById('subCategory'); 
       this.ast = ast;
       this.astValueMapper = {};
       //this.createAstValueMapper();
       this.list = JSON.parse(window.localStorage.getItem("componentList"));
       this.componentTargets = JSON.parse(window.localStorage.getItem('componentTargets'));
       this.createListView(this.list);
       this.loadDroptarget();
       this.subscribeTomessage();
       this.addListeners();
       this.setClassicOrModern();
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

      window.addEventListener('resize', ()=>{
        if(this.dropOverlay){
          this.dropOverlay.remove();
        }
      });
      // document.body.addEventListener('click',()=>{
      //   debugger;
      //   if(this.dropOverlay){
      //     this.dropOverlay.remove();
      //   }
      // });
    }
    contentFrameClick(event){ 
      event.stopImmediatePropagation();
      this.parent = event.target;
      while(this.parent!==null){
        if(this.parent.classList.length>0 && this.isClassPresent()){
          const type = this.componentMapper[this.parentCls];
          if(type) {
            this.createDropOverlay(false,true);
            const lc = this.locateComponent();
            vscode.postMessage({command: 'showConfig',location:lc, payload: {type}});
            event.preventDefault();
          }
          break;
        }
        this.parent = this.parent.parentElement;
      }
    }
    createDropOverlay(allow, borderOnly){
      if(this.dropOverlay){
        this.dropOverlay.remove();
      }
      this.dropOverlay = document.createElement("div");
      const dropOverlay = this.dropOverlay;
      dropOverlay.classList.add('dropOverlay');
      const offset = this.parent.getBoundingClientRect();
      dropOverlay.style.top = `${offset.top}px`;
      dropOverlay.style.left = `${offset.left}px`;
      dropOverlay.style.width = `${offset.width}px`;
      dropOverlay.style.height = `${offset.height}px`;
      if(!borderOnly){
        const colorToapply = allow?"green":"red";
        dropOverlay.style.backgroundColor = colorToapply;
        dropOverlay.style.border = `2px solid ${colorToapply}`;
      }
      else {
        dropOverlay.style.border = "2px solid blue";
        dropOverlay.style.opacity = "inherit";
      }
      document.body.append(dropOverlay);
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
      //this.createAstValueMapper(ast.properties);
      this.astValueMapper = ast;
      const configSection = document.querySelector('#config-section table');
      const filterEl = document.getElementById("filter-field");
      filterEl.style.display = '';
      this.addFilterEvents(filterEl);
      if(configSection.hasChildNodes()){
          while (configSection.firstChild) {
            configSection.removeChild(configSection.firstChild);
          }
        }
        const componentConfig = configs.configs; 
        for(let i=0;i < componentConfig.length;i++){
          const tr = document.createElement('tr');
          const td1 = document.createElement("td");
          td1.classList.add('config-label');
          const divTag = document. createElement("div");
          divTag.textContent = componentConfig[i].name;
          td1.appendChild(divTag);
          const helpIcon = document. createElement("div");
          helpIcon.classList.add('help-icon');
          helpIcon.addEventListener('mouseenter',(event) => {
            event.stopPropagation();
            this.createOverLay(event,componentConfig[i]);
          });

          helpIcon.addEventListener('mouseleave',()=>{
            this.removeOverlay()
          });
          td1.appendChild(helpIcon);
          //td1.textContent = componentConfig[i].name;
          tr.appendChild(td1);
          const td2 = document.createElement("td");
          this.createFields(td2, componentConfig[i]);
          tr.appendChild(td2);
          configSection.appendChild(tr);
        } 
  }
  createFields(td2, config){
      let inputEl;
      let typeValue = '';

      switch(config.type){
        case 'String/Object':
        case 'String':
          inputEl = document.createElement('vscode-text-field');
          inputEl.value = this.astValueMapper[config.name]||config.defaultValue || '';
          td2.appendChild(inputEl);
          break;
        case 'Boolean':
          inputEl = document.createElement('vscode-checkbox');
          inputEl.checked = this.astValueMapper[config.name]||config.defaultValue
          td2.appendChild(inputEl);
          break;
        case 'Number':
          inputEl = document.createElement('vscode-text-field');
          inputEl.type = 'number';
          inputEl.value = this.astValueMapper[config.name]||config.defaultValue || '';
          td2.appendChild(inputEl);
          break;
        default:
          inputEl = document.createElement('vscode-text-field');
          inputEl.value = this.astValueMapper[config.name]||config.defaultValue || '';
          td2.appendChild(inputEl);
          break;
      }
      if(config.type !=='Boolean') {
        inputEl.addEventListener('focus',(event)=>{
          event.stopImmediatePropagation();
        });

        inputEl.addEventListener('keypress',(event)=>{
          event.stopPropagation();
          if (event.key === 'Enter') {
            let value;
            try {
              value = eval(event.target.value);
            }
            catch(error){
              value = event.target.value;
            }
            const obj = {
              type:'string',
              name:config.name,
              defaultConfig:value
            };
            vscode.postMessage({command: 'updateConfigs', payload: obj});
         } 
        });
      }
      else if(config.type ==='Boolean') {
        inputEl.addEventListener('change',(event)=>{
          event.stopPropagation();
            const obj = {
              type:'string',
              name:config.name,
              defaultConfig:event.target.checked
            };
            vscode.postMessage({command: 'updateConfigs', payload: obj});
        });
      }

      inputEl.style.width = '90%';
  }
  addFilterEvents(filrerEl){

    filrerEl.addEventListener('keyup',(event)=>{
      var search = event.target.value.toLowerCase(),
          all = document.querySelectorAll("#config-section table tr");
  
      for (let i=0;i<all.length;i++) {
          let item = all[i].children[0].innerText.toLowerCase();
          if (item.indexOf(search) === -1) { 
            all[i].classList.add("hide"); 
          }
          else {  all[i].classList.remove("hide"); }
      }
    });
  }
  createOverLay(event, config){
    if (!config.description){
      return;
    }
    const overlay = document.createElement("div");
    overlay.id = "configDescription";
    overlay.innerText = config.description;
    overlay.classList.add('overlay');
    const offset = this.getOffset(event.target);
    overlay.style.top = `${offset.top+20}px`;
    overlay.style.left = `${offset.left+30}px`;
    document.body.appendChild(overlay);
  }
  removeOverlay(){
    const el = document.getElementById('configDescription');
    if (el){
      el.remove();
    }
  }
  createListView(list){
      const d = list;
      const unOrderedList = document.createElement('ul');
      unOrderedList.classList.add("component-list");
      for (let i=0; i< d.length; i++) {
        const list = document.createElement('li');
        list.textContent = `${d[i].text}(${d[i].compoentChild.length})`;
        list.onclick = () => {
          this.createCategorySubSction(d[i].compoentChild);
        };
        unOrderedList.appendChild(list);
      }
      this.categotyEl.appendChild(unOrderedList);
    }
    createCategorySubSction(subList) {
      if(subList){
      const groupedItems = this.getGroupedItems(subList);  
      this.removeAllChildren(); 
      // const sectionContainer = document.createElement("div");
      const unOrderedList = document.createElement('ul');
      unOrderedList.classList.add("component-list");
      for(let i=0; i< subList.length; i++) {
        const list = document.createElement('li');
        list.textContent = subList[i].text;
        
        list.draggable="true";
        list.addEventListener('dragstart',(event)=>{
            event.dataTransfer.effectAllowed = "copyMove";
            this.dataTobeTrasferd = subList[i];
        }); 
        unOrderedList.appendChild(list);
      }
      this.subCategotyEl.appendChild(unOrderedList);
    }
  }
  removeAllChildren(){
    if (this.subCategotyEl.hasChildNodes()){
      while (this.subCategotyEl.firstChild) {
        this.subCategotyEl.removeChild(this.subCategotyEl.firstChild);
      }
    }
  }
  getGroupedItems(list){
    const groupedItems = {};
    for(let i=0;i<list.length;i++){
      if(!groupedItems[list[i].groupField]){
        groupedItems[list[i].groupField] = [list[i]];
      }
      else{
        groupedItems[list[i].groupField].push(list[i]);
      }
    }
    return groupedItems;
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
        if(isDropable){
          this.createDropOverlay(true);
        } else {
          this.createDropOverlay(false);
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
        if(targets[this.dataTobeTrasferd.xtype].extensionHierarchy.includes(primatyCollectionBaseType[i])){
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
    if(this.dropOverlay){
      this.dropOverlay.remove();
    }
    const type = this.componentMapper[this.parentCls];
    const isDropable = this.isDropable(type);
    if(isDropable){
      const location = this.locateComponent('drop');
      vscode.postMessage({command: 'updateCode',location:location, payload: this.dataTobeTrasferd});
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
        xtype: this.dataTobeTrasferd.xtype,
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
