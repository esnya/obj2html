import { basename } from 'path';
import args from './args';
import { readFile, writeFile } from './fs';
import obj2html from '.';

async function runCLI(): Promise<void> {
  const [filename] = args._;
  if (!filename) throw new Error('Input filename not provided');

  const data = await readFile(filename);
  const dom = obj2html(data.toString('utf-8'), args);

  const output = args.output || `${basename(filename, '.obj')}.html`;
  await writeFile(output, `<!DOCTYPE html>\r\n${dom.window.document.documentElement.outerHTML}`);
}
// eslint-disable-next-line no-console
runCLI().then(() => console.log('Generated!'), e => console.error(e));
