Ext.define('KitchenSink.view.templates.ResetPasswordController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.reset-password',

  onResetPassword: function() {
      var me = this,
          errorCmp = me.lookup('formResetPasswordFailure'),
          form = me.lookup('formResetPassword'),
          errors = [],
          data = {
              errors: errors
          };

      if (form.validate()) {
          Ext.Msg.alert('Password Reset Successful', 'You have successfully changed the password!');
      }
      else {
          Ext.Msg.alert('Failure', 'Please check your email id and retry.');

          form.getFields(false).forEach(function(field) {
              var error;

              if (!field.validate() && (error = field.getError())) {
                  errors.push({
                      errors: error,
                      name: field.getLabel()
                  });
              }
          });
      }

      if (errorCmp) {
          errorCmp.setData(data);
      }
  }
});

/**
 * Demonstrates a responsive reset password form.
 */
Ext.define('KitchenSink.view.templates.ResetPassword', {
  extend: 'Ext.Container',
  xtype: 'template-reset-password',
  controller: 'reset-password',

  autoSize: true,
  profiles: {
      defaults: {
          width: 340,
          height: 504
      },
      phone: {
          defaults: {
              // reset the properties for phone
              height: undefined,
              margin: undefined,
              padding: undefined,
              shadow: undefined,
              width: undefined
          }
      }
  },
  width: 340,
  height: 504,
  layout: {
      type: 'vbox',
      pack: (Ext.platformTags.phone && window.orientation === 0) ? 'center' : undefined,
      align: 'middle'
  },
  scrollable: 'y',
  // setting the background of the container
  style: 'background-color: var(--base-color)',
  otherContent: [
      {
          type: 'Controller',
          path: 'modern/src/view/templates/ResetPasswordController.js'
      }
  ],

  items: [
      {
          xtype: 'formpanel',
          width: 340,
          height: 474,
          reference: 'formResetPassword',
          layout: {
              type: 'vbox',
              align: 'middle'
          },
          bodyPadding: 30,
          items: [
              {
                  xtype: 'image',
                  height: 90,
                  width: 280,
                  alt: 'sencha-logo-image',
                  src: 'resources/images/SenchaLogoLg.svg'
              },
              {
                  xtype: 'component',
                  width: 280,
                  html: 'Forgot Your Password?',
                  style: {
                      'font-size': '24px',
                      'text-align': 'center',
                      'margin': 'auto'
                  }
              },
              {
                  xtype: 'component',
                  width: 280,
                  html: 'Enter your email address and we\'ll' + '<br>' + 'send you a new password',
                  style: {
                      'font-size': '16px',
                      'text-align': 'center',
                      'line-height': '1.75',
                      'letter-spacing': '0.5px',
                      'margin': 'auto'
                  }
              },
              {
                  xtype: 'component',
                  reference: 'formResetPasswordFailure',
                  tpl: '<tpl if="errors.length">' +
                      '<span class="x-fa fa-exclamation-circle" style="color: red;">' +
                      ' EMAIL DOES NOT EXIST</span>' +
                      '</tpl>',
                  height: 26,
                  width: 280,
                  style: {
                      'font-size': '20px',
                      'text-align': 'center',
                      'letter-spacing': '0.25px',
                      'font-weight': '500',
                      'margin': 'auto'
                  }
              },
              {
                  xtype: 'textfield',
                  allowBlank: false,
                  required: true,
                  width: 280,
                  label: 'Email Address',
                  errorTarget: 'qtip',
                  name: 'user',
                  placeholder: 'Email Address',
                  stye: {
                      'margin': 'auto'
                  },
                  responsiveConfig: {
                      'desktop': {
                          errorTarget: 'side'
                      }
                  }
              },
              {
                  xtype: 'button',
                  text: 'LOG IN',
                  autoSize: true,
                  width: 280,
                  ui: 'action',
                  handler: 'onResetPassword',
                  style: {
                      'text-align': 'center',
                      'letter-spacing': '1.25px',
                      'font-size': '14px',
                      'margin': 'auto'
                  }
              },
              {
                  xtype: 'component',
                  height: 30,
                  width: 280,
                  style: {
                      'font-size': '14px',
                      'text-align': 'center',
                      'letter-spacing': '1.09px'
                  },
                  html: "<a style='color: var(--base-color);text-decoration: none;' href='#'>CANCEL</a>"
              }
          ]
      },
      {
          xtype: 'component',
          margin: '4 0 0 0',
          width: 280,
          style: {
              'font-size': '16px',
              'text-align': 'center',
              'color': 'var(--base-foreground-color)',
              'letter-spacing': '1.25px'
          },
          html: 'Don’t have an account?' +
              "<a style='font-weight:bold;color:var(--base-foreground-color);text-decoration: none;' href='#template-create-account'> Sign-Up</a>",
          responsiveConfig: {
              'phone': {
                  margin: '13 0 0 0'
              }
          }
      }
  ]
});