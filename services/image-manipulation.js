const sharp = require('sharp');
const request = require("request");
const {thumborUrl} = require("../lib/thumbor");

const FORMATS = [
    {
        key: "small",
        prefix: "small_",
        width: 520,
    },
    {
        key: "medium",
        prefix: "medium_",
        width: 960,
    },
    {
        key: "large",
        prefix: "large_",
        width: 1280,
    },
];

const THUMBNAIL = {
    key: "thumbnail",
    prefix: "thumbnail_",
    width: 245,
}

const hasConfig = () => {
    console.log('plugins', strapi.plugins, 'config', strapi.config);
    return strapi.config && strapi.config.plugins && strapi.config.plugins.hasOwnProperty('thumborImageFormats')
}

const getFormats = () => (
    hasConfig() && strapi.config.plugins.thumborImageFormats.hasOwnProperty('formats') ?
        strapi.config.plugins.thumborImageFormats.formats : FORMATS
)

const getThumbnailFormat = () => (
    hasConfig() && strapi.config.plugins.thumborImageFormats.hasOwnProperty('thumbnail') ?
        strapi.config.plugins.thumborImageFormats.formats : THUMBNAIL
)

const getMetadata = buffer => sharp(buffer).metadata();

const getMetadataFromUrl = url => new Promise((resolve, reject) => {
    request({url, encoding: null}, (err, resp, buffer) => {
        if (err) return reject(err)
        getMetadata(buffer).then(resolve).catch(reject);
    });
});

const makeFormat = async (file, {prefix, width}) => {
    const publicUrl = thumborUrl(file.url, {width: width}, true);
    const privateUrl = thumborUrl(file.url, {width: width}, false);
    const metadata = await getMetadataFromUrl(privateUrl)
    return {
        name: `${prefix}${file.name}`,
        hash: `${prefix}${file.hash}`,
        ext: file.ext,
        mime: file.mime,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
        url: publicUrl,
        privateUrl: privateUrl,
    };
}

const generateFormats = (file) => Promise.all(
    getFormats().map(description =>
        makeFormat(file, description).then(format => ({
            key: description.key,
            file: format
        }))
    )
).then(formats => {
    const formatObject = {};
    for (let i in formats) formatObject[formats[i].key] = formats[i].file
    return formatObject;
});


const generateThumbnail = (file) => makeFormat(file, getThumbnailFormat());

module.exports = {
    generateFormats,
    generateThumbnail,
}