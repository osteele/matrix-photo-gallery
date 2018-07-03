const withBackground = color => WrappedComponent => props => {
    props.setBackground(color);
    return <WrappedComponent {...props} />;
};

export default withBackground;
