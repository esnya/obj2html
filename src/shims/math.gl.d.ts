declare module 'math.gl' {
  export class Matrix4 {
    constructor(v: number[]);

    clone(): Matrix4;
    transformPoint<T>(v: T): T;
    transformDirection<T>(v: T): T;
    invert(): Matrix4;
    transpose(): Matrix4;
    translate(v: Vector3): Matrix4;
    multiplyLeft(m: Matrix4): Matrix4;
    multiplyRight(m: Matrix4): Matrix4;
    scale(scale: number[]): Matrix4;
    toArray(): number[];
    lookAt(optios: { eye: Vector3, center: Vector3, up: Vector3 }): Matrix4;
  }

  class Vector<T> {
    constructor(v: number[]);

    clone(): T;
    cross(v: T): T;
    normalize(): T;

    equals(v: T): boolean;

    add(v: T): T;
    subtract(v: T): T;
    scale(v: T | number): T;
  }

  export class Vector2 extends Vector<Vector2> {
    x: number;
    y: number;
  }

  export class Vector3 extends Vector<Vector3> {
    x: number;
    y: number;
    z: number;
  }
}
