import { connect } from 'react-redux';
import { BrowserRouter as Router, NavLink, Route } from 'react-router-dom';
import Clock from './Clock';
import Gallery from './Gallery';
import './site.scss';

const TIDE_APP_URL = process.env.TIDE_APP_URL;

const Footer = () => (
    <footer className="ui vertical footer segment">
        <div className="ui center aligned container">
            View on{' '}
            <a href="https://github.com/osteele/matrix-photo-gallery">GitHub</a>
        </div>
    </footer>
);

const NavLinkItem = props => (
    <NavLink className="item" activeClassName="active" {...props}>
        {props.children}
    </NavLink>
);

const App = () => (
    <Router>
        <div className="app">
            <main className="ui container">
                <nav id="app-menu" className="ui tabular menu">
                    <NavLinkItem exact to="/">
                        Gallery
                    </NavLinkItem>
                    <NavLinkItem to="/clock">Sundial</NavLinkItem>
                </nav>
                <Route exact path="/" component={Gallery} />
                <Route path="/clock" component={Clock} />
                {TIDE_APP_URL && (
                    <Route
                        path="/tides"
                        render={() => {
                            window.location.href = TIDE_APP_URL;
                        }}
                    />
                )}
            </main>
            <Footer />
        </div>
    </Router>
);

export default App;
