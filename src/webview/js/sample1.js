 // function onDomContentLoaded() {
        //   let d = JSON.parse('${componentList}')
        //   const listContainer = document.getElementById('component-section');
        //   const unOrderedList = document.createElement('ul');
        //   unOrderedList.classList.add("component-list");
        //   for(let i=0; i< d.length; i++) {
        //     const list = document.createElement('li');
        //     list.textContent = d[i].text;
        //     list.onclick = () => {
        //       onListItemClicked(d[i]);
        //     }
        //     unOrderedList.appendChild(list);
        //   }
        //   listContainer.appendChild(unOrderedList);
        // }

        // window.addEventListener('message', event => {
        //   console.log('we have a new message from the extension',event)
        //   const message = event.data;
        //   switch (message.type) {
        //     case 'loadConfig':
        //       setConfigs(JSON.parse(message.payload))
        //       break;
        //   }
        // });