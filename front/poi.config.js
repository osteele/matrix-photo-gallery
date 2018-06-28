const webpack = require('webpack');

module.exports = {
    entry: './src/index.jsx',
    env: {
        API_SERVER_URL: 'http://127.0.0.1:3000/'
    }
};
