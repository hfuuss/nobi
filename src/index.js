
import Nobi from '../lib/Nobi/index';
import NobiDOM from '../lib/NobiDOM/index';

// class Welcome extends Nobi.Component {
//   render() {
//       return <h1>Hello, {this.props.name}</h1>;
//   }
// }

class Counter extends Nobi.Component {
  constructor( props ) {
      super( props );
      this.state = {
          num: 1
      }
  }

  onClick() {
      this.setState( { num: ++this.state.num } );
      this.setState( { num: ++this.state.num } );
      setTimeout(() => { this.setState({num: this.state.num + 1}) }, 0)
      setTimeout(() => { this.setState({num: this.state.num + 1}) }, 0)
  }

  render() {
      return (
          <div>
              <h1>count: { this.state.num }</h1>
              <button onClick={ () => this.onClick()}>add</button>
          </div>
      );
  }
}

// const element = <Welcome name="Sara" />
// const Hello = () => <div>function components Nobi<span>ss</span></div>
// const title = <h1 className="title">Hello, world!</h1>;
// const body = <div><Hello></Hello></div>
// console.log(<Comp/>)
NobiDOM.render( <Counter/>, document.getElementById('root'))

// console.log(Hello(),title)
