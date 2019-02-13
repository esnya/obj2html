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
#### TypeScript
```ts
import { readFileSync, writeFileSync } from 'fs';
import obj2html from 'obj2html/obj2html';

const obj = readFileSync('src.obj').toString('utf-8');

const dom = obj2html(obj, {
  classPrefix: 'obj',
  scale: 100,
  number: false,
  fontSize: 20,
});

writeFileSync('dst.html', `<!DOCTYPE html>\r\n${dom.window.document.documentElement.outerHTML}`);
```

#### JavaScript
```js
const {
  readFileSync,
  writeFileSync,
} = require('fs');
const obj2html = require('obj2html').default;

const obj = readFileSync('src.obj').toString('utf-8');

const dom = obj2html(obj, {
  classPrefix: 'obj',
  scale: 100,
  number: false,
  fontSize: 20,
});

writeFileSync('dst.html', `<!DOCTYPE html>\r\n${dom.window.document.documentElement.outerHTML}`);
```
