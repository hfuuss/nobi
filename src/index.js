
import Nobi from '../lib/Nobi/index';
import NobiDOM from '../lib/NobiDOM/index';

class Welcome extends Nobi.Component {
  render() {
      return <h1>Hello, {this.props.name}</h1>;
  }
}
class Comp {
  render(){
    return (
      <div>组件测试</div>
    )
  }
}

const element = <Welcome name="Sara" />
// const Hello = () => <div>function components Nobi<span>ss</span></div>
// const title = <h1 className="title">Hello, world!</h1>;
// const body = <div><Hello></Hello></div>
console.log(<Comp/>)
NobiDOM.render( element, document.getElementById('root'))

// console.log(Hello(),title)
