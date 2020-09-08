# Strapi Plugin - Thumbor Image Formats

Custom image formats using a thumbor server to create the formats. This prevents multiple formats
from being stored with the storage provider. Formats are pre-requested from the thumbor server 
making them available immediately.

**Warning**: When an image is replaced via the Strapi admin UI the file's hash will change. By default, 
Strapi's upload plugin keeps the file hash for image replace operations. This causes issues with thumbor's
result caching, so the hash needs to be updated on replace.

## Installation

Using npm

```bash
npm install --save strapi-plugin-thumbor-image-formats
```

Using Yarn

```bash
yarn add strapi-plugin-thumbor-image-formats
```

## Setup

The _upload_ and  _image-manipulation_ services of the _upload_ plugin need to be overwritten
 redirecting to this plugin. You can use the installed script `create-thumbor-image-formats-overrides` 
 to create these files or manually add the files `upload.js` and `image-manipulation.js` to
 the `extensions/upload/services/` folder.
 
Remember to build Strapi after adding the overrides. e.g. using npm `npm build` or yarn `yarn build`

### Using the script to create overrides

Use the `create-thumbor-image-formats-overrides` script from the root directory of your strapi project.

**Warning**: This will replace existing files `upload.js` and `image-manipulation.js` in `extensions/upload/services/`.

```bash
create-thumbor-image-formats-overrides

> Copying upload.js to /usr/src/app/extensions/upload/services/upload.js
> Copying image-manipulation.js to /usr/src/app/extensions/upload/services/image-manipulation.js
```

### Manually creating overrides

Manually create `upload.js` in `extensions/upload/services/` and paste the code below:

```javascript
"use strict";

const {services} = require("strapi-plugin-thumbor-image-formats");
module.exports = services.Upload;
```

Manually create `image-manipulation.js` in `extensions/upload/services/` and paste the code below:

```javascript
"use strict";

const {services} = require("strapi-plugin-thumbor-image-formats");
module.exports = services.ImageManipulation;
```

### Rebuild Strapi

After the overrides are created you'll need to rebuild strapi.

Using npm

```bash
npm run build
```

Using Yarn

```bash
yarn build
```

## Configuration

### Thumbor server

Thumbor server settings are taken from the host environment variables. 
You need to provide a public url, private url and the key used for HMAC.

1. `THUMBOR_PUBLIC_URL` is the public facing url of the thumbor server, used in the formats urls.
2. `THUMBOR_PRIVATE_URL` is the private url used by the plugin behind the scenes to pre-fetch the formats to get their 
calculated height and file size. If you want your Strapi server to use the public url of the thumbor server, repeat it here.
3. `THUMBOR_KEY` is the security key used by thumbor for generating HMAC keys for image requests to prevent url tampering. Currently unsafe image access is not supported.

e.g.

```
THUMBOR_PUBLIC_URL=http://thumbor.domain.com:3001
THUMBOR_PRIVATE_URL=http://thumbor:8000
THUMBOR_KEY=abcdefghijklmnopqrstuvwxyz123
```

### Formats

By default, only _thumbnail_ and _small_ image formats are created as the Strapi admin UI uses these
to show uploaded images. It is implied you would request other variants directly from the thumbor server. 
However, you can alter these defaults and add extra formats via Strapi's plugin config file `config/plugins.js`


Plugin configuration will override defaults, so you should include the _thumbnail_ and the _small_ format
to show these formats in the Strapi admin.

**Currently, the only supported thumbor property is _width_.**

e.g. override default sizes

```
module.exports = ({env}) => ({
    thumborImageFormats: {
        thumbnail: {
            key: "thumbnail",
            prefix: "thumbnail_",
            width: 245,
        },
        formats: [{
            key: "small",
            prefix: "small_",
            width: 520,
        }]
    }
});
```

e.g. add extra formats
```
module.exports = ({env}) => ({
    thumborImageFormats: {
        thumbnail: {
            key: "thumbnail",
            prefix: "thumbnail_",
            width: 245,
        },
        formats: [
            {
                key: "small",
                prefix: "small_",
                width: 520,
            },
            {
                key: "medium",
                prefix: "medium_",
                width: 720,
            },
            {
                key: "large",
                prefix: "large_",
                width: 1080,
            },
        ]
    }
});
```

## Notes
Thanks to [nicolashmln](https://github.com/nicolashmln) for the idea 
for this plugin based on the plugin [strapi-plugin-responsive-image](https://github.com/nicolashmln/strapi-plugin-responsive-image).