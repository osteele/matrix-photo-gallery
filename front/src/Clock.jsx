import { connect } from 'react-redux';
import { withBackground, withImages } from './wrappers';

const Clock = ({ images, heartbeat }) => {
    // images
    const n = images.length;

    // _.sortBy(images, ({ timestamp }) => timestamp.hour());

    // current hour
    const period = 30 * 1000; // real time for complete cycle
    const hour = ((heartbeat % period) / period) * 24;

    // sun's orbital radius
    const sr = 300;
    const sunAngle = -Math.PI / 2 + ((2 * Math.PI) / 12) * hour;

    // image orbital radius
    const ir = 200;

    // display center
    const cx = sr;
    const cy = sr;

    const val = 64 + Math.floor(63 * Math.cos((hour * Math.PI) / 12));
    const sky = 'rgb(' + [128, 128, 128 + val].join(',') + ')';
    return (
        <div>
            <h1>Sundial</h1>
            <div>
                {Math.floor(hour)}:{Math.floor((hour % 1) * 60)}
            </div>
            <div
                className="clock"
                style={{
                    position: 'relative',
                    width: 2 * sr + 150 + 'px',
                    height: 2 * sr + 150 + 'px',
                    background: sky
                }}
            >
                <div
                    className="sun"
                    style={{
                        left: cx + sr * Math.cos(sunAngle) + 'px',
                        top: cy + sr * Math.sin(sunAngle) + '0px'
                    }}
                />
                {images.map(image => {
                    const ts = image.timestamp;
                    const hr = ts.hour() + ts.minute() / 60;
                    const angle = -Math.PI / 2 + ((2 * Math.PI) / 12) * hr;
                    const hourDelta = (24 + hr - hour) % 24;
                    const alpha = (hourDelta - 12) / 24;
                    return (
                        alpha > 0 && (
                            <img
                                className="ui tiny circular middle aligned image"
                                key={image.event_id}
                                style={{
                                    position: 'absolute',
                                    left: cx + ir * Math.cos(angle) + 'px',
                                    top: cy + ir * Math.sin(angle) + 'px',
                                    opacity: alpha
                                }}
                                src={image.thumbnail_url}
                            />
                        )
                    );
                })}
            </div>{' '}
        </div>
    );
};

const mapStateToProps = state => ({
    heartbeat: state.heartbeat,
    images: state.images
});

export default connect(mapStateToProps)(
    withImages(withBackground('white')(Clock))
);
