
function render(vnode, container ) {
    
  // 当vnode为字符串时，渲染结果是一段文本
  if ( typeof vnode === 'string' ) {
      const textNode = document.createTextNode( vnode );
      return container.appendChild( textNode );
  }
  
  const dom = document.createElement( vnode.type );

  if ( vnode.props ) {
    mapProps( dom,vnode.props ); 
  }

  vnode.props.children.forEach( child => render( child, dom ) );    // 递归渲染子节点

  return container.appendChild( dom );    // 将渲染结果挂载到真正的DOM上
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

const NobiDOM = {
  render,
}
export default NobiDOM