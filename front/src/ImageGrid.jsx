import _ from 'lodash';
import LazyLoad from 'react-lazy-load';
import { connect } from 'react-redux';
import { imageGroups, sortFunction } from './sorting';
import { slugify } from './utils';

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
                Posted {image.timestamp.format('h:mm A, ddd MMM Do')}
            </div>
            <div className="meta">By {image.sender}</div>
        </div>
    </div>
);

const ImageGrid = ({ images, imageSize, sortOrder }) => {
    const groups = imageGroups(images, sortOrder);
    return (
        <div>
            {groups.length > 1 && (
                <div className="ui borderless stackable menu">
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
                    <div className="ui six doubling cards">
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
