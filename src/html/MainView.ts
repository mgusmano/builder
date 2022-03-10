export function getMainViewHtml(){
    const str = 
     `<div class="main-view">
        <div id="component-section">
            <div class="cmp-category">
                <div id="mainCategorySec"></div>
                <div id="subCategory">
                </div>
            </div>
            <div id="config-section">
                <div class="filter-section">
                    <vscode-text-field id="filter-field" placeholder="Search Configs" style="width:100%;display:none;position:sticky"></vscode-text-field>
                </div>
                <div class="config-table-section">
                    <table></table>
                    <div id="events-list"></div>
                </div>
            </div>
        </div>
        <div id="content-frame">
            <vscode-button id="show-code" style="float: right;margin: 2px 89px;">Show code</vscode-button>
        </div>
       </div>`;
       return str;
}