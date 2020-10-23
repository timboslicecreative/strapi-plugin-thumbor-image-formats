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

Use the `strapi-plugin-thumbor-image-formats create-overrides` command from the root directory of your strapi project.

**Warning**: This will replace existing files `upload.js` and `image-manipulation.js` in `extensions/upload/services/`.

```bash
strapi-plugin-thumbor-image-formats create-overrides

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

You need to provide a public url, private url for the thumbor server and an optional thumbor security key
It is highly recommended you use HMAC security with your thumbor server.

* `thumborHostPublic` is the public facing url of the thumbor server, used in the formats urls.
* `thumborHostPrivate` is the private url used by the plugin behind the scenes to pre-fetch the formats to get their 
calculated height and file size. If you want your Strapi server to use the public url of the thumbor server, repeat it here.
* `thumborSecurityKey` is the security key used by thumbor for generating HMAC keys for image requests to prevent url 
tampering. Without this setting thumbor 'unsafe' urls will be used.

Thumbor configuration example:

```javascript
// config/plugins.js 

module.exports = ({env}) => ({
    thumborImageFormats: {
        thumborHostPublic: 'https://thumbor.mydomain.com',
        thumborHostPrivate: 'http://server-thumbor:8000',
        // optional security key
        thumborSecurityKey: 'abcdefghijklmnopqrstuvwxyz123',
        // ...
    }
})
```

It's highly recommended that you store your configuration in the host environment variables.

```dotenv
# Host environment variables

THUMBOR_PUBLIC_URL=https://thumbor.mydomain.com
THUMBOR_PRIVATE_URL=http://server-thumbor:8000
THUMBOR_KEY=abcdefghijklmnopqrstuvwxyz123
```
```javascript
// config/plugins.js

module.exports = ({env}) => ({
    thumborImageFormats: {
        thumborHostPublic: env('THUMBOR_PUBLIC_URL'),
        thumborHostPrivate: env('THUMBOR_PRIVATE_URL'),
        thumborSecurityKey: env('THUMBOR_KEY'),
        // ...
    }
})
```

### Local file upload provider

If you are using a local file upload provider, like the default used by Strapi's upload plugin, you 
need to specify a host for thumbor to retrieve the images from. You do so by setting the `localFileHost`
property in the plugin config. This host needs to be accessible from your thumbor server.

```javascript
module.exports = ({env}) => ({
    thumborImageFormats: {
        // ...
        localFileHost: 'http://strapi.mydomain:1337',
        // ...
    }
})
```


### Formats

By default, __thumbnail__ and __small__, __medium__, __large__ image formats are created in line with Strapi's default
formats. However, only __thumbnail__ and __small__ are required for the admin to show the resized images. 

If you do not use the additional formats it is recommended to overwrite the formats in the plugin configuration to reduce
the amount of formats held in the Thumbor servers cache/result storage. 

You can override the defaults and add extra formats via Strapi's plugin config file `config/plugins.js`. 
When defining a format you need to specify the `key` and its `settings`. 

* `key` is the property the format will be stored on the original image upload object
* `settings` are the image manipulation settings supported by thumbor. These are passed to the [thurl](https://www.npmjs.com/package/thurl) 
thumbor url generator. To see available options read the package documentation at [https://www.npmjs.com/package/thurl](https://www.npmjs.com/package/thurl).

**Note:** Plugin configuration will override defaults, so you should include the _thumbnail_ and the _small_ formats
to show these formats in the Strapi admin.

override default sizes:

```javascript
module.exports = ({env}) => ({
    thumborImageFormats: {
        // ... 
        thumbnail: {
            key: "thumbnail",
            settings: {width: 245, quality: 80},
        },
        formats: [{
            key: "small",
            settings: {width: 520},
        }]
    }
});
```

add extra formats:
```javascript
module.exports = ({env}) => ({
    thumborImageFormats: {
        // ...
        thumbnail: {
            key: "thumbnail",
            width: 245,
        },
        formats: [
            {
                key: "small",
                settings: { width: 520}
            },
            {
                key: "medium",
                settings: {width: 720}
            },
            {
                key: "large",
                setting: {width: 1080}
            },
            {
                key: "grayscale",
                setting: {width: 1080, grayscale: ''}
            },
            {
                key: "blured",
                setting: {width: 1080, blur: [25,50]}
            },
        ]
    }
});
```

## Notes
Thanks to [nicolashmln](https://github.com/nicolashmln) for the idea 
for this plugin based on the plugin [strapi-plugin-responsive-image](https://github.com/nicolashmln/strapi-plugin-responsive-image).