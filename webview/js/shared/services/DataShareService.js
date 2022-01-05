class DataShareService {
    dt='';
    set dataTobeTrasferd(d){
        this.dt = d;
    }
    get dataTobeTrasferd(){
        return this.dt;
    }
}
const instance = new DataShareService();
export default instance;