import _ from 'lodash';
import { connect } from 'react-redux';

const Tides = ({ images, heartbeat }) => {
    const width = 800;
    const height = 500;
    // tide levels
    const levels = _.chain(images).map('tideLevel');
    const tideMin = levels.min().value();
    const tideMax = levels.max().value();
    const tideRange = tideMax - tideMin;
    // current tide level
    const period = 30 * 1000;
    const tideLevel =
        tideMin + tideRange * Math.cos((heartbeat * 2 * Math.PI) / period);
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
            {images.map((image, i) => {
                const x = (i * width) / images.length;
                const y = ((image.tideLevel - tideMin) / tideRange) * height;
                const alpha =
                    1 - (image.tideLevel - tideLevel) ** 2 / tideRange ** 2;
                return (
                    image.tideLevel && (
                        <img
                            className="ui small circular image"
                            key={image.event_id}
                            style={{
                                position: 'absolute',
                                left: x + 'px',
                                top: y + 'px',
                                display: alpha > 0 ? 'block' : 'none',
                                opacity: Math.max(0, alpha)
                            }}
                            src={image.thumbnail_url}
                        />
                    )
                );
            })}
        </section>
    );
};

const mapStateToProps = state => ({
    heartbeat: state.heartbeat,
    images: state.images
});
export default connect(mapStateToProps)(Tides);
