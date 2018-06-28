import _ from 'lodash';
import LazyLoad from 'react-lazy-load';
import { connect } from 'react-redux';

const sortFunction = sortOrder => {
    switch (sortOrder) {
        case 'date-asc':
            return ({ timestamp }) => timestamp;
        case 'date-desc':
            return ({ timestamp }) => -timestamp;
        case 'sender':
            return ({ sender }) => sender;
    }
};

const mapStateToProps = state => ({
    images: state.images,
    imageSize: state.imageSize,
    sortOrder: state.sortOrder
});

const ImageGrid = ({ images, imageSize, sortOrder }) => (
    <div className="ui four stackable cards">
        {_.sortBy(images, sortFunction(sortOrder)).map(image => (
            <div key={image.event_id} className="ui card">
                <div className="image">
                    <LazyLoad key={image.event_id}>
                        <img
                            className={'ui image ' + imageSize}
                            src={image.thumbnail_url || image.image_url}
                        />
                    </LazyLoad>
                </div>
                <div className="content">
                    <div className="meta">Posted {Date(image.timestamp)}</div>
                    <div className="meta">
                        By {image.sender.replace(/@(.+):matrix.org/, '$1')}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default connect(mapStateToProps)(ImageGrid);
