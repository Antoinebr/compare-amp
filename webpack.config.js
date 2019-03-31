const path = require('path');
const dev = process.env.NODE_ENV === "development";
const prod = process.env.NODE_ENV === "production";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
    mode: dev ? "development" : "production",

    // dev server used in developement 
    // see npm script : webpack-dev-server --open --hot --port 7656
    devServer: {
        // contentBase & watchContentBase are needed to also reload the changes in the HTML
        contentBase: './src/',
        watchContentBase: true,

        // overlay adds the build eror on top 
        overlay: {
            warnings: false,
            errors: true
        }
    },
    entry: {
        // entry : where the APP starts 
        // babel-plyfill transpile async - await... to ES5 ( without generatos will be missing)
        app: ['./src/js/main.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'), // the folder where we will output 
        filename: 'app.bundle.[hash].js', // the file name with the hash at the end 
    },
    resolve: {

        alias: {
            //  alias alow to create a "path shortcut"
            //  e.g : import lol from "@/js/lol.js"
            '@css': path.resolve('./src/css/'),
            '@': path.resolve('./src/')
        }
    },

    devtool: dev ? "cheap-module-eval-source-map" : false, // generate a sourcemap for for dev only

    module: {

        rules: [


            /*
            | 
            | HTML loader 
            | 
            | Need to work with the HtmlWebpackPlugin 
            |
            */
            {
                test: /\.html$/,
                loader: "html-loader"
            },

           

            /*
            | 
            | CSS Loader 
            |
            */
            {
                test: /\.css$/,
                use: [{
                        // style-loader is to apply (from js) the style we only need it in dev
                        // in production we don't want to load CSS from JS then we use MiniCssExtractPlugin.loader to generate real CSS files
                        loader: dev ? 'style-loader' : MiniCssExtractPlugin.loader
                    },
                    {
                        loader: "css-loader", // to be able to load the css files 
                        options: {
                            sourceMap: true,
                            minimize: !dev
                        }
                    },
                ]
            },


            /*
            | 
            | SCSS (SASS) Loader with postcss & autoprefixer
            |
            */
            {
                test: /\.scss$/,
                use: [{
                        loader: dev ? 'style-loader' : MiniCssExtractPlugin.loader // to apply the style 
                    },
                    {
                        loader: "css-loader", // to be able to load the css giles 
                        options: {
                            importLoaders: 1,
                            sourceMap: true,
                            minimize: !dev
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [
                                require('autoprefixer')({
                                    browsers: ['last 2 versions', 'ie > 8']
                                })
                            ],
                            sourceMap: true
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },


            /*
            | 
            | URL loader 
            |
            | works like file-loader, but can return a DataURL (base64) if the file is smaller than a byte limit.
            | 
            */
            {
                test: /\.(png|jpg|gif|svg)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: '[name].[hash:7].[ext]' // to customize the files names during the "renaming"
                    }
                }]
            },


            /*
            | 
            | IMG loader 
            |
            | To optimize imgs which are bigger than the url-loader option.limit ( not suitable for base64)
            | Images are optimized if the rights imagemin plugins are installed see : https://www.npmjs.com/search?q=keywords:imageminplugin
            |
            */
            {
                loader: 'img-loader',
                options: {
                    enabled: !dev,
                    plugins: [
                        require('imagemin-mozjpeg')({
                            progressive: true,
                            quality: 40
                        }),
                        require('imagemin-pngquant')({
                            floyd: 0.5,
                            speed: 2
                        }),
                        require('imagemin-svgo')({
                            plugins: [{
                                    removeTitle: true
                                },
                                {
                                    convertPathData: false
                                }
                            ]
                        })
                    ]
                }
            },


            /*
            | 
            | FONT loader 
            |
            |
            */
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }




        ],

    },
    plugins: [

        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: dev ? '[name].css' : '[name].[chunkhash].css', // [hash]
            chunkFilename: dev ? '[id].css' : '[id].[hash].css',
        }),

        // to inject the right bundle hith the hash etc... in dist
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        })
        
    ]
};


if (!dev) {

    // will create a manifest.json with the reference of the current hashes
    // Usefull when we are doing backend integration
    config.plugins.push(new ManifestPlugin());

    // remove the dist folder at build 
    config.plugins.push(new CleanWebpackPlugin('dist', {}));

    config.plugins.push(new OptimizeCSSAssetsPlugin({}));


    // Visualize size of webpack output files with an interactive zoomable treemap.
    // https://github.com/webpack-contrib/webpack-bundle-analyzer
    config.plugins.push(new BundleAnalyzerPlugin());

}

module.exports = config;