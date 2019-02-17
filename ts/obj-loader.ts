import shortid from 'shortid';
import { loader as WebpackLoader } from 'webpack';
import { getOptions } from 'loader-utils';
import obj2html from '.';

function escape(src: string): string {
  return src.replace(/'/g, '\\\'').replace(/\n/g, '\\n');
}

export default function loader(this: WebpackLoader.LoaderContext, content: string): void {
  const callback = this.async();
  if (!callback) throw new Error('Failed to compile OBJ');

  const options = getOptions(this) || {};

  const classPrefix = `${options.classPrefix || 'obj2html'}-${shortid()}`;

  const html = obj2html(content, Object.assign({}, options, {
    classPrefix,
  }));

  const body = html.window.document.body.querySelector(`.${classPrefix}`);
  if (!body) return callback(new Error('Failed to compile OBJ'));

  const style = html.window.document.head.querySelector('style:last-child');
  if (!style) return callback(new Error('Failed to compile OBJ'));

  const source = `module.exports = {
    classPrefix: '${classPrefix.replace(/'/g, '\\\'')}',
    body: '${escape(body.outerHTML)}',
    style: '${escape(style.outerHTML)}',
  }`;

  return callback(null, source);
}
