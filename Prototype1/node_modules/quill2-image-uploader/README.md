# Quill2 ImageHandler Module

A module for Quill rich text editor to allow images to be uploaded to a server instead of being base64 encoded.
Adds a button to the toolbar for users to click, also handles drag, dropped and pasted images. You can add your own class for image loading.

For any Quill version (even `2.0.0-dev`). 

## Demo

![Image](/static/quill-example.gif)

### Inst


```bash
npm install quill2-image-uploader 
```

### Example

```javascript

import Quill from "quill";
import ImageUploader from "quill2-image-uploader";
import { uploadImage } from '../api/images'

Quill.register(Quill.register(
  {
    'modules/imageUploader': ImageUploader,
  },
  true,
))

const quill = new Quill('#editor', {
  // ...
  modules: {
    // ...
      imageUploader: {
        upload: async (file) => {
          try {
              const formData = new FormData()
              formData.append('image', file)
              const imageUrl = await uploadImage(formData)
              return imageUrl
          } catch (error) {
            console.log(error)
          }
        },
        loadingClass: 'uploading-image', // default 'quill-image-uploading'
      },
  },
})
```
The `loadingClass` replaces the default class. You can find default classes [here](https://github.com/zavalen/quill2-image-uploader/blob/master/dist/quill.imageUploader.min.css) and use them as example. 

By default it looks like that: 

![Image](/static/uploading.png)

Example of uploadImage function
```javascript

import axios from 'axios'

const uploadImage = (formData) => {
  return axios
    .post(`/image/store`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((data) => data.data)
}
```

Or using html
```html
<script src="/dist/quill.js"></script>
<script src="/dist/quill.imageUploader.min.js"></script>
```



That module for Quill has been forked from: https://github.com/NoelOConnell/quill-image-uploader. 

