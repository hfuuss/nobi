import Component from './Component'
import Vnode,{TEXT_ELEMENT} from '../utils/Vnode'
const hasOwnProperty = Object.prototype.hasOwnProperty;

const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
  };

function createElement( type, config, ...children ) {
		let propName;
    const props = {}

    let key = null;
    let ref = null;

    // 处理ref和key
    if(config != null) {
			if(hasValidRef(config)) {
					ref = config.ref
			}
			if(hasValidKey(config)) {
					key = '' + config.key
			}
    }

    for(propName in config) {
        if (
            hasOwnProperty.call(config, propName) &&
            !RESERVED_PROPS.hasOwnProperty(propName)
            ) {
            props[propName] = config[propName];
            }
    }
    // 处理children
    const hasChildren = children.length > 0;
    const rawChildren = hasChildren ? [].concat(...children) : [];

    props.children = rawChildren
        .filter(c => c != null && c !== false)
        .map(c => c instanceof Object ? c : createTextElement(c));

    return new Vnode(type, props ,key ,ref)
}

export default createElement;



function hasValidRef(config) {
    return config.ref !== undefined
}

function hasValidKey(config) {
    return config.key !== undefined
}

// 格式化文本节点
function createTextElement(value) {
    return createElement(TEXT_ELEMENT, { nodeValue: value });
}
// 文本节点：
// {
//     type: 'TEXT ELEMENT',
//     props: {
//         nodeValue: value
//         children: []
//     },
//     key: null,
//     ref: null,
// }
