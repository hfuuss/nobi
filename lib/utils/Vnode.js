
export default class Vnode {
  constructor(type, props, key, ref){
     this.type = type;
     this.props = props;
     this.key = key;
     this.ref = ref;
  }
}