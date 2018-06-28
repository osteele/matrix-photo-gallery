import LazyLoad from 'react-lazy-load';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
    images: state.images
});

const ImageGrid = ({ images }) => (
    <div>
        {images.slice(0, 100).map(image => (
            <LazyLoad key={image.event_id}>
                <img
                    className="ui left floated small image"
                    src={image.thumbnail_url || image.image_url}
                />
            </LazyLoad>
        ))}
    </div>
);

const ImageGridContainer = connect(mapStateToProps)(ImageGrid);

const App = () => (
    <div className="ui container">
        <ImageGridContainer />
    </div>
);

export default App;
