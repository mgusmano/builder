export class SenchaCmdPanelHTML {

  public static getImage(sencha: any) {
    return `
    {
      xtype: 'image',
      height: 90,
      alt: 'sencha-logo-image',
      src: '${sencha}'
    },
    {
      xtype: 'component',
      html: 'Create a New Application',
      style: {
        'font-size': '24px',
        'text-align': 'center',
        'margin': 'auto'
      }
    },
    {
      xtype: 'component',
      html: '<br/>Use this form to create a new Sencha Ext JS Application<br/><br/>',
      style: {
        'font-size': '18px',
        'text-align': 'center',
        'margin': 'auto'
      }
    },
`;
  }

  public static getRadio() {
    return `
  {
    xtype: 'fieldset',
    label: 'Fav',
    reference: 'fieldset2',
    //title: 'Favorite color',
    width: 280,
    platformConfig: {
        '!desktop': {
            defaults: {
                bodyAlign: 'end'
            }
        }
    },
    defaults: {
        xtype: 'radiofield',
        xlabelWidth: '35%'
    },
    items: [
      {
        name: 'toolkit',
        value: 'modern',
        label: 'modern'
    },
    {
        name: 'toolkit',
        label: 'classic',
        value: 'classic'
    }

  ]
  },
  `;
  }

}




// {
//   xtype: 'combobox',
//   label: 'Toolkit',
//   name: 'toolkit',
//   valueField: 'name',
//   displayField: 'name',
//   forceSelection: true,
//   queryMode: 'local',
//   clearable: true,
//   placeholder: 'Select a toolkit...',
//   store: {
//       data: [
//         {name: 'modern'},
//         {name: 'classic'},
//       ]
//   }
// },

// {
//   xtype: 'combobox',
//   label: 'Theme',
//   name: 'theme',
//   valueField: 'name',
//   displayField: 'name',
//   forceSelection: true,
//   queryMode: 'local',
//   clearable: true,
//   placeholder: 'Select a theme...',
//   store: {
//       data: [
//         {name: 'material'},
//         {name: 'ios'},
//         {name: 'triton'},
//       ]
//   }
// },

//   {
//     xtype: 'textfield',
//     allowBlank: false,
//     required: false,
//     label: 'Base Path',
//     value:'${os.homedir()}',
//     readOnly: true,
//     name: 'basepath',
//     placeholder: 'Base Path',
//     errorTarget: 'qtip',
//     width: 280,
//     style: {'margin': 'auto'}
//   },

//   {
//     xtype: 'textfield',
//     id: 'appname',
//     allowBlank: false,
//     required: true,
//     label: 'App Name',
//     value:'myapp',
//     readOnly: false,
//     name: 'appname',
//     placeholder: 'App Name',
//     errorTarget: 'qtip',
//     width: 280,
//     style: {'margin': 'auto'}
//   },

//   ${SenchaCmdPanelHTML.getRadio()}

//   {xtype:'button',xflex:1, text:'Create the Application',handler:clickFunction}