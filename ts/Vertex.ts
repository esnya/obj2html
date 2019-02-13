import { Vector3, Vector2, Matrix4 } from 'math.gl';

const identity = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

export default class Vertex {
  public position: Vector3 | null;
  public normal: Vector3 | null;
  public uv: Vector2 | null;

  public constructor(position: Vector3 | null, normal: Vector3 | null, uv: Vector2 | null) {
    this.position = position;
    this.normal = normal;
    this.uv = uv;
  }

  public transform(matrix: Matrix4): Vertex {
    const position = this.position && matrix.transformPoint(this.position);

    const nm1 = this.normal && this.position && new Matrix4(identity).translate(this.position);
    const nm2 = nm1 && position && new Matrix4(identity).translate(position).invert();
    const nm = nm1 && nm2 && nm1.clone().multiplyLeft(matrix).multiplyRight(nm2);
    const normal = this.normal && nm && nm.transformPoint(this.normal);

    // console.log(this.normal && normal && this.normal.clone().subtract(normal));
    // console.log(matrix);
    return new Vertex(
      this.position && matrix.transformPoint(this.position),
      normal,
      this.uv && this.uv.clone(),
    )
  }
}
