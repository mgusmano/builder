class MessageService {
    constructor() {
        this.listenMessageEvent();
        this.subscriptions = {};
    }
    subscribe(id,fn){
       this.subscriptions[id] = fn;
    }
    unsubscribe(id){
       if(this.subscriptions[id]) {
           delete this.subscriptions[id];
           return true;
       }
       return false; 
    }
    listenMessageEvent() {
        window.addEventListener('message', event => {
            if(this.subscriptions[message.type]) {
                this.subscriptions[message.type](event);
            }
        });
    }
}

const messageService = new MessageService();
Object.freeze(messageService);
export default messageService;