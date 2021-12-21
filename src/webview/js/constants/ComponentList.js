const componentMapperClassic = {
    'x-grid':'grid',
    'x-column-header':'gridcolumn',
    'x-grid-view': 'gridview',
    'x-grid-paging-toolbar':'pagingtoolbar',
    'x-panel':'panel',
    'x-form-type-text':'textfield',
    'x-btn':'button'
};

const componentMapperModern = {
    'x-grid':'grid',
    'x-gridcolumn':'gridcolumn',
    'x-panel':'panel',
    'x-textfield':'textfield',
    'x-btn':'button'
};

const getExtjsComponentMapper = (type = 'classic')=>{
    if(type === 'modern') {
        return componentMapperModern;
    }
    return componentMapperClassic;
};

export default getExtjsComponentMapper;

