import yargs from 'yargs';
import { Options } from '.';

interface Args extends Options {
  _: string[];
  output?: string;
}

export default yargs
  .option('c', {
    alias: 'class-prefix',
    default: 'obj',
    description: 'Prefix for CSS classes',
    type: 'string',
  })
  .option('f', {
    alias: 'font-size',
    default: 20,
    description: 'Font size of number of faces',
    type: 'number',
  })
  .option('n', {
    alias: 'number',
    default: false,
    description: 'Display number of faces',
    type: 'boolean',
  })
  .option('o', {
    alias: 'output',
    description: 'Path for output HTML file',
    type: 'string',
  })
  .option('s', {
    alias: 'scale',
    default: 100,
    description: 'Scale',
    type: 'number',
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .argv as any as Args;
