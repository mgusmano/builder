export function gridTemplate(code: any){
   return  `
   Ext.onReady(function(){
        var grid = ${code}

        var cmp = Ext.create(grid, {
            height: '90%',
            width: '90%',
            renderTo: 'content-frame'
        });
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
              case 'reloadView': {
                cmp.destroy();
                grid = eval(message.code);
                cmp = Ext.create(grid, {
                    height: '90%',
                    width: '90%',
                    renderTo: 'content-frame'
                });
              }
            }
          });
   });  
    `
}


// Ext.create('Ext.data.Store', {
//     storeId: 'simpsonsStore',
//     fields:[ 'name', 'email', 'phone'],
//     data: [
//         { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
//         { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
//         { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244' },
//         { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
//     ]
// });

// Ext.create('Ext.grid.Grid', {
//     title: 'Simpsons',
//     store: Ext.data.StoreManager.lookup('simpsonsStore'),
//     columns: [
//         { text: 'Name', dataIndex: 'name' },
//         { text: 'Email', dataIndex: 'email', flex: 1 },
//         { text: 'Phone', dataIndex: 'phone' }
//     ],
//     height: '90%',
//     width: '90%',
//     renderTo: 'content-frame'
// });