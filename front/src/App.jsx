import { connect } from 'react-redux';
import { BrowserRouter as Router, NavLink, Route } from 'react-router-dom';
import ButtonBar from './ButtonBar';
import Clock from './Clock';
import ImageGrid from './ImageGrid';
import './site.scss';
import Tides from './Tides';

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

const NavLinkItem = props => (
    <NavLink className="item" activeClassName="active" {...props}>
        {props.children}
    </NavLink>
);

const App = ({ background }) => (
    <Router>
        <div className="app" style={{ background }}>
            <main className="ui container">
                <nav className="ui tabular menu">
                    <NavLinkItem exact to="/">
                        Gallery
                    </NavLinkItem>
                    <NavLinkItem to="/clock">Sundial</NavLinkItem>
                    <NavLinkItem to="/tides">Tides</NavLinkItem>
                </nav>
                <Route exact path="/" component={Gallery} />
                <Route path="/clock" component={Clock} />
                <Route path="/tides" component={Tides} />
            </main>
            <Footer />
        </div>
    </Router>
);

const mapStateToProps = state => ({
    background: state.background
});

export default connect(mapStateToProps)(App);
