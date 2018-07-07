import { withBackground, withImages, withViewClass } from './wrappers';
import ButtonBar from './ButtonBar';
import ImageGrid from './ImageGrid';

const Gallery = () => (
    <div>
        <ButtonBar />
        <ImageGrid />
    </div>
);

export default withViewClass('gallery')(withBackground('white')(Gallery));
