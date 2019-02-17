import { JSDOM } from 'jsdom';
import { expect } from 'chai';
import obj2html from '../ts';

const obj = `
mtllib test.mtl
o test
v 0.000000 -0.353553 -1.000000
v 0.866025 -0.353553 0.500000
v -0.866025 -0.353553 0.500000
v 0.000000 1.060660 0.000000
vn 0.8165 0.3333 -0.4714
vn -0.0000 0.3333 0.9428
vn -0.8165 0.3333 -0.4714
vn 0.0000 -1.0000 0.0000
usemtl None
s off
f 1//1 4//1 2//1
f 2//2 4//2 3//2
f 3//3 4//3 1//3
f 1//4 2//4 3//4
`;

const classPrefix = 'obj2html-unittest';

describe('obj2html', () => {
  let dom: JSDOM;
  it('compiles obj into html', () => {
    dom = obj2html(obj, {
      classPrefix,
      fontSize: 25,
      scale: 50,
      number: true,
    });
  });

  it('returns instance of JSDOM', () => {
    expect(dom).to.be.an.instanceof(JSDOM);
  });

  it('returns document contains root div element with classPrefix', () => {
    const root = dom.window.document.body.querySelector(`.${classPrefix}`);
    expect(root).not.to.be.undefined;
    expect(root).not.to.be.null;
  });

  it('returns document contains svg element with classPrefix', () => {
    const svgs = dom.window.document.body.querySelectorAll(`.${classPrefix} .${classPrefix}-face svg`);
    expect(svgs).has.length(4);
  });

  it('returns document contains style elements', () => {
    const styles = dom.window.document.head.querySelectorAll('style');
    expect(styles).has.length(3);
  });
});
