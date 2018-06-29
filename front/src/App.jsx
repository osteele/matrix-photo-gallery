import { BrowserRouter as Router, NavLink, Route } from 'react-router-dom';
import ButtonBar from './ButtonBar';
import Clock from './Clock';
import ImageGrid from './ImageGrid';
import './site.scss';

const Gallery = () => (
    <div>
        <ButtonBar />
        <ImageGrid />
    </div>
);

const Footer = () => (
    <footer className="ui vertical footer segment">
        <div className="ui center aligned container">
            View on{' '}
            <a href="https://github.com/osteele/matrix-photo-gallery">GitHub</a>
        </div>
    </footer>
);

const App = () => (
    <Router>
        <div className="app">
            <main className="ui container">
                <nav className="ui tabular menu">
                    <NavLink
                        className="item"
                        exact
                        activeClassName="active"
                        to="/"
                    >
                        Gallery
                    </NavLink>
                    <NavLink
                        className="item"
                        activeClassName="active"
                        to="/clock"
                    >
                        Clock
                    </NavLink>
                </nav>
                <Route exact path="/" component={Gallery} />
                <Route path="/clock" component={Clock} />
            </main>
            <Footer />
        </div>
    </Router>
);

export default App;
