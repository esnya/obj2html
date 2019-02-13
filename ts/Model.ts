import { Vector2, Vector3 } from 'math.gl';
import Vertex from './Vertex';
import IndexedModel from './IndexedModel';

function mapIndex<T>(index: number | null, list: T[]): T | null {
  if (index === null || index >= list.length) return null;
  return list[index];
}

function findIndexOrInsert<T>(list: T[], value: T, equals = (a: T, b: T) => a === b): number {
  const foundIndex = list.findIndex((a => equals(a, value)));
  if (foundIndex >= 0) return foundIndex;

  return list.push(value) - 1;
}

interface HasEquals<T> {
  equals(a: T): boolean;
}

function objectEquals<T extends HasEquals<T>>(a: T, b: T): boolean {
  return a.equals(b);
}

export default class Model extends Array<Vertex[]> {
  public toIndexed(): IndexedModel {
    const vertices: Vector3[] = [];
    const normals: Vector3[] = [];
    const uvs: Vector2[] = [];

    const faces = this.map(face => face.map(vertex => ({
      vertex: vertex.position && findIndexOrInsert(vertices, vertex.position, objectEquals),
      normal: vertex.normal && findIndexOrInsert(normals, vertex.normal, objectEquals),
      uv: vertex.uv && findIndexOrInsert(normals, vertex.uv, objectEquals),
    })));

    return new IndexedModel(faces, vertices, normals, uvs);
  }

  public static fromIndexed(indexed: IndexedModel): Model {
    const {
      vertices,
      normals,
      uvs,
    } = indexed;

    const faces = indexed.faces.map(face => face.map(indexList => new Vertex(
      mapIndex(indexList.vertex, vertices),
      mapIndex(indexList.normal, normals),
      mapIndex(indexList.uv, uvs),
    )));

    return new Model(...faces);
  }
}
