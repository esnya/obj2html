import yargs from 'yargs';

export default yargs
  .option('c', {
    alias: 'class-prefix',
    default: 'obj',
    description: 'Prefix for CSS classes',
  })
  .option('o', {
    alias: 'output',
    default: '.',
    description: 'Path for output HTML file',
  })
  .option('s', {
    alias: 'scale',
    default: 100,
    description: 'Scale',
  })
  .argv;
