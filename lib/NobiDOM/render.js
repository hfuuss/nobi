import {Component} from '../Nobi'

// 创建组件
function createComponent( component, props ) {
  let inst;
  // 如果是类定义组件，则直接返回实例
  if ( component.prototype && component.prototype.render ) {
      inst = new component( props );
  // 如果是函数定义组件，则将其扩展为类定义组件
  } else {
      inst = new Component( props );
      inst.constructor = component;
      inst.render = function() {
          return this.constructor( props );
      }
  }
  return inst;
}

// set props
function setComponentProps( component, props ) {
  if ( !component.base ) {
      if ( component.componentWillMount ) component.componentWillMount();
  } else if ( component.componentWillReceiveProps ) {
      component.componentWillReceiveProps( props );
  }
  component.props = props;
  renderComponent( component );
}



function _render(vnode) { // 返回真实节点 {type:'',key:'',props:{children: [],...}}
  // 当vnode为字符串时，渲染结果是一段文本
  if ( typeof vnode === 'string' ) {
    const textNode = document.createTextNode( vnode );
    return  textNode;
  }

  // 渲染组件代码
  if ( typeof vnode.type === 'function' ) {
    const component = createComponent( vnode.type, vnode.props );// {prpos:{},state:{}}
    setComponentProps( component, vnode.props );
    return component.base;
    }
  
    // 渲染普通dom节点
  const dom = document.createElement( vnode.type );

  if ( vnode.props ) {
    mapProps( dom,vnode.props ); 
  }

  vnode.props.children.forEach( child => render( child, dom ) );    // 递归渲染子节点

  return dom    // 将渲染结果挂载到真正的DOM上
}


function mapProps(domNode,props){

  for (let propsName in props){

    if (propsName === 'children') continue; //不要把children也挂到真实DOM里面去

    if ( /on\w+/.test( propsName ) ) {
      const lowerpropsName = propsName.toLowerCase();
      domNode[ lowerpropsName ] = props[propsName] || '';
      continue;
    }
  
    if(propsName === 'style'){//这一步很明显了，就是把style css加进去
      let style = props['style'];
        //不熟悉的朋友，可以去看看什么是keys()
      Object.keys(style).forEach((styleName) => {
        domNode.style[styleName] = style[styleName];
      })
      continue;
    }
    domNode[propsName] = props[propsName]
  }
}


// 生命周期在里面
export function renderComponent( component ) {
  let base; // 记录真实dom
  const renderer = component.render();// 虚拟dom  Vnode{}
  if ( component.base && component.componentWillUpdate ) { // 如果存在真实dom，执行更新生命周期
    component.componentWillUpdate();
  }
//   base = _render( renderer ); // 执行render实际dom。渲染虚拟dom
  base = diffNode( component.base, renderer );//diff算法


  if ( component.base ) {// 存在真实dom
    if ( component.componentDidUpdate ) component.componentDidUpdate();// 更新完成生命周期
  } else if ( component.componentDidMount ) {//挂载完成生命周期。组件第一次挂载的时候执行
    component.componentDidMount();
  }
  if ( component.base && component.base.parentNode ) { //如果组件存在父亲节点，更新当前节点
    component.base.parentNode.replaceChild( base, component.base );
  }
  component.base = base;// 保存真实dom
  base._component = component;
}


export default function render( vnode, container ) {
  return container.appendChild( _render( vnode ) );
}



/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @param {HTMLElement} container 容器
 * @returns {HTMLElement} 更新后的DOM
 */
function diff( dom, vnode, container ) {

    const ret = diffNode( dom, vnode );

    if ( container && ret.parentNode !== container ) {
        container.appendChild( ret );
    }

    return ret;

}

