export class CategorySelection {
    constructor(list) {
       this.categotyEl = document.getElementById('mainCategorySec');
       this.subCategotyEl = document.getElementById('subCategory'); 
       this.createListView(list);
       this.loadDroptarget();
       this.subscribeTomessage();

    }
    subscribeTomessage() {
        window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
          case 'loadConfig': {
            this.createConfigList(JSON.parse(message.payload))
          }
        }
      });
    }
    createConfigList(configs) {
      const configSection = document.querySelector('#config-section table');
      if(configSection.hasChildNodes()){
          while (configSection.firstChild) {
            configSection.removeChild(configSection.firstChild);
          }
        }
        const componentConfig = configs.configs; 
        for(let i=0;i < componentConfig.length;i++){
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
      inputEl.style.width = '90%';
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
    createListView(){
      const d = JSON.parse(window.localStorage.getItem('componentList'));
      debugger;
      //window.localStorage.setItem('componentTargets',${componentTargets}),
        const unOrderedList = document.createElement('ul');
        unOrderedList.classList.add("component-list");
        for(let i=0; i< d.length; i++) {
          const list = document.createElement('li');
          list.textContent = d[i].text;
          list.onclick = () => {
            this.createCategorySubSction(d[i].compoentChild);
            vscode.postMessage({command: 'showConfig', payload: d[i]})
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
      dropZone.addEventListener('drop', this.drop);
      // var iframe = document.getElementById('extFrame');
      // var contentWindow = iframe.contentWindow;
      // iframe.onload = ()=> {
      //   const allItems = contentWindow.document;
      //   debugger;
      // };
      // var dropContainer = document.getElementById('content-frame');
      // const children = dropContainer.querySelectorAll('*');
      // for(let i=0;i<children.length;i++) {
        // children[i].addEventListener('dragenter', this.dragEnter);
        // //children[i].addEventListener('dragover', dragOver);
        // children[i].addEventListener('dragleave', this.dragLeave);
        // children[i].addEventListener('drop', this.drop);
      // }
    }
  dragEnter(event){
    this.parent = event.target;
    while(this.parent!==null){
      if(this.parent.classList.contains('x-grid')){
        this.parent.classList.add('drag-over');
        this.targetFound = true;
        //event.target = this.parent;
        break;
      }
      this.parent = this.parent.parentElement;
    }
    event.preventDefault();
  }
  dragLeave(event){
   
    if(this.targetFound){
      this.parent.classList.remove('drag-over');
      this.targetFound = false;
    }
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