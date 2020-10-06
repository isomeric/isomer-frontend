"use strict";

let _ = require('lodash');
let chalk = require('chalk');
let webpack = require('webpack');

let HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
let BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
let AngularGetTextPlugin = require('angular-gettext-plugin');
//let Uglify = require("uglifyjs-webpack-plugin");
let CompressionPlugin = require("compression-webpack-plugin");

let commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString();

let PARAMS_DEFAULT = {
    resolve: {
        extensions: ['.js', '.tpl.html', '.css', '.json', '.scss', '.svg', '.ttf', '.woff'],
        alias: {
            'angular': __dirname + '/node_modules/angular',
            //'angular-schema-form':           '../node_modules/angular-schema-form',
            'angular-schema-form': __dirname + '/node_modules/angular-schema-form/dist/schema-form.js',
            'spectrum': '../node_modules/spectrum-colorpicker',
            //'angular-schema-form-bootstrap': '../node_modules/angular-schema-form-bootstrap/bootstrap-decorator.js'
            'phaser': __dirname + '/node_modules/phaser-ce/build/custom/phaser-split.js',
            'pixi': __dirname + '/node_modules/phaser-ce/build/custom/pixi.js',
            'p2': __dirname + '/node_modules/phaser-ce/build/custom/p2.js',
            'scss': __dirname + '/src/scss',
            'ResizeSensor': 'css-element-queries/src/ResizeSensor',
            'ElementQueries': 'css-element-queries/src/ElementQueries',
            'jsPlumb': 'jsplumb/dist/js/jsplumb',
            'ui.tree': 'angular-ui-tree/dist/angular-ui-tree',
            'angular-gantt': 'angular-gantt',
            'fullcalendar': __dirname + '/node_modules/fullcalendar/dist/fullcalendar.js'
        },
        modules: ['node_modules'],
    },
    target: 'web',
    entry: {
        main: ['./src/main.js']
        /*vendor: [
            'lodash',
            'jquery',
            'bootstrap',

            'angular',
            'angular-aria',

            'angular-animate',
            'angular-sanitize',
            'angular-moment',
            'fullcalendar',

            'objectpath',

            'angular-clipboard/angular-clipboard.js',

            'angular-strap/dist/angular-strap.js',
            'angular-strap/dist/angular-strap.tpl.js',

            'humanize-duration'
        ]*/
    },
    output: {
        filename: '[name].[chunkhash].js',
        sourceMapFilename: '[name].[chunkhash].map',
        jsonpFunction: 'webpackJsonp'
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
            },
        },
    },
    plugins: [
        new AngularGetTextPlugin({
            compileTranslations: {
                input: '../locale/**/LC_MESSAGES/frontend.po',
                outputFolder: 'l10n',
                format: 'json',
                compileCatalog: true
            },
            extractStrings: {
                input: 'src/**/*.@(html|js)',
                destination: '../locale/frontend.pot'
            }
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery',
            jquery: 'jquery',
            jQuery: 'jquery',
            qrcode: 'qrcode-generator',
            d3: 'd3',
            '_': 'lodash'
        }),
        new webpack.DefinePlugin({
            __COMMIT_HASH__: JSON.stringify(commitHash)
        }),
        typeof process.env.WEBPACK_ANALYZE !== 'undefined' ? new BundleAnalyzerPlugin({openAnalyzer: false}) : function () {
        },
    ],
    devServer: {
        port: 8081,
        host: '0.0.0.0',
        compress: true,
        hot: process.env.WEBPACK_HOT || true
    }
};
let PARAMS_PER_TARGET = {
    DEV: {
        devtool: 'eval-source-map',
        output: {
            filename: '[name].js'
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.SourceMapDevToolPlugin({filename: '[file].map'}),
            new webpack.LoaderOptionsPlugin({
                debug: true
            })
        ]
    },
    BUILD: {
        output: {
            path: __dirname + '/build'
        },
        devtool: 'cheap-source-map',
        plugins: [
            new CleanWebpackPlugin(),
            new webpack.LoaderOptionsPlugin({
                debug: true
            })
        ]
    },
    DIST: {
        output: {
            path: __dirname + '/dist'
        },
        plugins: [
            new CleanWebpackPlugin(),
            //new Uglify()
            new CompressionPlugin({
                filename: '[path].gz[query]',
                algorithm: 'gzip',
                test: /\.(js|css|ttf|svg|eot)$/,
                threshold: 10240,
                minRatio: 0.8
            })
        ]
    }
};

let TARGET = process.env.NODE_ENV || 'BUILD';
let params = _.mergeWith(PARAMS_DEFAULT, PARAMS_PER_TARGET[TARGET], _mergeArraysCustomizer);

_printBuildInfo(params);

module.exports = {
    resolve: params.resolve,
    entry: params.entry,
    output: params.output,
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {presets: 'es2015'},
                }],
                exclude: /(\.test.js$|node_modules)/
            },
            {
                test: require.resolve('jquery'),
                use: 'expose-loader?$!expose-loader?jQuery'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            },
            //{test: require.resolve('moment'), loader: 'expose-loader?moment'},
            {test: /\.tpl.html/, use: 'html-loader', exclude: /(index.html)/},
            //{test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff(2)?)(\?[a-z0-9]+)?$/, loader: 'file-loader'}, //  url?limit=50000'}
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff(2)).*$/,
                use: [
                    'file-loader',
                    // {
                    //     loader: 'image-webpack-loader',
                    //     options: {
                    //         bypassOnDebug: true // webpack@1.x
                    //         //disable: true, // webpack@2.x and newer
                    //     }
                    // }
                ]
            },
            //{test: /[\/]angular\.js$/, loader: "exports-loader?angular"},
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                            sassOptions: {
                                includePaths: ['scss'],
                            }
                        }
                    }
                ]
            },
            {
                test: require.resolve('tinymce/tinymce'),
                use: [
                    'exports-loader?window.tinymce',
                    'imports-loader?this=>window'
                ]
            },
            {
                test: /tinymce\/(themes|plugins)\//,
                use: [
                    'exports-loader?window.tinymce',
                    'imports-loader?this=>window'
                ]
            },
            {
                test: require.resolve('moment'),
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'moment'
                    }
                ]
            }
        ]
    },
    plugins: params.plugins,
    devServer: params.devServer,
    devtool: params.devtool
};

function _printBuildInfo(params) {
    console.log('\nStarting ' + chalk.bold.green('"' + TARGET + '"') + ' build');
    if (TARGET === 'DEV') {
        console.log('Dev server: ' +
            chalk.bold.yellow('http://localhost:' + params.devServer.port + '/webpack-dev-server/index.html') + '\n\n');
    } else {
        console.log('\n\n');
    }
}

function _mergeArraysCustomizer(a, b) {
    if (_.isArray(a)) {
        return a.concat(b);
    }
}