function diffNode( dom, vnode ) {

    let out = dom;
    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    if ( typeof vnode === 'number' ) vnode = String( vnode );
    // diff text node
    if ( typeof vnode === 'string' ) {
      // 如果当前的DOM就是文本节点，则直接更新内容
      if ( dom && dom.nodeType === 3 ) {    // nodeType: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
        if ( dom.textContent !== vnode ) {
            dom.textContent = vnode;
        }
      // 如果DOM不是文本节点，则新建一个文本节点DOM，并移除掉原来的
      } else {
        out = document.createTextNode( vnode );
        if ( dom && dom.parentNode ) {
            dom.parentNode.replaceChild( out, dom );
        }
      }

      return out;
    }

    if ( typeof vnode.type === 'function' ) {
      return diffComponent( dom, vnode );
    }

    //真实节点不存在 或者类型不同
    if ( !dom || !isSameNodeType( dom, vnode ) ) {
      out = document.createElement( vnode.type );
      if ( dom ) {
        [ ...dom.childNodes ].map( out.appendChild );    // 将原来的子节点移到新节点下
        if ( dom.parentNode ) {
          dom.parentNode.replaceChild( out, dom );    // 移除掉原来的DOM对象
        }
      }
    }

    // 比较子节点
    if ( vnode.props.children && vnode.props.children.length > 0 || ( out.childNodes && out.childNodes.length > 0 ) ) {
      diffChildren( out, vnode.props.children );
    }

    diffAttributes( out, vnode );

    return out;

}

function diffChildren( dom, vchildren ) {
  const domChildren = dom.childNodes;
  const children = [];

  const keyed = {};

  if ( domChildren.length > 0 ) {
    for ( let i = 0; i < domChildren.length; i++ ) {
      const child = domChildren[ i ];
      const key = child.key;
      if ( key ) {
          keyedLen++;
          keyed[ key ] = child;
      } else {
          children.push( child );
      }
    }
  }

  if ( vchildren && vchildren.length > 0 ) {
    let min = 0;
    let childrenLen = children.length;
    for ( let i = 0; i < vchildren.length; i++ ) {
      const vchild = vchildren[ i ];
      const key = vchild.key;
      let child;
      if ( key ) {
        if ( keyed[ key ] ) {
            child = keyed[ key ];
            keyed[ key ] = undefined;
        }
      } else if ( min < childrenLen ) {
        for ( let j = min; j < childrenLen; j++ ) {
          let c = children[ j ];
          if ( c && isSameNodeType( c, vchild ) ) {
            child = c;
            children[ j ] = undefined;
            if ( j === childrenLen - 1 ) childrenLen--;
            if ( j === min ) min++;
            break;
          }
        }
      }
      child = diffNode( child, vchild );

      const f = domChildren[ i ];
      if ( child && child !== dom && child !== f ) {
        if ( !f ) {
          dom.appendChild(child);
        } else if ( child === f.nextSibling ) {
          removeNode( f );
        } else {
          dom.insertBefore( child, f );
        }
      }
    }
  }

}

function diffComponent( dom, vnode ) {
  let c = dom && dom._component;
  let oldDom = dom;
  // 如果组件类型没有变化，则重新set props
  if ( c && c.constructor === vnode.type ) {
    setComponentProps( c, vnode.attrs );
    dom = c.base;
  // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
  } else {
      if ( c ) {
        unmountComponent( c );
        oldDom = null;
      }
      c = createComponent( vnode.type, vnode.attrs );
      setComponentProps( c, vnode.attrs );
      dom = c.base;
      if ( oldDom && dom !== oldDom ) {
        oldDom._component = null;
        removeNode( oldDom );
      }

  }
  return dom;
}



function unmountComponent( component ) {
    if( component.componentWillUnmount ) component.componentWillUnmount();
    removeNode( component.base);
}

function isSameNodeType( dom, vnode ) {
    if( typeof vnode === 'string' || typeof vnode === 'number' ) {
      return dom.nodeType === 3;
    }
    if( typeof vnode.type === 'string' ) {
      return dom.nodeName.toLowerCase() === vnode.type.toLowerCase();
    }

    return dom && dom._component && dom._component.constructor === vnode.type;
}

function diffAttributes( dom, vnode ) {
debugger
  const old = {};    // 当前DOM的属性 {onClick:'',chindren: ''}
  const props = vnode.props;     // 虚拟DOM的属性
  for ( let i = 0 ; i < dom.attributes.length; i++ ) {
    const attr = dom.attributes[ i ];
    old[ attr.name ] = attr.value;
  }

  // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
    for ( let name in old ) {
      if ( !( name in props ) ) {
        props[name] = undefined
      }
    }
    // 更新新的属性值
    mapProps( dom, props );

  

}

function removeNode( dom ) {
    if ( dom && dom.parentNode ) {
      dom.parentNode.removeChild( dom );
    }

}