import _ from 'lodash';
import { connect } from 'react-redux';
import { setBackground, setViewClass } from './data/actions';
import { onceish, replicateArray, shuffle } from './utils';
import { withBackground, withImages, withViewClass } from './wrappers';

// const SAND_COLOR = '#c0acbc';
const SAND_COLOR = '#b8b09b';
const TIDAL_COLOR = '#b8b09b';
const OCEAN_COLOR = '#60674c';
const WAVE_COLOR = '#aab49d';
const SKY_COLOR = '#c1d3e6';

const SKY_HEIGHT = 100;
const SAND_HEIGHT = 75;
const OPEN_WATER_HEIGHT = 200;

const LIGHT_THRESH = 5;
const SENSOR_DATA_AGE = 10;

let waves = [];
let lastMouse = null;

const Tides = ({ audioBaseUrl, heartbeat, images, sensorData }) => {
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
    const shoalsTop = SKY_HEIGHT + SAND_HEIGHT;
    const shoalsBottom = windowHeight - OPEN_WATER_HEIGHT;
    const shoals_height = windowHeight - shoalsTop - OPEN_WATER_HEIGHT;
    const tide2y = level =>
        shoalsTop + (1 - (level - tideMin) / tideRange) * shoals_height;

    // waves
    const Wave = () => {
        const id = +new Date();
        let x = windowWidth * (3 * Math.random() - 1);
        let y = windowHeight;
        const dx = 20 * (Math.random() - 0.5);
        return {
            active: () => y > 0,
            animate: () => {
                x += dx;
                y -= 10;
            },
            render: () => (
                <rect
                    key={id}
                    className="wave"
                    x={x}
                    y={y}
                    width={350}
                    height={10}
                    fill={y < 50 ? 'white' : WAVE_COLOR}
                    opacity={Math.max(1, y / 100)}
                />
            )
        };
    };
    waves = waves.filter(w => w.active());
    if (waves.length < 10 && Math.random() < 1 / 10) {
        waves.push(Wave());
    }
    waves.forEach(w => w.animate());

    // svg
    const tideTopPath = ['M0 0', 'h', windowWidth, 'v2500', 'H0'];
    const onMouseMove = e =>
        (lastMouse = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

    let hero = null;

    return (
        <section>
            <svg id="tides-container" onMouseMove={onMouseMove}>
                <defs>
                    <Gradients />
                </defs>

                <rect
                    id="background"
                    x="0"
                    y="0"
                    width={windowWidth}
                    height={windowHeight}
                    fill="url(#beachGradient)"
                />
                <rect id="sky" y="0" height={SKY_HEIGHT} fill={SKY_COLOR} />
                <rect
                    id="sand"
                    y={SKY_HEIGHT}
                    height={SAND_HEIGHT}
                    fill={SAND_COLOR}
                />
                <rect
                    id="ocean"
                    y={SKY_HEIGHT + SAND_HEIGHT}
                    height={windowHeight}
                    fill={OCEAN_COLOR}
                />

                <g id="pebbles">
                    {images.map((image, i) => {
                        const cx =
                            (i * (windowWidth - image.radius)) / images.length;
                        const cy = tide2y(image.tideLevel) + 2 * image.radius;
                        let dr = 0;
                        if (lastMouse) {
                            const d =
                                (cx - lastMouse.x) ** 2 +
                                (cy - lastMouse.y) ** 2;
                            if (d < 500) {
                                const proximity = 1 - d / (2 * 500 ** 2);
                                dr = 50 * proximity;
                                // dr =
                                //     (150 * Math.cos((d * 2 * Math.PI) / 100)) /
                                //     Math.max(1, Math.sqrt(d / 250));
                                if (!hero || proximity > hero.proximity) {
                                    hero = { image, cx, cy, proximity };
                                }
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

                <svg id="tide-level" y={tide2y(tideLevel)}>
                    <path
                        d={tideTopPath.join(' ')}
                        fill="url(#tidalGradient)"
                    />
                </svg>

                <g id="waves" y={0}>
                    {waves.map(w => w.render())}
                </g>
                {hero && <Hero r={100} {...hero} />}

                {sensorData.age < SENSOR_DATA_AGE &&
                    sensorData.l < LIGHT_THRESH && (
                        <rect
                            id="scrim"
                            opacity={1 - sensorData.l / LIGHT_THRESH}
                        />
                    )}
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
            className="rounded"
            x={cx - r}
            y={cy - r}
            width={r * 2}
            height={r * 2}
            xlinkHref={image.thumbnail_url}
        />
        <circle
            className="highlight"
            cx={cx}
            cy={cy}
            r={r}
            opacity={extra > 0 ? 0.25 : 1}
            fill="url(#pebbleGradient)"
        />
        }
    </>
);

const Hero = ({ image, cx, cy, r, proximity }) => (
    <g id="hero">
        <image
            x={cx - r}
            y={cy - r}
            width={r * 2}
            height={r * 2}
            xlinkHref={image.thumbnail_url}
            opacity={proximity}
        />
        <div>some text</div>
        <foreignObject x={cx - r} y={cy + r} width="200" height="300">
            <div style={{ background: 'white' }}>
                <div className="meta">
                    Posted {image.timestamp.format('h:mm A, ddd MMM Do')}
                </div>
                <div className="meta">By {image.sender}</div>
                {image.tideLevel && (
                    <div className="meta">Tide Level: {image.tideLevel}m</div>
                )}
            </div>
        </foreignObject>
    </g>
);

const mapStateToProps = ({ audioBaseUrl, heartbeat, images, sensorData }) => ({
    audioBaseUrl,
    heartbeat,
    sensorData,
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
        image.radius = image.radius = 12 + 13 * Math.random();
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
