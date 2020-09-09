#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function createOverrides() {
    const sourcePath = path.join(process.cwd(), 'node_modules', 'strapi-plugin-thumbor-image-formats', 'overrides');
    const targetPath = path.join(process.cwd(), 'extensions', 'upload', 'services');

    const uploadFile = 'Upload.js';
    const uploadSource = path.join(sourcePath, uploadFile);
    const uploadTarget = path.join(targetPath, uploadFile);

    const imageManipulationFile = 'image-manipulation.js';
    const imageManipulationSource = path.join(sourcePath, imageManipulationFile);
    const imageManipulationTarget = path.join(targetPath, imageManipulationFile);

    fs.mkdirSync(targetPath, {recursive: true});
    console.log(`Copying ${uploadFile} to ${uploadTarget}`);
    fs.copyFileSync(uploadSource, uploadTarget);
    console.log(`Copying ${imageManipulationFile} to ${imageManipulationTarget}`);
    fs.copyFileSync(imageManipulationSource, imageManipulationTarget);
}

const userArgs = process.argv.slice(2);
const action = userArgs[0];

if (action === 'create-overrides') {
    createOverrides()
}
