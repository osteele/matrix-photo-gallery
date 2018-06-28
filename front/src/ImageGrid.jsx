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
            <LazyLoad key={image.event_id}>
                <div className="ui card">
                    <div className="image">
                        <img
                            className={'ui image ' + imageSize}
                            src={image.thumbnail_url || image.image_url}
                        />
                    </div>
                    <div className="content">
                        <div className="meta">
                            <span className="date">
                                Posted {Date(image.timestamp)}
                            </span>
                        </div>
                    </div>
                </div>
            </LazyLoad>
        ))}
    </div>
);

export default connect(mapStateToProps)(ImageGrid);
