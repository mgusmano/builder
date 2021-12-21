export function gridTemplate(code: any){
   return  `
   Ext.onReady(function(){
        var componetCode = ${code};
        var page;
        function createComponent(renderComponent){
          if(page){
            page.destroy()
          }
          page = Ext.create(renderComponent, {
            height: '90%',
            width: '90%',
            renderTo: 'content-frame'
          });
        }
        
        createComponent(componetCode);

        const onMessageCallback = function(event){
          const message = event.data;
            switch (message.type) {
              case 'reloadView': {
                code = eval(message.code);
                createComponent(code)
              }
            }
        }
        window.addEventListener('message',onMessageCallback);
   });  
    `
}