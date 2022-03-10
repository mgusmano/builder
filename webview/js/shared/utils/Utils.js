export class Utils {
    static removeChildren(domEl){
        if(domEl && domEl.hasChildNodes()){
            while (domEl.firstChild) {
                domEl.removeChild(domEl.firstChild);
              }
        }
    }
    static getOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          bottom: rect.bottom,
        };
    }
}