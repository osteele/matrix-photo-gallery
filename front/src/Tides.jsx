import _ from 'lodash';
import { connect } from 'react-redux';
import { setBackground } from './data/actions';
import { onceish, replicateArray, shuffle } from './utils';
import { withBackground, withImages } from './wrappers';

const USE_SVG_IMAGES = 1;

const SAND_COLOR = '#adb9b6';
const TIDAL_COLOR = '#b8b09b';
const OCEAN_COLOR = '#b2c4d6';
const WAVE_COLOR = '#92b4b6';

let waves = [];

const Tides = ({ audioBaseUrl, heartbeat, images }) => {
    // dimensions
    const windowWidth = document.body.clientWidth;
    const windowHeight = document.body.clientHeight;
    const imageWidth = 50;

    // tide levels
    const imageTideLevels = _.chain(images).map('tideLevel');
    const tideMin = imageTideLevels.min().value();
    const tideMax = imageTideLevels.max().value();
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

    // tide level to y position
    const tideTopMargin = 100;
    const tideBottomMargin = 100;
    const water2y = level =>
        tideTopMargin +
        ((level - tideMin) / tideRange) *
            (windowHeight - tideTopMargin - tideBottomMargin);

    // waves
    const Wave = () => {
        const id = +new Date();
        let x = windowWidth * (3 * Math.random() - 1);
        let y = 0;
        const dx = 20 * (Math.random() - 0.5);
        return {
            alive: () => y < windowHeight,
            animate: () => {
                x += dx;
                y += 10;
            },
            render: () => (
                <rect
                    key={id}
                    className="wave"
                    x={x}
                    y={y}
                    width={200}
                    height={20}
                    fill={WAVE_COLOR}
                />
            )
        };
    };
    waves = waves.filter(w => w.alive());
    if (waves.length < 10 && Math.random() < 1 / 10) {
        waves.push(Wave());
    }
    waves.forEach(w => w.animate());

    // svg
    const tideTopPath = ['M0 0', 'h', windowWidth, 'v2500', 'H0'];

    return (
        <section className="tides">
            <svg className="background">
                <defs>
                    <linearGradient
                        id="beachGradient"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="9.5%" stopColor={SAND_COLOR} />
                        <stop offset="10%" stopColor={TIDAL_COLOR} />
                        <stop offset="20%" stopColor={TIDAL_COLOR} />
                        <stop offset="20.5%" stopColor={OCEAN_COLOR} />
                    </linearGradient>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width={windowWidth}
                    height={windowHeight}
                    fill="url(#beachGradient)"
                />
            </svg>
            {!USE_SVG_IMAGES &&
                images.map((image, i) => {
                    const level = image.tideLevel;
                    return (
                        <Image
                            image={image}
                            key={image.event_id + i}
                            x={(i * (windowWidth - imageWidth)) / images.length}
                            y={water2y(level)}
                            opacity={
                                1 - (level - waterLevel) ** 2 / tideRange ** 2
                            }
                        />
                    );
                })}
            <svg id="tide-level">
                <defs>
                    <linearGradient
                        id="tidalGradient"
                        gradientTransform="rotate(90)"
                    >
                        <stop
                            offset="0%"
                            stopColor={OCEAN_COLOR}
                            stopOpacity="0"
                        />
                        <stop
                            offset="0.5%"
                            stopColor={OCEAN_COLOR}
                            stopOpacity="0"
                        />
                        <stop
                            offset="10%"
                            stopColor={OCEAN_COLOR}
                            stopOpacity="1"
                        />
                        <stop
                            offset="30%"
                            stopColor={OCEAN_COLOR}
                            stopOpacity="1"
                        />
                    </linearGradient>
                </defs>

                {USE_SVG_IMAGES &&
                    images.map((image, i) => (
                        <image
                            key={image.event_id + i}
                            x={(i * (windowWidth - imageWidth)) / images.length}
                            y={water2y(image.tideLevel)}
                            width={imageWidth}
                            height={imageWidth}
                            xlinkHref={image.thumbnail_url}
                        />
                    ))}

                <svg y={water2y(tideLevel)}>
                    <path
                        d={tideTopPath.join(' ')}
                        fill="url(#tidalGradient)"
                    />
                </svg>
                {waves.map(w => w.render())}
            </svg>
            <audio autoPlay loop src={audioBaseUrl + '/waves-audio.m4a'} />
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

const mapStateToProps = ({ audioBaseUrl, heartbeat, images }) => ({
    audioBaseUrl,
    heartbeat,
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
)(withImages(withBackground('gray')(Tides)));
