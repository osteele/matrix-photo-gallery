import _ from 'lodash';
import { connect } from 'react-redux';
import { setBackground } from './data/actions';
import { withBackground, withImages } from './wrappers';

const Tides = ({ images, heartbeat }) => {
    const width = 1000;
    const height = 500;

    // tide levels
    const levels = _.chain(images).map('tideLevel');
    const tideMin = levels.min().value();
    const tideMax = levels.max().value();
    const tideRange = tideMax - tideMin;

    // current tide level
    const tidePeriod = 30 * 1000; // complete tide cycle in ms
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
    const tidePath = ['M0 0', 'h', width, 'v2500', 'H0'];
    return (
        <section className="tides">
            <svg className="background">
                <defs>
                    <linearGradient
                        id="beachGradient"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="9.5%" stopColor="#C2B280" />
                        <stop offset="10%" stopColor="#b8b09b" />
                        <stop offset="20%" stopColor="#b8b09b" />
                        <stop offset="20.5%" stopColor="blue" />
                    </linearGradient>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width={width}
                    height={1200}
                    fill="url(#beachGradient)"
                />
            </svg>
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
            <svg className="tide">
                <defs>
                    <linearGradient
                        id="tidalGradient"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="0%" stopColor="blue" stopOpacity="0" />
                        <stop offset="0.5%" stopColor="blue" stopOpacity="0" />
                        <stop offset="10%" stopColor="blue" stopOpacity="1" />
                        <stop offset="30%" stopColor="blue" stopOpacity="1" />
                    </linearGradient>
                </defs>
                <svg y={water2y(tideLevel)}>
                    <path d={tidePath.join(' ')} fill="url(#tidalGradient)" />
                </svg>
            </svg>
        </section>
    );
};

const Image = ({ image, x, y, opacity }) => (
    <img
        className="ui circular image"
        style={{
            left: x + 'px',
            top: y + 'px'
        }}
        src={image.thumbnail_url}
    />
);

// {images.map((image, i) => (
//     <image
//         key={image.event_id + i}
//         x={(i * (width - 50)) / images.length}
//         y={water2y(image.tideLevel)}
//         width={50}
//         height={50}
//         xlinkHref={image.thumbnail_url}
//     />
// ))}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    return a;
}

const replicateArray = (ar, length) => {
    let result = ar;
    while (result.length < length) {
        result = result.concat(ar.slice(length - result.length));
    }
    return result;
};

const memoTable = {};
const onceish = fn => {
    let value = memoTable[fn.length];
    if (!value) memoTable[fn.length] = value = fn();
    return value;
};

const mapStateToProps = ({ heartbeat, images }) => ({
    heartbeat: heartbeat,
    images:
        images &&
        onceish(() =>
            shuffle(
                replicateArray(
                    images.filter(image => image.tideLevel !== undefined),
                    500
                )
            )
        )
});

const mapDispatchToProps = dispatch => ({
    setBackground: color => dispatch(setBackground(color))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withBackground('gray')(withImages(Tides)));
