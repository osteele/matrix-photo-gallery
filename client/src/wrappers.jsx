export const withImages = WrappedComponent => props =>
    props.images ? (
        <WrappedComponent {...props} />
    ) : (
        <div className="ui large active loader">
            <p />
        </div>
    );
