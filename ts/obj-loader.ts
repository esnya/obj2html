import shortid from 'shortid';
import { getOptions } from 'loader-utils';
import obj2html from '.';

export default function loader(content): void {
  const callback = this.async();
  const options = getOptions(this) || {};

  const classPrefix = `${options.classPrefix || 'obj2html'}-${shortid()}`;

  const html = obj2html(content, Object.assign({}, options, {
    classPrefix,
  }));

  const body = html.window.document.body.querySelector(`.${classPrefix}`).outerHTML;

  const style = html.window.document.head.querySelector('style:last-child').outerHTML;

  const source = `module.exports = {
    classPrefix: '${classPrefix.replace(/'/g, '\\\'')}',
    body: '${body.replace(/'/g, '\\\'').replace(/\n/g, '\\n')}',
    style: '${style.replace(/'/g, '\\\'').replace(/\n/g, '\\n')}',
  }`;

  callback(null, source);
}
