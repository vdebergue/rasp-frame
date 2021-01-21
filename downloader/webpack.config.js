const path = require( 'path' );

module.exports = {

    // bundling mode
    mode: 'production',
    target: 'node',
    devtool: 'inline-source-map',

    // entry files
    entry: './main.ts',

    // output bundles (location)
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'main.js',
    },

    // file resolutions
    resolve: {
        extensions: [ '.ts', '.js' ],
        fallback: { "stream": false }
    },
    node: {
      global: true
    },

    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};
