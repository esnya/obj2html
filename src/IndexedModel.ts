import chunk from 'lodash/chunk';
import IndexList from "./IndexList";
import { Vector3, Vector2 } from "math.gl";

const linePattern = /^(v|vn|uv|f) (.*)$/;
const valuePattern = /([^ ]+)*/g;
const indexListPattern = /^([0-9]*)\/([0-9]*)\/([0-9]*)$/;

function parseIndex(data: string): number | null {
  if (!data) return null;
  return Number(data) - 1;
}

function parseFace(data: string): IndexList[] {
  const m = data.match(valuePattern);
  if (!m) throw new Error('Parse error');

  return chunk(m, 2).map(a => a[0]).map((value) => {
    const n = value.match(indexListPattern);
    if (!n) throw new Error('Parse error');

    const vertex = parseIndex(n[1]);
    const uv = parseIndex(n[2]);
    const normal = parseIndex(n[3]);
  
    return {
      normal,
      uv,
      vertex,
    };
  });
}

function parseVectors(pattern: RegExp): (data: string) => number[] {
  return (data) => {
    const m = data.match(pattern);
    if (!m) throw new Error('Parse error');

    return m.slice(1).map(value => Number(value));
  };
}
const parseVector2s = parseVectors(/^([0-9\-\.]+) ([0-9\-\.]+)$/);
const parseVector3s = parseVectors(/^([0-9\-\.]+) ([0-9\-\.]+) ([0-9\-\.]+)$/);

function indexToOBJIndex(index: number | null): string {
  if (index === null) return '';
  return `${index + 1}`;
}

export default class IndexedModel {
  faces: IndexList[][];
  vertices: Vector3[];
  normals: Vector3[];
  uvs: Vector2[];

  constructor(faces: IndexList[][], vertices: Vector3[], normals: Vector3[], uvs: Vector2[]) {
    this.faces = faces;
    this.vertices = vertices;
    this.normals = normals;
    this.uvs = uvs;
  }

  toOBJ(name: string): string {
    const vertices = this.vertices.map(v => `v ${v.x} ${v.y} ${v.z}`);
    const normals = this.normals.map(v => `vn ${v.x} ${v.y} ${v.z}`);
    const uvs = this.uvs.map(v => `uv ${v.x} ${v.y}`);
    const faces = this.faces.map((face) => {
      const indexLists = face.map(indexList => `${indexToOBJIndex(indexList.vertex)}/${indexToOBJIndex(indexList.uv)}/${indexToOBJIndex(indexList.normal)}`)
      return `f ${indexLists.join(' ')}`;
    });

    return [
      `o ${name}`,
      ...vertices,
      ...normals,
      ...uvs,
      ...faces,
    ].join('\n');
  }

  static parseOBJ(obj: string): IndexedModel {
    const faces: IndexList[][] = [];
    const normals: Vector3[] = [];
    const uvs: Vector2[] = [];
    const vertices: Vector3[] = [];
  
    const lines = obj.split(/\n/g);
    lines.forEach((line) => {
      const m = line.match(linePattern);
      if (!m) return;
  
      const type = m[1];
      const data = m[2];
  
      switch (type) {
        case 'v':
          vertices.push(new Vector3(parseVector3s(data)));
          break;
        case 'vn':
          normals.push(new Vector3(parseVector3s(data)));
          break;
        case 'uv':
          uvs.push(new Vector2(parseVector2s(data)));
          break;
        case 'f':
          faces.push(parseFace(data));
          break;
      }
    });
  
    return new IndexedModel(
      faces,
      vertices,
      normals,
      uvs,
    );
  }
}
