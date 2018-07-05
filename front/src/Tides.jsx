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
let lastMouse = null;

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
    const onMouseMove = e =>
        (lastMouse = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

    return (
        <section>
            <svg id="tides-container" onMouseMove={onMouseMove}>
                <defs>
                    <Gradients />
                </defs>

                <rect
                    className="background"
                    x="0"
                    y="0"
                    width={windowWidth}
                    height={windowHeight}
                    fill="url(#beachGradient)"
                />

                <g id="pebbles">
                    {images.map((image, i) => {
                        const cx =
                            (i * (windowWidth - image.radius)) / images.length;
                        const cy = water2y(image.tideLevel);
                        let dr = 0;
                        if (lastMouse) {
                            const d =
                                (cx - lastMouse.x) ** 2 +
                                (cy - lastMouse.y) ** 2;
                            if (d < 500) {
                                dr = 100 * (1 - d / (2 * 500 ** 2));
                                // dr =
                                //     (150 * Math.cos((d * 2 * Math.PI) / 100)) /
                                //     Math.max(1, Math.sqrt(d / 250));
                            }
                        }
                        return (
                            <Image
                                image={image}
                                key={image.event_id + i}
                                cx={cx}
                                cy={cy}
                                r={image.radius + dr}
                                extra={dr}
                            />
                        );
                    })}
                </g>

                <svg id="tide-level" y={water2y(tideLevel)}>
                    <path
                        d={tideTopPath.join(' ')}
                        fill="url(#tidalGradient)"
                    />
                </svg>

                <g id="waves">{waves.map(w => w.render())}</g>
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
        <radialGradient id="pebbleGradient">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="80%" stopColor="black" stopOpacity="0.25" />
            <stop offset="100%" stopColor="black" stopOpacity="0.90" />
        </radialGradient>
    </>
);

const Image = ({ image, cx, cy, r, extra }) => (
    <>
        <image
            x={cx - r}
            y={cy - r}
            width={r * 2}
            height={r * 2}
            xlinkHref={image.thumbnail_url}
        />
        {extra >= 0 && (
            <circle
                className="highlight"
                cx={cx}
                cy={cy}
                r={r / 2}
                fill="url(#pebbleGradient)"
            />
        )}
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
        image.radius = image.radius = 25 + 25 * Math.random();
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
