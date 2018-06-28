import _ from 'lodash';
import LazyLoad from 'react-lazy-load';
import { connect } from 'react-redux';

const IMAGE_LIMIT = 100;

const sortFunction = sortOrder => {
    switch (sortOrder) {
        case 'date-asc':
            return ({ timestamp }) => timestamp;
        case 'date-desc':
            return ({ timestamp }) =>
                -Date.parse(timestamp.replace(/\..+/, ''));
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
    <div>
        {_.sortBy(images, sortFunction(sortOrder))
            .slice(0, IMAGE_LIMIT)
            .map(image => (
                <LazyLoad key={image.event_id}>
                    <img
                        className={'ui left floated image ' + imageSize}
                        src={image.thumbnail_url || image.image_url}
                    />
                </LazyLoad>
            ))}
    </div>
);

export default connect(mapStateToProps)(ImageGrid);
