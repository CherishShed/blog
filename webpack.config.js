const { CKFinder } = require('@ckeditor/ckeditor5-ckfinder');

module.exports = {
    entry: './ckfinderscript.js', // Specify your JavaScript file as the entry point
    output: {
        filename: 'bundle.js', // Specify the output bundle file name
        path: CKFinder.resolve(__dirname, 'dist'), // Specify the output directory
    },
};