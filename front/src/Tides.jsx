import _ from 'lodash';
import { connect } from 'react-redux';
import { setBackground, setViewClass } from './data/actions';
import { onceish, replicateArray, shuffle } from './utils';
import { withBackground, withImages, withViewClass } from './wrappers';

const SAND_COLOR = '#adb9b6';
const TIDAL_COLOR = '#b8b09b';
const OCEAN_COLOR = '#b2c4d6';
const WAVE_COLOR = '#92b4b6';

let waves = [];

const Tides = ({ audioBaseUrl, heartbeat, images }) => {
    // dimensions
    const windowWidth = document.body.clientWidth;
    const windowHeight = document.body.clientHeight;

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
        <section id="tides-container">
            <svg className="background">
                <defs>
                    <Gradients />
                </defs>

                <rect
                    x="0"
                    y="0"
                    width={windowWidth}
                    height={windowHeight}
                    fill="url(#beachGradient)"
                />

                {images.map((image, i) => (
                    <Image
                        image={image}
                        key={image.event_id + i}
                        x={(i * (windowWidth - image.radius)) / images.length}
                        y={water2y(image.tideLevel)}
                        radius={image.radius}
                    />
                ))}

                <svg id="tide-level" y={water2y(tideLevel)}>
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

const Gradients = _ => (
    <>
        <linearGradient id="tidalGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={OCEAN_COLOR} stopOpacity="0" />
            <stop offset="0.5%" stopColor={OCEAN_COLOR} stopOpacity="0" />
            <stop offset="10%" stopColor={OCEAN_COLOR} stopOpacity="1" />
            <stop offset="30%" stopColor={OCEAN_COLOR} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="beachGradient" gradientTransform="rotate(90)">
            <stop offset="9.5%" stopColor={SAND_COLOR} />
            <stop offset="10%" stopColor={TIDAL_COLOR} />
            <stop offset="20%" stopColor={TIDAL_COLOR} />
            <stop offset="20.5%" stopColor={OCEAN_COLOR} />
        </linearGradient>
        <radialGradient id="memoryGradient">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="80%" stopColor="black" stopOpacity="0.25" />
            <stop offset="100%" stopColor="black" stopOpacity="0.90" />
        </radialGradient>
    </>
);

const Image = ({ image, x, y, radius }) => (
    <>
        <image
            x={x}
            y={y}
            width={radius}
            height={radius}
            xlinkHref={image.thumbnail_url}
        />
        <circle
            cx={x + radius / 2}
            cy={y + radius / 2}
            r={radius / 4}
            fill="url(#memoryGradient)"
        />
    </>
);

const mapStateToProps = ({ audioBaseUrl, heartbeat, images }) => ({
    audioBaseUrl,
    heartbeat,
    images:
        images &&
        onceish(() =>
            addImageRadii(
                shuffle(
                    replicateArray(
                        images.filter(image => image.tideLevel !== undefined),
                        500
                    )
                )
            )
        )
});

const addImageRadii = images => {
    images.forEach(image => {
        image.radius = image.radius = 50 + 50 * Math.random();
    });
    return images;
};

const mapDispatchToProps = dispatch => ({
    setBackground: color => dispatch(setBackground(color)),
    setViewClass: viewClass => dispatch(setViewClass(viewClass))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withImages(withBackground('gray')(withViewClass('tides')(Tides))));
