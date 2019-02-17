import { JSDOM } from 'jsdom';
import { Vector3, Matrix4 } from 'math.gl';
import IndexedModel from './IndexedModel';
import Model from './Model';

const Identity = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

const SvgNS = 'http://www.w3.org/2000/svg';

function enforceDefined<T>(value: T | null): T {
  if (value === null) throw new Error('Unexcepted null');
  return value;
}

function average<T extends { add(a: T): T; scale(s: number): T }>(values: T[], zero: T): T {
  return values.reduce((p, c) => p.add(c), zero).scale(1.0 / values.length);
}

export interface Options {
  classPrefix?: string;
  scale?: number;
  number?: boolean;
  fontSize?: number;
}

const DefaultOptions = {
  classPrefix: 'obj',
  scale: 100,
  number: false,
  fontSize: 20,
};

export default function obj2css3d(obj: string, options: Options = {}): JSDOM {
  const {
    classPrefix,
    scale,
    number,
    fontSize,
  } = {
    ...DefaultOptions,
    ...options,
  };

  const indexed = IndexedModel.parseOBJ(obj);

  const model = Model.fromIndexed(indexed);

  const dom = new JSDOM();
  const { document } = dom.window;

  const charset = document.createElement('meta');
  charset.setAttribute('charset', 'UTF-8');
  document.head.appendChild(charset);

  const animationStyle = document.createElement('style');
  animationStyle.type = 'text/html';
  animationStyle.innerHTML = `
/* Animation */

@keyframes rotation {
  0% { transform: rotateY(0); }
  100% { transform: rotateY(360deg); }
}

body {
  transform: translate3d(${scale}px, ${scale}px, 0)
}

.${classPrefix} {
  transition: transform 1s ease-in-out;
  animation-name: rotation;
  animation-duration: 10s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}`;
  document.head.appendChild(animationStyle);

  const svgStyle = document.createElement('style');
  svgStyle.type = 'text/html';
  svgStyle.innerHTML = `
/* Styles */
.${classPrefix} {
  backface-visibility: hidden;
}

.${classPrefix}-face svg {
  stroke: black;
  stroke-width: 1px;
  fill: red;
}

.${classPrefix}-face svg text {
  stroke: none;
  fill: black;
  font-size: ${fontSize}px;
}`;
  document.head.appendChild(svgStyle);

  const styles: string[] = [''];
  styles.push('/* 3D Transformations */');
  styles.push(`.${classPrefix} {
  transform-origin: 0 0;
  position: relative;
}`);
  styles.push(`.${classPrefix}, .${classPrefix} * {
  transform-style: preserve-3d;
}`);
  styles.push(`.${classPrefix}-face {
  position: absolute;
  top: 0;
  left: 0;
}`);

  const container: HTMLDivElement = document.createElement('div');
  container.classList.add(classPrefix);
  document.body.appendChild(container);

  model.map((face, i) => {
    const normal = average(
      face.map(vertex => vertex.normal).map(enforceDefined),
      new Vector3([0, 0, 0]),
    );
    const center = average(
      face.map(vertex => vertex.position).map(enforceDefined),
      new Vector3([0, 0, 0]),
    );

    const scaleMatrix = new Matrix4(Identity).scale([scale, scale, scale]);
    const translate = new Matrix4(Identity).translate(center).invert();
    const rotate = new Matrix4(Identity).lookAt({
      eye: new Vector3([0, 0, 0]),
      center: normal.clone().scale(-1),
      up: new Vector3([0, 0, 1]),
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

    const [xmin, ymin, xmax, ymax] = positions.reduce((p, c) => [
      Math.min(p[0], c.x),
      Math.min(p[1], c.y),
      Math.max(p[2], c.x),
      Math.max(p[3], c.y),
    ], [Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE]);

    const faceDiv = document.createElement('div');
    faceDiv.classList.add(`${classPrefix}-face`);

    const svg = document.createElementNS(SvgNS, 'svg');

    const width = xmax - xmin;
    svg.setAttributeNS(SvgNS, 'width', Math.ceil(width).toString());

    const height = ymax - ymin;
    svg.setAttributeNS(SvgNS, 'height', Math.ceil(height).toString());

    const polygon = document.createElementNS(SvgNS, 'polygon');

    const points = positions.map(v => [v.x - xmin, v.y - ymin].join(',')).join(' ');
    polygon.setAttributeNS(SvgNS, 'points', points);

    const scaledCenter = average(
      face.map(v => v.position).filter(v => v).map(enforceDefined).map(v => v.clone().scale(scale)),
      new Vector3([0, 0, 0]),
    );
    const mSVG = [
      rotate.clone().invert(),
      new Matrix4(Identity).translate(scaledCenter),
    ].reduce((prev, curr) => prev.clone().multiplyLeft(curr));

    const faceSelector = `.${classPrefix}-face:nth-child(${i + 1})`;

    styles.push(`${faceSelector} {
  width: 0;
  height: 0;
  transform: matrix3d(${mSVG.toArray().join(', ')});
}`);

    styles.push(`${faceSelector} svg {
  transform: translate3d(${xmin}px, ${ymin}px, 0);
}`);

    const faceM = [
      rotate,
      // new Matrix4(Identity).rotateX(Math.PI),
      // new Matrix4(Identity).rotateZ(Math.PI),
    ].reduce((prev, curr) => prev.clone().multiplyLeft(curr));
    styles.push(`.${classPrefix}-face${i + 1} {
  transform: matrix3d(${faceM.toArray().join(', ')});
}`);

    svg.appendChild(polygon);
    if (number) {
      const tc = average(positions, new Vector3([0, 0, 0]));
      const text = document.createElementNS(SvgNS, 'text');
      text.innerHTML = `${i + 1}`;
      text.setAttributeNS(SvgNS, 'x', `${tc.x - xmin}`);
      text.setAttributeNS(SvgNS, 'y', `${tc.y - ymin}`);
      text.setAttributeNS(SvgNS, 'text-anchor', 'middle');
      text.setAttributeNS(SvgNS, 'dominant-baseline', 'central');
      svg.appendChild(text);
    }

    faceDiv.appendChild(svg);
    container.appendChild(faceDiv);

    return transformedVertices;
  });

  const style: HTMLStyleElement = document.createElement('style');
  style.type = 'text/html';
  style.innerHTML = styles.join('\r\n');
  document.head.appendChild(style);

  return dom;
}
