export function getMainViewHtml(){
    const str = 
     `<div class="main-view">
        <div id="component-section">
            <div class="cmp-category">
                <div id="mainCategorySec"></div>
                <div id="subCategory"></div>
            </div>
            <div id="config-section">
            <table></table></div>
        </div>
        <div id="content-frame">
            <button id="show-code">Show code</button>
        </div>
       </div>`;
       return str;
}