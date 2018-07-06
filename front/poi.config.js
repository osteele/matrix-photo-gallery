const webpack = require('webpack');

module.exports = {
    entry: './src/index.jsx',
    define: {
        'process.env.API_SERVER_URL': `"${process.env.API_SERVER_URL ||
            'http://127.0.0.1:5000/'}"`,
        'process.env.AUDIO_BASE_URL': `"${process.env.AUDIO_BASE_URL}"`
    },
    html: {
        title: 'Dinaconfo — Dinaocon Photo Gallery'
    }
};
