import { connect } from 'react-redux';
import { setImageSize, setSortOrder } from './data/actions';

const ButtonBar = ({ setImageSize, setSortOrder }) => (
    <div>
        <div className="ui icon buttons" style={{ display: 'none' }}>
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
                title="Most Recent First"
                onClick={() => setSortOrder('date-desc')}
            >
                <i className="sort numeric down icon" />
                Most Recent First
            </button>
            <button
                className="ui button"
                title="Oldest First"
                onClick={() => setSortOrder('date-asc')}
            >
                <i className="sort numeric up icon" />
                Oldest First
            </button>
            <button
                className="ui button"
                title="Group by Sender"
                onClick={() => setSortOrder('sender')}
            >
                <i className="address card outline icon" />
                Group by Sender
            </button>
            <button
                className="ui button"
                title="Group by Hour"
                onClick={() => setSortOrder('hour')}
            >
                <i className="clock outline icon" />
                Group by Time of Day
            </button>
        </div>
    </div>
);

const mapStateToProps = state => ({
    imageSize: state.imageSize,
    sortOrder: state.sortOrder
});

const mapDispatchToProps = dispatch => ({
    setImageSize: size => dispatch(setImageSize(size)),
    setSortOrder: sortOrder => dispatch(setSortOrder(sortOrder))
});

const ButtonBarContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ButtonBar);

export default ButtonBarContainer;
