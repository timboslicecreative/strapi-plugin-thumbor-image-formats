'use strict';

async function createFormats(file) {
    const {
        generateThumbnail,
        generateFormats,
    } = strapi.plugins.upload.services['image-manipulation'];

    file.formats = {
        thumbnail: await generateThumbnail(file),
        ...await generateFormats(file)
    }
}

async function setDimensions(file) {
    const {getDimensions} = strapi.plugins.upload.services['image-manipulation'];
    const {width, height} = await getDimensions(file.buffer);
    file.width = width;
    file.height = height;
}

async function uploadFileAndPersist(fileData) {
    const {config} = strapi.plugins.upload;

    fileData.provider = config.provider;
    await strapi.plugins.upload.provider.upload(fileData);
    await setDimensions(fileData);
    await createFormats(fileData);

    delete fileData.buffer;
    return this.add(fileData);
}


async function replace(id, {data, file}) {
    const dbFile = await this.fetch({id});
    if (!dbFile) {
        throw strapi.errors.notFound('file not found');
    }

    const {config} = strapi.plugins.upload;
    let fileData = await this.enhanceFile(file, data);

    if (dbFile.provider === config.provider) {
        await strapi.plugins.upload.provider.delete(dbFile);
    }

    fileData.provider = config.provider;
    await strapi.plugins.upload.provider.upload(fileData);
    await setDimensions(fileData)
    await createFormats(fileData)

    delete fileData.buffer;
    return this.update({id}, fileData);
}


module.exports = {
    ...strapi.plugins.upload,
    uploadFileAndPersist,
    replace,
};
