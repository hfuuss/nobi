import {renderComponent} from '../NobiDOM/render'

export default class Component {
  constructor( props = {} ) {
      this.state = {};
      this.props = props;
  }

  setState( stateChange ) {
    // 将修改合并到state
    Object.assign( this.state, stateChange );
    debugger
    renderComponent( this );
  }
}