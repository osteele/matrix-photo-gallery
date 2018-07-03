import _ from 'lodash';
import { connect } from 'react-redux';
import withBackground from './background';
import { setBackground } from './data/actions';

let savedImages = [];

const Tides = ({ images, heartbeat }) => {
    const width = 1000;
    const height = 500;
    // images
    images = images.filter(image => image.tideLevel !== undefined);
    if (!images.length) {
        return null;
    }
    while (savedImages.length < 1) {
        savedImages = images.slice(0, 40);
        break;
    }
    // while (savedImages.length < 500) {
    //     savedImages = savedImages.concat(images);
    // }
    images = savedImages;
    // tide levels
    const levels = _.chain(images).map('tideLevel');
    const tideMin = levels.min().value();
    const tideMax = levels.max().value();
    const tideRange = tideMax - tideMin;
    // current tide level
    const tidePeriod = 120 * 1000; // complete tide cycle in ms
    const tideLevel =
        tideMin +
        tideRange *
            (0.5 + 0.5 * Math.cos((heartbeat * 2 * Math.PI) / tidePeriod));
    // current water level
    const wavePeriod = 5 * 1000;
    const waveAmplitude = tideRange / 5;
    const waterLevel =
        tideLevel +
        waveAmplitude * Math.cos((heartbeat * 2 * Math.PI) / wavePeriod);
    // svg
    const water2y = level => ((level - tideMin) / tideRange) * height;
    const data = ['M0 0', 'h', width, 'v2000', 'H0'];
    return (
        <section className="tides">
            <div>Water level: {tideLevel}</div>
            {images.map((image, i) => {
                const level = image.tideLevel;
                return (
                    <Image
                        image={image}
                        key={image.event_id + i}
                        x={(i * (width - 50)) / images.length}
                        y={water2y(level)}
                        opacity={1 - (level - waterLevel) ** 2 / tideRange ** 2}
                    />
                );
            })}
            <svg style={{ top: water2y(waterLevel) + 'px' }}>
                <path d={data.join(' ')} fill="blue" />
            </svg>
        </section>
    );
};

const Image = ({ image, x, y, opacity }) => (
    <img
        className="ui circular image"
        style={{
            left: x + 'px',
            top: y + 'px',
            display: opacity > 0 ? 'block' : 'none',
            opacity: Math.max(0, opacity)
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
)(withBackground('gray')(Tides));
