import Vnode from './Vnode'
import {renderComponent} from './NobiDOM'

function isClass(func) {
  return typeof func === 'function' && /^class/.test(Function.prototype.toString.call(func))
}

class Component {
  constructor( props = {} ) {
      this.state = {};
      this.props = props;
  }

  setState( stateChange ) {
    // 将修改合并到state
    Object.assign( this.state, stateChange );
    renderComponent( this );
  }
}


// 返回Vnonde
function createElement( type, attrs, ...children ) {

  let props = {},
        key = null,
        ref = null;

  if (attrs != null) {
    //巧妙的将key转化为字符串或者null
    key = attrs.key === undefined ? null : '' + attrs.key;
    //元素的ref可能是
    ref = attrs.ref === undefined ? null : attrs.ref;

    /**这一步就是将attrs属性放进props里 */
    for (let propName in attrs) {
        // 除去一些不需要的属性,key,ref等
        //注意，我们的props里不要出现key,ref这些蛋疼的东西
        //在我们使用React的时候，props里也没有key(不信你去打印一下
        if(propName === 'key' || propName === 'ref') continue;
        //保证所有的属性都不是undefined
        if (attrs.hasOwnProperty(propName)) {
            props[propName] = attrs[propName];
        }
    }
  }

  //把children丢进props里，就可以了
  //还记得我们React的children的用法吗？
  //this.props.children就是在这里加进来的
  props.children = children;
  //最后甩回去一个Vnode
  return new Vnode(type, props, key, ref);
}

const Nobi = {
  createElement,
  Component
}
export default Nobi