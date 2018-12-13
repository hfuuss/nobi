import { Componet } from '../Nobi'
import { setAttribute } from './dom'

import {TEXT_ELEMENT} from '../utils/Vnode'
/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @param {HTMLElement} container 容器
 * @returns {HTMLElement} 更新后的DOM
 */
export function diff( dom, vnode, container ) {

    const ret = diffNode( dom, vnode );// 返回diff之后的节点

    if ( container && ret.parentNode !== container ) {
        container.appendChild( ret );
    }

    return ret;

}

function diffNode( dom, vnode ) {

    // 真实DOM保存
    let out = dom;

    // 如果虚拟DOM是异常，直接赋值为空白
    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    // 节点数字会自动变为数字类型，这里将其转换为字符串
    // if ( typeof vnode === 'number' ) vnode = String( vnode );
    // 如果是文本节点
    if ( vnode.type === TEXT_ELEMENT ) {
			
        // 如果当前的DOM就是文本节点，则直接更新内容
        if ( dom && dom.nodeType === 3 ) {    // nodeType: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
            if ( dom.textContent !== vnode.props.nodeValue ) {
                dom.textContent = vnode.props.nodeValue;
            }
        // 如果DOM不是文本节点，则新建一个文本节点DOM，并移除掉原来的
        } else {
            out = document.createTextNode( vnode.props.nodeValue );
            if ( dom && dom.parentNode ) {
                dom.parentNode.replaceChild( out, dom );
            }
        }
        // 返回 更新后的节点
        return out;
    }

    // 如果是 是类或者函数式组件
    if ( typeof vnode.type === 'function' ) {
        return diffComponent( dom, vnode ); // 返回更新的节点
    }

    // 如果是一般 dom 节点，比如 div，span，a

    if ( !dom || !isSameNodeType( dom, vnode ) ) {// 如果真实节点不存在，或者节点类型不同。重新建立节点。
        out = document.createElement( vnode.type );
				if ( dom ) { // 如果真实DOM存在，节点类型不同。重新建立该节点以及所有子节点。感觉有点bug
            [ ...dom.childNodes ].map(out.appendChild);    // 将原来的子节点移到新节点下???
            if ( dom.parentNode ) {
                dom.parentNode.replaceChild( out, dom );    // 移除掉原来的DOM对象
            }
        }
    }

    if ( vnode.props.children && vnode.props.children.length > 0 || ( out.childNodes && out.childNodes.length > 0 ) ) {
        diffChildren( out, vnode.props.children ); // 比较子节点
    }

    // 比较attr
    diffAttributes( out, vnode );

    return out;

}


function diffChildren( dom, vchildren ) {// 真是节点，虚拟子节点

    const domChildren = dom.childNodes;// 真实DOM的子节点
    const children = [];

    const keyed = {};

    if ( domChildren.length > 0 ) {
        for ( let i = 0; i < domChildren.length; i++ ) {
            const child = domChildren[ i ];
            const key = child.key;
            if ( key ) {
                // keyedLen++;
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
            if ( key ) { // 处理带key的节点
                if ( keyed[ key ] ) {
                    child = keyed[ key ];
                    keyed[ key ] = undefined;
                }

            } else if ( min < childrenLen ) {

                for ( let j = min; j < childrenLen; j++ ) {

                    let c = children[ j ];

                    if ( c && isSameNodeType( c, vchild ) ) {
                        child = c;
                        children[j] = undefined;
                        if ( j === childrenLen - 1 ) childrenLen--;
                        if ( j === min ) min++;
                        break;
                    }
                }
						}

						// 递归调用
            child = diffNode( child, vchild )

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


/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @returns {HTMLElement} 更新后的DOM
 */
function diffComponent( dom, vnode ) {

    let c = dom && dom._component// 第一次进来，dom为null，c为null
    let oldDom = dom

    // 初始化之后。如果组件类型没有变化，则重新set props
    if ( c && c.constructor === vnode.type ) {
        setComponentProps( c, vnode.props )// 更改组件属性
        dom = c.base
    // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
    } else {

        if(c) { // 如果不是初始化，且类型不同。则移除组件。相当于初始化
					unmountComponent( c )
					oldDom = null
        }
        c = createComponent( vnode.type, vnode.props )// 第一次渲染，创建组件
        setComponentProps( c, vnode.props ) // 第一次执行之后，c.base是真实DOM，c.base._component保存了组件c。原型链经常这么做。  
        dom = c.base
        if ( oldDom && dom !== oldDom ) { // 初始化之后进行比较
            oldDom._component = null
            removeNode( oldDom )
        }
    }

    return dom;

}

// 设置组件props 以及生命周期相关操作
function setComponentProps( component, props ) {

    if ( !component.base ) {// 如果第一次建立
        if ( component.componentWillMount ) component.componentWillMount();
    } else if ( component.componentWillReceiveProps ) { // 初始化之后的生命周期
        component.componentWillReceiveProps( props );
				component.props = props; // 更新props
    }
    renderComponent( component );
}

// 渲染组件
export function renderComponent( component ) {

    let base;

    const renderer = component.render();

    if ( component.base && component.componentWillUpdate ) { // 不是初始化
        component.componentWillUpdate();
    }

    base = diffNode( component.base, renderer ); // 第一次 component.base 为null。 递归。返回组件的真实DOM

    if ( component.base ) { // 初始化之后
        if ( component.componentDidUpdate ) component.componentDidUpdate();
    } else if ( component.componentDidMount ) { // 初始化之前
        component.componentDidMount();
    }

    component.base = base;
    base._component = component;

}

function createComponent( component, props ) {

    let inst;

    if ( component.prototype && component.prototype.render ) {// class组件
        inst = new component( props )
    } else { // 函数式组件
        inst = new Component( props )
        inst.constructor = component
        inst.render = function() {
            return this.constructor( props )
        }
    }

    return inst;

}

function unmountComponent( component ) {
    if ( component.componentWillUnmount ) component.componentWillUnmount();
    removeNode( component.base);
}

function isSameNodeType( dom, vnode ) {
    // 比较文本或者数字节点类型
    if ( vnode.type === TEXT_ELEMENT ) {
        return dom.nodeType === 3;
    }
    // 比较 普通dom节点类型
    if ( typeof vnode.type === 'string' ) {
        return dom.nodeName.toLowerCase() === vnode.type.toLowerCase();
    }
    // 比较组件节点类型
    return dom && dom._component && dom._component.constructor === vnode.type;
}

function diffAttributes( dom, vnode ) {
    const old = {};    // 当前DOM的属性
    const attrs = vnode.props;     // 虚拟DOM的属性

    for ( let i = 0 ; i < dom.attributes.length; i++ ) {
			const attr = dom.attributes[ i ];
			old[attr.name] = attr.value;
    }

    // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
    for ( let name in old ) {
        if ( !( name in attrs ) ) {
            setAttribute( dom, name, undefined );
        }
    }

    // 更新新的属性值
    for ( let name in attrs ) {
			if (name === 'children') continue
			if ( old[ name ] !== attrs[ name ] ) {
					setAttribute( dom, name, attrs[ name ] );
			}
    }

}

function removeNode( dom ) {

    if ( dom && dom.parentNode ) {
        dom.parentNode.removeChild( dom );
    }

}