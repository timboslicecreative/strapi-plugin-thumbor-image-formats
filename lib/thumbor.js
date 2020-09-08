const Thumbor = require("thumbor");
const THUMBOR_PRIVATE_URL = process.env.THUMBOR_PRIVATE_URL;
const THUMBOR_PUBLIC_URL = process.env.THUMBOR_PUBLIC_URL;
const THUMBOR_KEY = process.env.THUMBOR_KEY;

const publicGenerator = new Thumbor(THUMBOR_KEY, THUMBOR_PUBLIC_URL);
const privateGenerator = new Thumbor(THUMBOR_KEY, THUMBOR_PRIVATE_URL);

const thumborUrl = (imageUri, {width = 0, height = 0, filters = {}} = {}, usePublic = true) => (
    (usePublic ? publicGenerator : privateGenerator).setImagePath(imageUri).resize(width, height).buildUrl()
);

module.exports = {
    thumborUrl,
}