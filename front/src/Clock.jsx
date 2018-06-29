import _ from 'lodash';
import { connect } from 'react-redux';

const Clock = ({ images, heartbeat }) => {
    const n = images.length;
    const r = 250;
    const cx = r;
    const cy = r;
    const rate = 30 * 1000;
    const ref = ((heartbeat % rate) / rate) * 24;
    _.sortBy(images, ({ timestamp }) => timestamp.hour());
    return (
        <div>
            {' '}
            <h1>Photos by Hour</h1> <div>{ref}</div>
            <div
                className="clock"
                style={{
                    position: 'relative',
                    width: 2 * cx + 'px',
                    height: 2 * cy + 150 + 'px'
                }}
            >
                {' '}
                {images.map((image, i) => {
                    const ts = image.timestamp;
                    const t = ts.hour() + ts.minute() / 60;
                    const angle = Math.PI / 2 - (2 * Math.PI * t) / 24;
                    const period = 30 * 1000;
                    const ta = (heartbeat % period) / period + i / n; // console.info('ta', ta);
                    return (
                        <img
                            className="ui tiny circular middle aligned image"
                            key={image.event_id}
                            style={{
                                position: 'absolute',
                                left: cx + r * Math.cos(angle) + 'px',
                                top: cy + r * Math.sin(angle) + 'px',
                                opacity: ta % 1
                            }}
                            src={image.thumbnail_url || image.image_url}
                        />
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
export default connect(mapStateToProps)(Clock);
