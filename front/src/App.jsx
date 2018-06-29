import { BrowserRouter as Router, NavLink, Route } from 'react-router-dom';
import ButtonBar from './ButtonBar';
import Clock from './Clock';
import ImageGrid from './ImageGrid';

const Gallery = () => (
    <div>
        <ButtonBar />
        <ImageGrid />
    </div>
);

const App = () => (
    <Router>
        <div className="ui container">
            <nav className="ui tabular menu">
                <NavLink className="item" exact activeClassName="active" to="/">
                    Gallery
                </NavLink>
                <NavLink className="item" activeClassName="active" to="/clock">
                    Clock
                </NavLink>
            </nav>
            <Route exact path="/" component={Gallery} />
            <Route path="/clock" component={Clock} />
        </div>
    </Router>
);

export default App;
