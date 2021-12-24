const componentMapperClassic = {
    'x-grid':'grid',
    'x-column-header':'gridcolumn',
    'x-grid-view': 'gridview',
    'x-grid-paging-toolbar':'pagingtoolbar',
    'x-panel':'panel',
    'x-form-type-text':'textfield',
    'x-btn':'button',
    'x-form-field-date':'datefield'
};

const componentMapperModern = {
    'x-grid':'grid',
    'x-gridcolumn':'gridcolumn',
    'x-panel':'panel',
    'x-textfield':'textfield',
    'x-button':'button',
    'x-numberfield':'numberfield',
    'x-displayfield':'displayfield',
    'x-radiofield':'radiofield',
    'x-checkboxfield':'checkboxfield',
    'x-textareafield':'textareafield',
    'x-datepickerfield': 'datepickerfield',
    'x-passwordfield':'passwordfield',
    "x-formpanel": 'formpanel',
    "x-container":'container'
};

const getExtjsComponentMapper = (type = 'classic')=>{
    if(type === 'modern') {
        return componentMapperModern;
    }
    return componentMapperClassic;
};

export default getExtjsComponentMapper;

