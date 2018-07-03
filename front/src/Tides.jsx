import _ from 'lodash';
import { connect } from 'react-redux';
import withBackground from './background';
import { setBackground } from './data/actions';

const Tides = ({ images, heartbeat }) => {
    images = images.filter(image => image.tideLevel !== undefined);
    const width = 800;
    const height = 500;
    // tide levels
    const levels = _.chain(images).map('tideLevel');
    const tideMin = levels.min().value();
    const tideMax = levels.max().value();
    const tideRange = tideMax - tideMin;
    // current tide level
    const tidePeriod = 30 * 1000; // complete tide cycle in ms
    const tideLevel =
        tideMin + tideRange * Math.cos((heartbeat * 2 * Math.PI) / tidePeriod);
    // current water level
    const waterLevel = tideLevel;
    return (
        <section
            className="tides"
            style={{
                height: width + 'px',
                height: height + 'px',
                position: 'relative'
            }}
        >
            <h2>Tides</h2>
            {images.map((image, i) => (
                <Image
                    image={image}
                    key={image.event_id}
                    x={(i * width) / images.length}
                    y={((image.tideLevel - tideMin) / tideRange) * height}
                    alpha={
                        1 - (image.tideLevel - waterLevel) ** 2 / tideRange ** 2
                    }
                />
            ))}
        </section>
    );
};

const Image = ({ image, x, y, alpha }) => (
    <img
        className="ui circular image"
        style={{
            left: x + 'px',
            top: y + 'px',
            display: alpha > 0 ? 'block' : 'none',
            opacity: Math.max(0, alpha)
        }}
        src={image.thumbnail_url}
    />
);

const mapStateToProps = state => ({
    heartbeat: state.heartbeat,
    images: state.images
});

const mapDispatchToProps = dispatch => ({
    setBackground: color => dispatch(setBackground(color))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withBackground('blue')(Tides));
