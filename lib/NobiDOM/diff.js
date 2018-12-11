import { Componet } from '../Nobi'
import { setAttribute } from './dom'

/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @param {HTMLElement} container 容器
 * @returns {HTMLElement} 更新后的DOM
 */
export function diff( dom, vnode, container ) {
    const ret = diffNode( dom, vnode );

    if ( container && ret.parentNode !== container ) {
        container.appendChild( ret );
    }

    return ret;

}

function diffNode( dom, vnode ) {

    let out = dom;

    // 如果是异常，直接赋值为空白
    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

    // 节点数字会自动变为数字类型，这里将其转换为字符串
    if ( typeof vnode === 'number' ) vnode = String( vnode );

    // 如果是文本节点
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
        // 返回
        return out;
    }

    // 如果是 是类或者函数式组件
    if ( typeof vnode.tag === 'function' ) {
        return diffComponent( dom, vnode );
    }

    // 如果是一般 dom 节点，比如 div，span，a
    if ( !dom || !isSameNodeType( dom, vnode ) ) {// 如果节点不存在，或者节点类型不同。重新建立节点。
        out = document.createElement( vnode.tag );

        if ( dom ) {
            [ ...dom.childNodes ].map( out.appendChild );    // 将原来的子节点移到新节点下

            if ( dom.parentNode ) {
                dom.parentNode.replaceChild( out, dom );    // 移除掉原来的DOM对象
            }
        }
    }

    if ( vnode.children && vnode.children.length > 0 || ( out.childNodes && out.childNodes.length > 0 ) ) {
        diffChildren( out, vnode.children );
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
    if ( c && c.constructor === vnode.tag ) {
        setComponentProps( c, vnode.attrs );
        dom = c.base;
    // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
    } else {

        if ( c ) {
            unmountComponent( c );
            oldDom = null;
        }

        c = createComponent( vnode.tag, vnode.attrs );

        setComponentProps( c, vnode.attrs );
        dom = c.base;

        if ( oldDom && dom !== oldDom ) {
            oldDom._component = null;
            removeNode( oldDom );
        }

    }

    return dom;

}

function setComponentProps( component, props ) {

    if ( !component.base ) {
        if ( component.componentWillMount ) component.componentWillMount();
    } else if ( component.componentWillReceiveProps ) {
        component.componentWillReceiveProps( props );
    }

    component.props = props;

    renderComponent( component );

}

export function renderComponent( component ) {

    let base;

    const renderer = component.render();

    if ( component.base && component.componentWillUpdate ) {
        component.componentWillUpdate();
    }

    base = diffNode( component.base, renderer );

    if ( component.base ) {
        if ( component.componentDidUpdate ) component.componentDidUpdate();
    } else if ( component.componentDidMount ) {
        component.componentDidMount();
    }

    component.base = base;
    base._component = component;

}

function createComponent( component, props ) {

    let inst;

    if ( component.prototype && component.prototype.render ) {
        inst = new component( props );
    } else {
        inst = new Component( props );
        inst.constructor = component;
        inst.render = function() {
            return this.constructor( props );
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
    if ( typeof vnode === 'string' || typeof vnode === 'number' ) {
        return dom.nodeType === 3;
    }
    // 比较 普通dom节点类型
    if ( typeof vnode.tag === 'string' ) {
        return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
    }
    // 比较组件节点类型
    return dom && dom._component && dom._component.constructor === vnode.tag;
}

function diffAttributes( dom, vnode ) {

    const old = {};    // 当前DOM的属性
    const attrs = vnode.attrs;     // 虚拟DOM的属性

    for ( let i = 0 ; i < dom.attributes.length; i++ ) {
        const attr = dom.attributes[ i ];
        old[ attr.name ] = attr.value;
    }

    // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
    for ( let name in old ) {

        if ( !( name in attrs ) ) {
            setAttribute( dom, name, undefined );
        }

    }

    // 更新新的属性值
    for ( let name in attrs ) {

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