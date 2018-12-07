
import {Component} from './Nobi'


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

function render( vnode, container ) {
  return container.appendChild( _render( vnode ) );
}

function _render(vnode) {
    debugger
  // 当vnode为字符串时，渲染结果是一段文本
  if ( typeof vnode === 'string' ) {
      const textNode = document.createTextNode( vnode );
      return  textNode;
  }

  // 渲染组件代码
  if ( typeof vnode.type === 'function' ) {

    const component = createComponent( vnode.type, vnode.props );

    setComponentProps( component, vnode.props );

    return component.base;
}
  
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


export function renderComponent( component ) {

  let base;

  const renderer = component.render();

  if ( component.base && component.componentWillUpdate ) {
      component.componentWillUpdate();
  }

  base = _render( renderer );

  if ( component.base ) {
      if ( component.componentDidUpdate ) component.componentDidUpdate();
  } else if ( component.componentDidMount ) {
      component.componentDidMount();
  }

  if ( component.base && component.base.parentNode ) {
      component.base.parentNode.replaceChild( base, component.base );
  }

  component.base = base;
  base._component = component;

}


const NobiDOM = {
  render,
}

export default NobiDOM