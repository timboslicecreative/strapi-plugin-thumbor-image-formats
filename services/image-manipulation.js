const sharp = require('sharp');
const request = require("request");
const Thurl = require("thurl");

const ALLOWED_FORMATS = [
    'jpeg', 'png', 'webp', 'tiff',
];

const THUMBNAIL = {
    key: "thumbnail", settings: {width: 245, quality: 90}
}
const FORMATS = [
    {key: "small", settings: {width: 520}},
    {key: "medium", settings: {width: 960}},
    {key: "large", settings: {width: 1280}}
];

let thurlPrivate = null;
let thurlPublic = null;
let fileUrl = null;

const hasConfig = () => strapi.config && strapi.config.plugins && strapi.config.plugins.hasOwnProperty('thumborImageFormats');
const getConfig = () => hasConfig() ? strapi.config.plugins.thumborImageFormats : {};

const configureThurl = () => {
    if (!thurlPublic || !thurlPrivate) {
        const {thumborHostPrivate, thumborHostPublic, thumborSecurityKey} = getConfig();
        if (thumborHostPrivate && thumborHostPublic) {
            thurlPublic = new Thurl(thumborHostPublic, thumborSecurityKey);
            thurlPrivate = new Thurl(thumborHostPrivate, thumborSecurityKey);
        }
    }
    return {thurlPublic, thurlPrivate};
}

const configureFileUrl = () => {
    if (!fileUrl) {
        const {localFileHost} = getConfig();
        fileUrl = localFileHost ? (url) => `${localFileHost}${url}` : (url) => url
    }
    return fileUrl;
}

const getFormats = () => {
    const {formats} = getConfig();
    return formats || FORMATS;
}

const getThumbnailFormat = () => {
    const {thumbnail} = getConfig();
    return thumbnail || THUMBNAIL;
}

const getMetadata = buffer => sharp(buffer).metadata().catch(()=>({})); // need catch to ignore errors
const getMetadataFromUrl = url => new Promise((resolve, reject) => {
    request({url, encoding: null}, (err, resp, buffer) => {
        if (err) return reject(err)
        getMetadata(buffer).then(resolve).catch(reject);
    });
});

const makeFormat = async (file, {settings}) => {
    const {thurlPublic, thurlPrivate} = configureThurl();
    const fileUrl = configureFileUrl();
    const publicUrl = thurlPublic.build(fileUrl(file.url), settings);
    const privateUrl = thurlPrivate.build(fileUrl(file.url), settings);
    const metadata = await getMetadataFromUrl(privateUrl)
    return {
        name: file.name,
        hash: file.hash,
        ext: file.ext,
        mime: file.mime,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
        url: publicUrl,
    };
}

const generateFormats = async (file) => {
    if (!(await isAllowedFormat(file.buffer))) return null;
    else return Promise.all(
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
}

const generateThumbnail = async (file) => {
    if (!(await isAllowedFormat(file.buffer))) return null;
    else return makeFormat(file, getThumbnailFormat());
}

const isAllowedFormat = async buffer => {
    const {format} = await getMetadata(buffer);
    return format && ALLOWED_FORMATS.includes(format.toLowerCase());
};

module.exports = {
    generateFormats,
    generateThumbnail,
}