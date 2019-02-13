import { JSDOM } from 'jsdom';
import args from './args';
import { readFile, writeFile } from './fs';
import { Vector3, Matrix4 } from 'math.gl';
import IndexedModel from './IndexedModel';
import Model from './Model';

const classPrefix = 'obj';
const scale = 100;

const identity = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

const up = new Vector3([0, 0, 1]);
const svgNS = 'http://www.w3.org/2000/svg';

function enforceDefined<T>(value: T | null): T{ 
  if (value === null) throw new Error('Unexcepted null');
  return value;
}

function average<T extends { add(a: T): T; scale(s: number): T }>(values: T[], zero: T): T {
  return values.reduce((p, c) => p.add(c), zero).scale(1.0 / values.length);
}

async function obj2css3d() {
  const [filename] = args._;
  if (!filename) throw new Error('Input filename not provided');

  const data = await readFile(filename);
  const indexed = IndexedModel.parseOBJ(data.toString('utf-8'));

  const model = Model.fromIndexed(indexed);

  const dom = new JSDOM();
  const document = dom.window.document;

  const charset = document.createElement('meta');
  charset.setAttribute('charset', 'UTF-8');
  document.head.appendChild(charset); 

  const animationStyle = document.createElement('style');
  animationStyle.innerHTML = `
/* Animation */

@keyframes rotation {
  0% { transform: rotateX(180deg) rotateY(0); }
  100% { transform: rotateX(180deg) rotateY(360deg); }
}

body {
  transform: translate3d(${scale}px, ${scale}px, 0)
}

.${classPrefix} {
  animation-name: rotation;
  animation-duration: 10s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}`;
  document.head.appendChild(animationStyle);

  const svgStyle = document.createElement('style');
  svgStyle.innerHTML = `
/* SVG Styles */

.${classPrefix}-face svg {
  stroke: black;
  stroke-width: 1px;
  fill: rgba(255, 0, 0, 0.5);
}`;
  document.head.appendChild(svgStyle);

  const styles: string[] = [''];
  styles.push(`/* 3D Transformations */`);
  styles.push(`.${classPrefix} {
  transform-origin: 0 0;
  position: relative;
}`);
styles.push(`body, .${classPrefix}, .${classPrefix} * {
  transform-style: preserve-3d;
}`);
styles.push(`@keyframes debug {
  0% { transform: translate3d(0, 0, 0); }
}`);
styles.push(`.${classPrefix}-face {
  position: absolute;
  top: 0;
  left: 0;
}`);

  const container: HTMLDivElement = document.createElement('div');
  container.classList.add(classPrefix);
  document.body.appendChild(container);

  const transformed = model.map((face, i) => {
    const normal = average(face.map(vertex => vertex.normal).map(enforceDefined), new Vector3([0, 0, 0]));
    const center = average(face.map(vertex => vertex.position).map(enforceDefined), new Vector3([0, 0, 0]));

    const scaleMatrix = new Matrix4(identity).scale([scale, scale, scale]);
    const translate = new Matrix4(identity).translate(center).invert();
    const rotate = new Matrix4(identity).lookAt({
      eye: new Vector3([0, 0, 0]),
      center: normal,
      up,
    });

    const m = [
      translate,
      scaleMatrix,
      rotate,
    ].reduce((prev, curr) => prev.clone().multiplyLeft(curr));

    const transformedVertices = face.map(vertex => vertex.transform(m));

    const positions = transformedVertices
      .map(vertex => vertex.position)
      .filter(vertex => vertex !== null)
      .map(enforceDefined);

    const [xmin, ymin, xmax, ymax] = positions.reduce(([xmin, ymin, xmax, ymax], c) => [
      Math.min(xmin, c.x),
      Math.min(ymin, c.y),
      Math.max(xmax, c.x),
      Math.max(ymax, c.y),
    ], [Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE]);

    const faceDiv = document.createElement('div');
    faceDiv.classList.add(`${classPrefix}-face`);

    const svg = document.createElementNS(svgNS, 'svg');

    const width = xmax - xmin;
    svg.setAttributeNS(svgNS, 'width', Math.ceil(width).toString());

    const height = ymax - ymin;
    svg.setAttributeNS(svgNS, 'height', Math.ceil(height).toString());

    const polygon = document.createElementNS(svgNS, 'polygon');

    const points = positions.map(v => [v.x - xmin, v.y - ymin].map(v => Math.round(v * 1000) / 1000).join(',')).join(' ');
    polygon.setAttributeNS(svgNS, 'points', points);

    const scaledCenter = average(face.map(v => v.position).filter(v => v).map(enforceDefined).map(v => v.clone().scale(scale)), new Vector3([0, 0, 0]));
    const mSVG = [
      rotate.clone().invert(),
      new Matrix4(identity).translate(scaledCenter),
    ].reduce((prev, curr) => prev.clone().multiplyLeft(curr));

    const faceSelector = `.${classPrefix}-face:nth-child(${i + 1})`;

    styles.push(`${faceSelector} {
  width: 0;
  height: 0;
  transform: matrix3d(${mSVG.toArray().join(', ')});
}`);

    styles.push(`${faceSelector} svg{
  transform: translate3d(${xmin}px, ${ymin}px, 0);
}`);

    styles.push(`.${classPrefix}-face${i + 1} {
  transform: matrix3d(${rotate.toArray().join(', ')});
}`)

    svg.appendChild(polygon);
    faceDiv.appendChild(svg);
    container.appendChild(faceDiv);

    return transformedVertices;
    // return transformedVertices.map(vertex => vertex.transform(mScaled));
  });
  // await writeFile('tmp/test.obj', new Model(...transformed).toIndexed().toOBJ('test'));

  const style: HTMLStyleElement = document.createElement('style');
  style.innerHTML = styles.join('\r\n');
  document.head.appendChild(style);

  await writeFile(args.o, `<!DOCTYPE html>\r\n${document.documentElement.outerHTML}`);
}
obj2css3d().then(() => console.log('Generated!'), e => console.error(e));
