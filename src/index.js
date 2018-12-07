
import Nobi from '../lib/Nobi';
import NobiDOM from '../lib/NobiDOM';



const Hello = () => <div>function components Nobi<span>ss</span></div>
const title = <h1 className="title">Hello, world!</h1>;

NobiDOM.render( <h1 className="title">Hello, world!</h1>, document.getElementById('root'))

console.log(Hello(),title)
