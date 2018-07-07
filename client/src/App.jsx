import { connect } from 'react-redux';
import { BrowserRouter as Router, NavLink, Route } from 'react-router-dom';
import Clock from './Clock';
import Gallery from './Gallery';
import './site.scss';

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

const App = ({ background, viewClass }) => (
    <Router>
        <div className={'app ' + viewClass} style={{ background }}>
            <main className="ui container">
                <nav className="ui tabular menu">
                    <NavLinkItem exact to="/">
                        Gallery
                    </NavLinkItem>
                    <NavLinkItem to="/clock">Sundial</NavLinkItem>
                </nav>
                <Route exact path="/" component={Gallery} />
                <Route path="/clock" component={Clock} />
            </main>
            <Footer />
        </div>
    </Router>
);

const mapStateToProps = ({ background, viewClass }) => ({
    background,
    viewClass
});

export default connect(mapStateToProps)(App);
