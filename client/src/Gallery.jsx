import { connect } from 'react-redux';
import ButtonBar from './ButtonBar';
import { setCurrentImage } from './data/actions';
import { ImageCard, ImageGrid } from './ImageGrid';

const Gallery = ({ image, clearCurrentImage }) =>
    image ? (
        <div className="detail">
            <div className="ui breadcrumb">
                <a className="section" onClick={clearCurrentImage}>
                    Home
                </a>
                <div className="divider"> / </div>
                <div className="active section">Image</div>
            </div>
            <ImageCard
                image={image}
                imageSize="massive"
                onClick={clearCurrentImage}
            />
        </div>
    ) : (
        <div>
            <ButtonBar />
            {image && (
                <div>
                    <ImageCard image={image} imageSize="massive" />
                </div>
            )}
            <ImageGrid />
        </div>
    );

const mapStateToProps = ({ currentImage }) => ({
    image: currentImage
});

const mapDispatchToProps = dispatch => ({
    clearCurrentImage: () => dispatch(setCurrentImage(null))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Gallery);
