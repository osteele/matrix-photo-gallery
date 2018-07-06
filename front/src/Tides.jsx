import _ from 'lodash';
import moment from 'moment';
import { connect } from 'react-redux';
import { setBackground, setViewClass, togglePaused } from './data/actions';
import { time2tide } from './data/tides';
import { onceish, truncFloat } from './utils';
import { withImages, withViewClass } from './wrappers';

const SAND_COLOR = '#b8b09b';
const TIDAL_COLOR = '#b8b09b';
const OCEAN_COLOR = '#60674c';
const WAVE_COLOR = '#aab49d';
const SKY_COLOR = '#c1d3e6';

const SKY_HEIGHT = 100;
const SAND_HEIGHT = 75;
const OPEN_WATER_HEIGHT = 200;

const TIDE_PERIOD = 30 * 1000; // complete tide cycle in ms

const LIGHT_THRESH = 15;
const SENSOR_DATA_AGE = 10;

let waves = [];
let lastMouse = null;

const Tides = ({
    audioBaseUrl,
    heartbeat,
    images,
    sensorData,
    togglePaused,
    windowSize
}) => {
    // dimensions
    const windowWidth = windowSize.width;
    const windowHeight = windowSize.height;

    // tide levels
    const imageTideLevels = _.chain(images).map('tideLevel');
    const tideMin = imageTideLevels.min().value();
    const tideMax = imageTideLevels.max().value();
    const tideRange = tideMax - tideMin;

    // current tide level
    const tideLevel = window.document.location.hash.match(/[#&]demo\b/)
        ? tideMin +
          tideRange *
              (0.5 + 0.5 * Math.cos((heartbeat * 2 * Math.PI) / TIDE_PERIOD))
        : time2tide(moment());

    // tide level to y position
    const tideMarkTop = SKY_HEIGHT + SAND_HEIGHT;
    const intertidalHeight = windowHeight - tideMarkTop - OPEN_WATER_HEIGHT;
    const tide2y = level =>
        tideMarkTop + (1 - (level - tideMin) / tideRange) * intertidalHeight;
    const inverseTide2y = level =>
        tideMarkTop + ((level - tideMin) / tideRange) * intertidalHeight;
    const tideTop = tide2y(tideLevel);

    // waves
    const Wave = () => {
        const id = +new Date();
        const dx = 20 * (Math.random() - 0.5);
        let x = windowWidth * (3 * Math.random() - 1);
        let y = windowHeight;
        let color = WAVE_COLOR;
        return {
            active: () => y > 0,
            animate: () => {
                x += dx;
                y -= 10;
                if (y < 30 && Math.random() < 1 / 10) {
                    color = 'white';
                }
            },
            render: () => (
                <rect
                    key={id}
                    className="wave"
                    x={x}
                    y={y}
                    width={350}
                    height={10}
                    fill={color}
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
            <svg
                id="tides-container"
                onMouseMove={onMouseMove}
                onMouseDown={togglePaused}
            >
                <defs>
                    <Gradients />
                </defs>

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
                <rect
                    id="skySandBorder"
                    className="fullWidth"
                    y={SKY_HEIGHT - 10}
                    height="20"
                    fill="url(#skySandGradient)"
                />
                <rect
                    id="sandOceanBorder"
                    className="fullWidth"
                    y={SKY_HEIGHT + SAND_HEIGHT - 10}
                    height="20"
                    fill="url(#sandOceanGradient)"
                />

                <g id="pebbles">
                    {images.map((image, i) => {
                        const ts = image.timestamp;
                        const cx =
                            image.radius +
                            (windowWidth - 2 * image.radius) *
                                (ts.hour() / 24 + ts.minute() / 24 / 60);
                        const cy = inverseTide2y(image.tideLevel) + 50;
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

                <svg id="tide-level" y={tideTop}>
                    <path
                        d={tideTopPath.join(' ')}
                        fill="url(#tidalGradient)"
                    />
                </svg>

                <svg id="waves" opacity={hero ? 0 : 1} y={tideTop - 150}>
                    {waves.map(w => w.render())}
                </svg>

                {hero && (
                    <Hero
                        r={100}
                        {...hero}
                        cx={hero.cx > windowWidth / 2 ? 100 : windowWidth - 100}
                    />
                )}

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
            <stop offset="1.4%" stopColor={OCEAN_COLOR} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="beachGradient" gradientTransform="rotate(90)">
            <stop offset="9.5%" stopColor={SAND_COLOR} />
            <stop offset="10%" stopColor={TIDAL_COLOR} />
            <stop offset="20%" stopColor={TIDAL_COLOR} />
            <stop offset="20.5%" stopColor={OCEAN_COLOR} />
        </linearGradient>
        <linearGradient id="skySandGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={SKY_COLOR} />
            <stop offset="30%" stopColor={SAND_COLOR} />
        </linearGradient>
        <linearGradient id="sandOceanGradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={SAND_COLOR} />
            <stop offset="30%" stopColor={OCEAN_COLOR} />
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
        <foreignObject x={cx - r} y={cy + r} width="200" height="300">
            <div style={{ background: 'white' }}>
                <div className="meta">
                    Posted {image.timestamp.format('h:mm A, ddd MMM Do')}
                </div>
                <div className="meta">By {image.sender}</div>
                {image.tideLevel && (
                    <div className="meta">
                        Tide Level: {truncFloat(image.tideLevel)}m
                    </div>
                )}
            </div>
        </foreignObject>
    </g>
);

const mapStateToProps = ({
    audioBaseUrl,
    heartbeat,
    images,
    sensorData,
    windowSize
}) => ({
    audioBaseUrl,
    heartbeat,
    sensorData,
    windowSize,
    images:
        images &&
        onceish(() =>
            addRandomRadii(
                images.filter(image => image.tideLevel !== undefined)
            )
        )
});

const addRandomRadii = images => {
    images.forEach(image => {
        image.radius = image.radius = 12 + 13 * Math.random();
    });
    return images;
};

const mapDispatchToProps = dispatch => ({
    setBackground: color => dispatch(setBackground(color)),
    setViewClass: viewClass => dispatch(setViewClass(viewClass)),
    togglePaused: () => dispatch(togglePaused())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withImages(withViewClass('tides')(Tides)));
