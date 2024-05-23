uniform float uSize;
uniform vec3 uColor;

varying vec3 vColor;

void main() {
  vec4 mvPosition = vec4(position, 1.0);
  mvPosition = instanceMatrix * mvPosition;

  vec3 pos = position;

  pos *= uSize;

  mvPosition = instanceMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * mvPosition;

  vColor = uColor;
}