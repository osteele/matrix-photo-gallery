import { connect } from 'react-redux';

const mapStateToProps = state => ({
    images: state.images
});

const App = ({ images }) => (
    <div>
        {images.map(image => (
            <div key={image.event_id}>
                <img src={image.thumbnail_url || image.image_url} />
            </div>
        ))}
    </div>
);

export default connect(mapStateToProps)(App);
