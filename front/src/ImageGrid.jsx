import _ from 'lodash';
import LazyLoad from 'react-lazy-load';
import { connect } from 'react-redux';
const sortFunction = sortOrder => {
    switch (sortOrder) {
        case 'date-asc':
        case 'hour':
            return ({ timestamp }) => timestamp.valueOf();
        case 'date-desc':
            return ({ timestamp }) => -timestamp.valueOf();
        case 'sender':
            return ({ sender }) => sender;
    }
};

const imageGroups = (images, sortOrder) => {
    switch (sortOrder) {
        case 'hour': {
            const hours = { morning: 6, afternoon: 12, evening: 18, night: 24 };
            return Object.keys(hours).map(title => ({
                title,
                images: images.filter(
                    image =>
                        Math.floor(image.timestamp.hour() / 6) * 6 ===
                        hours[title]
                )
            }));
            return [{ images }];
        }
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
            <div className="meta">
                Posted {image.timestamp.format('ddd, MMM Do, h:mm A')}
            </div>
            <div className="meta">By {image.sender}</div>
        </div>
    </div>
);

const slugify = key => String(key).replace(/[^0-9a-z]+/i, '-');

const ImageGrid = ({ images, imageSize, sortOrder }) => {
    const groups = imageGroups(images, sortOrder);
    return (
        <div>
            {groups.length > 1 && (
                <div className="ui secondary menu">
                    {groups.map(({ title }) => (
                        <a className="item" href={'#' + slugify(title)}>
                            {title}
                        </a>
                    ))}
                </div>
            )}
            {groups.map(({ title, images }) => (
                <div
                    className="section"
                    key={slugify(title || 0)}
                    id={slugify(title || 0)}
                >
                    {title && <h2>{title}</h2>}
                    <div className="ui four stackable cards">
                        {_.sortBy(images, sortFunction(sortOrder)).map(
                            image => (
                                <ImageCard
                                    key={image.event_id}
                                    image={image}
                                    imageSize={imageSize}
                                />
                            )
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const mapStateToProps = state => ({
    images: state.images,
    imageSize: state.imageSize,
    sortOrder: state.sortOrder
});

export default connect(mapStateToProps)(ImageGrid);
