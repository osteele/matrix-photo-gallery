import _ from 'lodash';
import LazyLoad from 'react-lazy-load';
import { connect } from 'react-redux';
import { setImageSize, setSortOrder } from './data/actions';

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

const logged = (msg, value) => {
    return value;
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

const ImageGridContainer = connect(mapStateToProps)(ImageGrid);

const ButtonBar = ({ setImageSize, setSortOrder }) => (
    <div>
        <div className="ui icon buttons">
            <button className="ui button" onClick={() => setImageSize('tiny')}>
                <i className="small square icon" />
            </button>
            <button className="ui button" onClick={() => setImageSize('small')}>
                <i className="medium square icon" />
            </button>
            <button
                className="ui button"
                onClick={() => setImageSize('medium')}
            >
                <i className="large square icon" />
            </button>
        </div>
        <div className="ui icon buttons">
            <button
                className="ui button"
                onClick={() => setSortOrder('date-asc')}
            >
                <i className="sort numeric up icon" />
            </button>
            <button
                className="ui button"
                onClick={() => setSortOrder('date-desc')}
            >
                <i className="sort numeric down icon" />
            </button>
            <button
                className="ui button"
                onClick={() => setSortOrder('sender')}
            >
                <i className="sort alphabet up icon" />
            </button>
        </div>
    </div>
);

const mapButtonStateToProps = state => ({
    imageSize: state.imageSize,
    sortOrder: state.sortOrder
});

const mapDispatchToProps = dispatch => ({
    setImageSize: size => dispatch(setImageSize(size)),
    setSortOrder: sortOrder => dispatch(setSortOrder(sortOrder))
});

const ButtonBarContainer = connect(
    mapButtonStateToProps,
    mapDispatchToProps
)(ButtonBar);

const App = () => (
    <div className="ui container">
        <ButtonBarContainer />
        <ImageGridContainer />
    </div>
);

export default App;
