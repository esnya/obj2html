# obj2html

Convert 3D models of Wavefront obj to HTML using CSS3 transforms.

## Install
```
$ npm install -g obj2html
```

## Usage
### CLI
```
$ obj2html -o model.html model.obj
```

### API
#### JavaScript
```js
import { readFileSync, writeFileSync } from 'fs';
import obj2html from 'obj2html';

const obj = readFileSync('src.obj').toString('utf-8');

const dom = obj2html(obj, {
  classPrefix: 'obj',
  scale: 100,
  number: false,
  fontSize: 20,
});

writeFileSync('dst.html', `<!DOCTYPE html>\r\n${dom.window.document.documentElement.outerHTML}`);
```

#### TypeScript
```ts
import { readFileSync, writeFileSync } from 'fs';
import obj2html from 'obj2html/ts';

const obj = readFileSync('src.obj').toString('utf-8');

const dom = obj2html(obj, {
  classPrefix: 'obj',
  scale: 100,
  number: false,
  fontSize: 20,
});

writeFileSync('dst.html', `<!DOCTYPE html>\r\n${dom.window.document.documentElement.outerHTML}`);
```

#### Webpack Loader
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.obj$/,
        loader: 'obj2html/obj-loader',
        options: {
          classPrefix: 'obj2html',
          fontSize: 20,
          number: falce,
          scale: 100,
        },
      },
    ],
  },
};
```

```js
import { classPrefix, body, style } from 'path/to/model.obj';

console.log(classPrefix); // obj2html-XXXXXXXX
console.log(body); // <div class="obj2html-XXXXXXXX"><div class="...
console.log(style); // <style>...
```
