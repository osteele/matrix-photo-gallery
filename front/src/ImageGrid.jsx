import _ from 'lodash';
import LazyLoad from 'react-lazy-load';
import { connect } from 'react-redux';
const sortFunction = sortOrder => {
    switch (sortOrder) {
        case 'date-asc':
            return ({ timestamp }) => timestamp.valueOf();
        case 'date-desc':
            return ({ timestamp }) => -timestamp.valueOf();
        case 'sender':
            return ({ sender }) => sender;
    }
};

const imageGroups = (images, sortOrder) => {
    switch (sortOrder) {
        case 'sender': {
            const senders = [...new Set(_.map(images, 'sender'))].sort();
            return senders.map(sender => ({
                title: sender,
                images: images.filter(image => image.sender === sender)
            }));
        }
        default:
            return [{ images }];
    }
};

const ImageCard = ({ image, imageSize }) => (
    <div className="ui card">
        <div className="image">
            <LazyLoad key={image.event_id}>
                <img
                    className={'ui image ' + imageSize}
                    src={image.thumbnail_url || image.image_url}
                />
            </LazyLoad>
        </div>
        <div className="content">
            <div className="meta">Posted {image.timestamp.format('ddd, MMM Do, h:mm A')}</div>
            <div className="meta">By {image.sender}</div>
        </div>
    </div>
);

const ImageGrid = ({ images, imageSize, sortOrder }) => (
    <div>
        {imageGroups(images, sortOrder).map(({ title, images }) => (
            <div className="section" key={title || 0}>
                {title && <h2>{title}</h2>}
                <div className="ui four stackable cards">
                    {_.sortBy(images, sortFunction(sortOrder)).map(image => (
                        <ImageCard
                            key={image.event_id}
                            image={image}
                            imageSize={imageSize}
                        />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const mapStateToProps = state => ({
    images: state.images,
    imageSize: state.imageSize,
    sortOrder: state.sortOrder
});

export default connect(mapStateToProps)(ImageGrid);
