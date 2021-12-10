export class CategorySelection {
    constructor(ast) {
       this.categotyEl = document.getElementById('mainCategorySec');
       this.subCategotyEl = document.getElementById('subCategory'); 
       this.ast = ast;
       this.astValueMapper = {};
       this.createAstValueMapper();
       const list = JSON.parse(window.localStorage.getItem("componentList"));
       this.createListView(list);
       this.loadDroptarget();
       this.subscribeTomessage();
       this.addListeners();
       this.droppableCls = [
        'x-grid',
        'x-gridcolumn'
      ];
    }
    createAstValueMapper(){
      const astObjMapper = this.ast.body[0].expression.arguments[1].properties;
      for(let i=0;i<astObjMapper.length;i++){
        this.astValueMapper[astObjMapper[i].key.name] = astObjMapper[i].value.value;
      }
    }
    addListeners(){
      document.getElementById('show-code').addEventListener('click',()=>{
        vscode.postMessage({command: 'showCode'});
      });

      document.getElementById('content-frame').addEventListener('click',(event)=>{
        this.contentFrameClick(event);
      },false);
    }
    contentFrameClick(event){ 
      event.stopImmediatePropagation();

      if(this.parent) {
        this.parent.classList.remove('drag-over-allowed');
        this.parent.classList.remove('drag-over-notallowed');
      }
      this.parent = event.target;
      while(this.parent!==null){
        if(this.parent.classList.length>0 && this.isClassPresent()){
          const type = this.parentCls.split('-');
          if(type.length > 1 && type[1]) {
            this.parent.classList.add('drag-over-allowed');
            vscode.postMessage({command: 'showConfig', payload: {'type':type[1]}});
            event.preventDefault();
          }
          break;
        }
        this.parent = this.parent.parentElement;
      }
    }
    subscribeTomessage() {
        window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
          case 'loadConfig': {
            this.createConfigList(JSON.parse(message.payload));
            break;
          }
          case 'reloadView':{
            this.updateConfigValues(message);
          }
        }
      });
    }
    updateConfigValues(data){
      this.ast = data.ast;
      this.createAstValueMapper();
      const tableRows = document.querySelectorAll('#config-section table tr');
      if(!tableRows || tableRows.length == 0){
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
    createConfigList(configs) {
      this.currentConfig = configs;
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
          helpIcon.addEventListener('mouseenter',(event)=>{
            event.stopPropagation();
            this.createOverLay(event,componentConfig[i])
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
        inputEl.addEventListener('keypress',(event)=>{
          if (event.key === 'Enter') {
            const obj = {
              type:'string',
              name:config.name,
              defaultConfig:event.target.value
            };
            vscode.postMessage({command: 'updateCode', payload: obj});
         } 
        });
      }
      else if(config.type ==='Boolean') {
        inputEl.addEventListener('change',(event)=>{
            const obj = {
              type:'string',
              name:config.name,
              defaultConfig:event.target.checked
            };
            vscode.postMessage({command: 'updateCode', payload: obj});
        });
      }

      inputEl.style.width = '90%';
  }
  addFilterEvents(filrerEl){
    filrerEl.addEventListener('keyup',(event)=>{
      var search = event.target.value.toLowerCase();
      var all = document.querySelectorAll("#config-section table tr");
      for (let i=0;i<all.length;i++) {
          let item = all[i].children[0].innerText.toLowerCase();
          if (item.indexOf(search) == -1) { 
            all[i].classList.add("hide"); 
          }
          else {  all[i].classList.remove("hide"); }
      }
    });
  }
  createOverLay(event, config){
    if(!config.description){
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
    if(el){
      el.remove();
    }
  }
  createListView(){
      const d = JSON.parse(window.localStorage.getItem('componentList'));
      const unOrderedList = document.createElement('ul');
      unOrderedList.classList.add("component-list");
      for(let i=0; i< d.length; i++) {
        const list = document.createElement('li');
        list.textContent = `${d[i].text}(${d[i].compoentChild.length})`;
        list.onclick = () => {
          this.createCategorySubSction(d[i].compoentChild);
        }
        unOrderedList.appendChild(list);
      }
      this.categotyEl.appendChild(unOrderedList);
    }
    createCategorySubSction(d) {
      if(d){
      this.removeAllChildren(); 
      const unOrderedList = document.createElement('ul');
      unOrderedList.classList.add("component-list");
      for(let i=0; i< d.length; i++) {
        const list = document.createElement('li');
        list.textContent = d[i].text;
        
        list.draggable="true";
        list.addEventListener('dragstart',(event)=>{
            event.dataTransfer.effectAllowed = "copyMove";
            this.dataTobeTrasferd = d[i];
        }); 
        unOrderedList.appendChild(list);
      }
      this.subCategotyEl.appendChild(unOrderedList);
    }
  }
  removeAllChildren(){
    if(this.subCategotyEl.hasChildNodes()){
      while (this.subCategotyEl.firstChild) {
        this.subCategotyEl.removeChild(this.subCategotyEl.firstChild);
      }
    }
  }
  loadDroptarget(){
    const dropZone = document.getElementById('content-frame');
    dropZone.addEventListener('dragenter', (event)=>{
      this.dragEnter(event);
    },false);
    dropZone.addEventListener('dragover', (event)=>{
        this.dragOver(event);
    },false);
    dropZone.addEventListener('dragleave', (event)=>{
      this.dragLeave(event);
    },false);
    dropZone.addEventListener('drop', (event)=>{
      this.drop(event);
    },false);
  }
  dragEnter(event){
    if(this.parent) {
      this.parent.classList.remove('drag-over-allowed');
      this.parent.classList.remove('drag-over-notallowed');
    }
    this.parent = event.target;
    while(this.parent!==null){
      if(this.parent.classList.contains('x-dataview-body-el')){
        this.parentCls = 'x-dataview-body-el';
        this.parent.classList.add('drag-over-notallowed');
        event.dataTransfer.dropEffect = "copy";
        break;
      }
      
      if(this.parent.classList.length>0 && this.isClassPresent()){
        const type = this.parentCls.split('-');
        const isDropable = this.isDropable(type[1]);
        if(isDropable){
          this.parent.classList.add('drag-over-allowed');
          event.dataTransfer.dropEffect = "copy";
        } else {
          this.parent.classList.add('drag-over-notallowed');
        }
        break;
      }
      this.parent = this.parent.parentElement;
    }
  }
  isClassPresent(){
    for(let i=0; i< this.parent.classList.length; i++){
      if(this.droppableCls.includes(this.parent.classList[i])){
        this.parentCls = this.parent.classList[i];
        return true;
      }
    }
    return false;
  }
  
  isDropable(type){
    const targets = JSON.parse(window.localStorage.getItem('componentTargets'));
    if(targets[type]){
      const primatyCollectionBaseType = targets[type].primatyCollectionBaseType;
      for(let i=0;i<primatyCollectionBaseType.length;i++){
        if(this.dataTobeTrasferd.extendsHirarchy.includes(primatyCollectionBaseType[i])){
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
  dragLeave(event){
    // if(this.parent.classList.contains('drag-over-notallowed')){
    //   this.parent.classList.remove('drag-over-allowed');
    // }
    // else {
    //   this.parent.classList.remove('drag-over-notallowed');
    // }
    // this.parent.classList.remove('drag-over-notallowed');
    // this.parent.classList.remove('drag-over-allowed');
    // if(this.targetFound && this.parent){
    //   //this.parent.classList.remove('drag-over');
    //   this.targetFound = false;
    // }
    // var parent = event.target;
    // debugger;
    // while(parent!==null){
    //   debugger;
    //   if(parent.classList.contains('drag-over')){
    //     parent.classList.remove('drag-over');
    //     break;
    //   }
    //   parent = parent.parentElement;
    // }
  }
  drop(event){
    this.parent.classList.remove('drag-over-allowed');
    this.parent.classList.remove('drag-over-notallowed');
    const type = this.parentCls.split('-');
    const isDropable = this.isDropable(type[1]);
    if(isDropable){
      vscode.postMessage({command: 'updateCode', payload: this.dataTobeTrasferd});
    }
    // for (let type of event.dataTransfer.types) {
    //   console.log(event.dataTransfer.getData(type));
    // }
    // event.preventDefault();
    // event.preventDefault();
    // for (let type of event.dataTransfer.types) {
    //   console.log(event.dataTransfer.getData(type));
    // }
  }
  dragOver(event){
    event.preventDefault();
    // console.log(event.target);
    // if(event.currentTarget.classList.contains('x-panel')){
    //   debugger;
    // }
    // event.preventDefault();
    // for (let type of event.dataTransfer.types) {
    //   console.log(event.dataTransfer.getData(type));
    // }
    // event.preventDefault();
    // const data = event.dataTransfer.getData("text");
    // //debugger;
    // console.log(event.dataTransfer.types);
    // // Accept the drag-drop transfer.
    // event.preventDefault();
  }
}
