uniform vec3 uPointer;
uniform vec3 uColor;
uniform float uRotation;
uniform float uSize;
uniform float uHover;

varying vec3 vColor;

#define PI 3.14159265359

// Define the rotation functions
vec3 rotateX(vec3 point, float angle) {
    mat3 rotationMatrix = mat3(
        1., 0., 0.,
        0., cos(angle), -sin(angle),
        0., sin(angle), cos(angle)
    );
    return rotationMatrix * point;
}

vec3 rotateZ(vec3 point, float angle) {
    mat3 rotationMatrix = mat3(
        cos(angle), -sin(angle), 0.,
        sin(angle), cos(angle), 0.,
        0., 0., 1.
    );
    return rotationMatrix * point;
}


void main() {
  // First, calculate `mvPosition` to get the distance between the instance and the
  // projected point `uPointer`.
  vec4 mvPosition = vec4(position, 1.0);
  mvPosition = instanceMatrix * mvPosition;

  // Rotate `uPointer` to match the rotations of the mesh
  vec3 rotatedPointer = rotateZ(rotateX(uPointer, PI * 0.5), PI * 0.5);

  // Distance between the point projected from the mouse and each instance
  float d = distance(rotatedPointer, mvPosition.xyz);

  vec3 pos = position;

  float scale = uSize;

  if (d < 5.0) { // Adjust the 50.0 value to control the hover radius
    scale *= 2.0;// Adjust the 0.1 value to control the speed of the animation

    // Calculate the direction from the instance to the mouse
    vec3 direction = normalize(mvPosition.xyz - rotatedPointer);

    // Move the instance in the opposite direction
    pos += direction * 10.0; // Adjust the 0.1 value to control the speed of the movement
  }

   pos *= scale;
 
  // Re-define `mvPosition` with the scaled and rotated position.
  mvPosition = instanceMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * mvPosition;

  vColor = uColor;
}