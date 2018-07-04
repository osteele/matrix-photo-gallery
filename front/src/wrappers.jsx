export const withBackground = color => WrappedComponent => props => {
    props.setBackground(color);
    return <WrappedComponent {...props} />;
};

export const withImages = WrappedComponent => props =>
    props.images ? (
        <WrappedComponent {...props} />
    ) : (
        <div className="ui large active loader">
            <p />
        </div>
    );

export const withViewClass = viewClass => WrappedComponent => props => {
    props.setViewClass(viewClass);
    return <WrappedComponent {...props} />;
};
