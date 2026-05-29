import * as THREE from 'three';

// ============================================================
//  1. CONFIG — Extracted 1:1 from original site
// ============================================================
const W = {
  BlobSizeInitial: 1.0,
  BlobSizeHover: 0.89,
  uFresnelOffset: -1.4,
  uFresnelOffsetS: -1.367, // Mobile fresnel offset
  uFresnelMultiplier: 1.435,
  uFresnelPower: 1.239,
  uRefraction: 0.03,
  uRefractionColorShift: 0.75,
  uDistortionFrequency: 2.174,
  uDistortionStrength: 1.63,
  uDisplacementFrequency: 0.186,
  uDisplacementStrength: 0.042,
  uDisplacementScale: 0.675,
  uDisplacementSpeed: 0.315,
  uColorMix1Opacity: 0.11,
  uColorMix1Smooth: 0.12,
  uHueShift: 0,
  uSaturation: 0.978,
  uRedSaturation: 1.891,
  uRedHue: 0,
  uGreenSaturation: 1.0,
  uGreenHue: 0,
  uBlueSaturation: 1.5,
  uBlueHue: 0,
  mouseLamda: 0.065,
  mouseDelta: 1.25,
  uSizeDefault: 0.14,
};

// ============================================================
//  2. VERTEX SHADER — 1:1 Decompiled
// ============================================================
const vertexShader = `
varying vec2 vUv;
uniform float uZoom;
void main(){
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * uZoom, 1.0);
  vUv = uv;
}
`;

// ============================================================
//  3. FRAGMENT SHADER — 1:1 Decompiled with original algorithms
// ============================================================
const fragmentShader = `
#define GLSLIFY 1
#define DISTANCE 2.0

precision highp float;

varying vec2 vUv;
uniform vec4 uResolution;
uniform float uTime;
uniform vec2 uMouse1;
uniform vec2 uMouse2;
uniform float uOpacity;
uniform sampler2D tRender;
uniform samplerCube tMap;
uniform sampler2D tRenderHover;
uniform float uRenderHoverOpacity;
uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementScale;
uniform float uDisplacementStrength;
uniform float uRefraction;
uniform float uRefractionColorShift;
uniform float uFresnelOffset;
uniform float uFresnelMultiplier;
uniform float uFresnelPower;
uniform float uColorMix1Opacity;
uniform float uColorMix1Smooth;
uniform float uHueShift;
uniform float uSaturation;
uniform float uRedSaturation;
uniform float uGreenSaturation;
uniform float uBlueSaturation;
uniform float uRedHue;
uniform float uGreenHue;
uniform float uBlueHue;
uniform float uSize;

// --- UTILITY FUNCTIONS ---
mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat4(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0
  );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

vec3 screen(vec3 a, vec3 b) {
  return 1.0 - (1.0 - a) * (1.0 - b);
}

vec3 saturation(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

vec3 hue_0(vec3 color, float hue) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

// --- 3D PERLIN NOISE ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// --- SIGNED DISTANCE FIELDS (SDF) ---
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdf(vec3 p) {
  float sphere1 = sdSphere(p - vec3(uMouse1 * uResolution.zw * 2.0, 0.0), uSize * 0.836);
  float sphere2 = sdSphere(p - vec3(uMouse2 * uResolution.zw * 2.0, 0.0), uSize);
  return smin(sphere1, sphere2, uSize * 0.727);
}

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

vec3 getDisplacedPosition(vec3 _position) {
  vec3 distoredPosition = _position;
  float strength = uDistortionStrength;
  distoredPosition += cnoise(vec3(distoredPosition * (uDistortionFrequency / uDisplacementScale) * strength + uTime));
  float perlinStrength = cnoise(vec3((distoredPosition) * (uDisplacementFrequency / uDisplacementScale) * strength));
  vec3 displacedPosition = _position;
  displacedPosition += ((_position / 2.0) * perlinStrength * uDisplacementStrength * 4.0);
  return displacedPosition;
}

vec3 calcNormal(vec3 pos) {
  vec2 eps = vec2(0.01, 0.0);
  return normalize(vec3(
    sdf(pos + eps.xyy) - sdf(pos - eps.xyy),
    sdf(pos + eps.yxy) - sdf(pos - eps.yxy),
    sdf(pos + eps.yyx) - sdf(pos - eps.yyx)
  ));
}

float mapTo(float x, float a, float b, float c, float d) {
  return ((x - a) * (d - c)) / (b - a) + c;
}

void main() {
  float uGlow = 0.005;
  vec4 finalColor = vec4(0.0);
  vec3 camPos = vec3(0.0, 0.0, DISTANCE);
  vec3 coords = vec3(uMouse1 * uResolution.xy, 0.0);
  vec3 ray = normalize(vec3((vUv - vec2(0.5)) * uResolution.zw, -1.0));
  float distanceMouse = distance(uMouse1, vec2(0.0)) * 0.1;
  float t = 0.0;
  float sizeRatio = max(uSize, 0.001) / 0.275;
  float tMax = 2.0 / (-ray.z) + 0.15 * sizeRatio;

  // Exact 4 iterations from original decompiled code
  for (int i = 0; i < 4; ++i) {
    vec3 pos = camPos + t * ray;
    float h = sdf(getDisplacedPosition(pos));
    if (h < 0.001 || t > (tMax + uGlow)) break;
    t += h;
  }

  vec3 vNormal = vec3(0.0);
  vec2 screenUv = gl_FragCoord.xy / uResolution.xy;

  if (t < tMax) {
    float fresnel2Offset = 0.05 * sizeRatio;
    float extraFresnelOffset = 0.015 * sizeRatio;

    vec3 pos = camPos + t * ray;
    float tangentFactor = 0.005;
    vec3 normal = calcNormal(pos);
    vec3 distortedPosition = getDisplacedPosition(pos);
    vec3 tangent1 = orthogonal(normal);
    vec3 tangent2 = normalize(cross(normal, tangent1));
    vec3 nearby1 = pos + tangent1 * tangentFactor;
    vec3 nearby2 = pos + tangent2 * tangentFactor;
    vec3 distorted1 = getDisplacedPosition(nearby1);
    vec3 distorted2 = getDisplacedPosition(nearby2);
    vNormal = normalize(cross(distorted1 - distortedPosition, distorted2 - distortedPosition));

    vec3 viewDirection = normalize(vec3(0.0, 0.0, 0.0) - vec3(coords.x / (uResolution.x * 0.25), coords.y / (uResolution.y * 0.25), -2.0));
    vec3 nViewDirection = normalize(vNormal.xyz - viewDirection);

    float fresnel = uFresnelOffset * (1.0 - distanceMouse * 2.0) + (1.0 + dot(nViewDirection, vNormal)) * uFresnelMultiplier;
    float fresnel2 = uFresnelOffset * (1.0 - distanceMouse * 2.0) + (2.0 + dot(ray, vNormal)) * uFresnelMultiplier;
    fresnel = pow(max(0.0, fresnel), uFresnelPower);
    float fresnelFactor = pow(fresnel + fresnel2, uFresnelPower);

    vec3 vFresnelColor = mix(vec3(0.0), vec3(1.0), clamp(pow(max(0.0, fresnel - 0.8), 3.0), 0.0, 1.0));
    vec3 vFresnelColor2 = vec3(max((t - (tMax - fresnel2Offset)) / sizeRatio, 0.0));
    vFresnelColor = vFresnelColor + vFresnelColor2;

    vec3 refracted = refract(vec3(0.0, 0.0, -2.0), vNormal, 1.0 / 2.0);
    screenUv += refracted.xy * uRefraction * 0.35;

    vec3 cubeTex = textureCube(tMap, vec3(screenUv, 0.0)).rgb;
    vec3 texCube = screen(saturation(cubeTex, 5.0), vec3(0.0, 0.0, 0.0));
    vec3 texCubeFresnel = screen(mix(vec3(0.0, 0.0, 0.0), texCube, vFresnelColor), vFresnelColor);

    float offset = (0.01 * vNormal.x * 0.15 + 0.002) * uRefractionColorShift;
    float red = texture2D(tRender, vec2(screenUv.x, screenUv.y + offset)).r;
    float green = texture2D(tRender, vec2(screenUv.x, screenUv.y)).g;
    float blue = texture2D(tRender, vec2(screenUv.x, screenUv.y - offset)).b;
    vec3 refractedColor = vec3(red, green, blue);

    vec3 mixed1;
    mixed1.r = smoothstep(0.0, 0.25, texCubeFresnel.r);
    mixed1.g = smoothstep(0.0, 0.25, texCubeFresnel.r);
    mixed1.b = smoothstep(0.0, 0.25, texCubeFresnel.r);

    vec3 mixed2;
    float sign = smoothstep(uColorMix1Smooth * 0.1, uColorMix1Smooth * 0.01, texCubeFresnel.r);
    vec3 black = vec3(0.0, 0.0, 0.0);
    float invertFresnelFactor = min(1.0 - fresnelFactor + 0.2 * 10.0, 20.0);
    mixed2 = max(vec3(invertFresnelFactor, invertFresnelFactor, invertFresnelFactor), 0.5);
    mixed2 = mix(black, mix(black, mixed2, sign), uColorMix1Opacity);

    vec3 mixed3;
    mixed3.r = smoothstep(texCubeFresnel.r * 10.0, -0.01, 0.5);
    mixed3.g = smoothstep(texCubeFresnel.g * 10.0, -0.01, 0.5);
    mixed3.b = smoothstep(texCubeFresnel.b * 10.0, -0.01, 0.5);

    vec3 mixed = screen(screen(mixed1, mixed3), mixed2);
    vec3 bw = saturation(mixed, 0.0);
    vec3 shifted = hue_0(mixed, 1.0);
    mixed = hue_0(mixed, uHueShift);
    mixed.r = mix(mix(bw.r, mixed.r, uRedSaturation), mix(bw.r, shifted.r, uRedSaturation), uRedHue);
    mixed.g = mix(mix(bw.g, mixed.g, uGreenSaturation), mix(bw.g, shifted.g, uGreenSaturation), uGreenHue);
    mixed.b = mix(mix(bw.b, mixed.b, uBlueSaturation), mix(bw.b, shifted.b, uBlueSaturation), uBlueHue);
    mixed = saturation(mixed, uSaturation);

    vec4 toImg = texture2D(tRenderHover, screenUv);
    vec3 background = mix(refractedColor, toImg.rgb, uRenderHoverOpacity * toImg.a);
    
    // Crisp white glass highlight at the absolute outer edge (scaled to bubble size)
    vec3 extraFresnel = max(vec3((t - (tMax - extraFresnelOffset)) * (45.0 / sizeRatio)), vec3(0.0));
    
    // Schlick's approximation for water/glass Fresnel reflection.
    float cosTheta = clamp(dot(-ray, vNormal), 0.0, 1.0);
    float waterFresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 5.0);
    
    // Use the original reflection strength (before lifting) as the weight.
    // This prevents the ambient light lift from increasing the mix weight, 
    // ensuring the white background is not darkened.
    float mixWeight = clamp(length(mixed + extraFresnel), 0.0, 1.0);

    // Add soft ambient light to the reflections to simulate a bright room environment,
    // lifting the dark tones and giving the bubble an airy, translucent appearance.
    vec3 brightMixed = mix(mixed, vec3(0.95), 0.25);
    
    // Adapt the environment reflections to the background color. Since the cubemap environment 
    // is dark/black, reflecting it directly on a light background causes dark rings.
    // By blending the reflection base with the page background based on the reflection intensity,
    // we preserve the beautiful colored highlights (blue/purple) while removing the black base.
    vec3 reflectionColor = mix(background, brightMixed + extraFresnel, mixWeight);
    
    vec3 mixedBackground = mix(background, reflectionColor, waterFresnel);

    finalColor.rgb = mixedBackground;
    finalColor.a = 1.0;
  } else {
    finalColor.a = 0.0;
  }

  if (t > tMax && t < (tMax + uGlow)) {
    float mappedT = mapTo(t, tMax, tMax + uGlow, 1.0, 0.0);
    finalColor.rgb = vec3(1.0);
    finalColor.a = mappedT;
  }

  gl_FragColor = finalColor;
  gl_FragColor.a *= uOpacity;
}
`;

// ============================================================
//  4. ORIGINAL PERSPECTIVE CAMERA CLASS (Ke)
// ============================================================
class CustomPerspectiveCamera extends THREE.PerspectiveCamera {
  constructor() {
    super();
    this.position.set(0, 0, 3500);
    this.distance = 3500;
    this.near = 0.01;
    this.far = 4000;
  }
  calcFov(w, h) {
    return 2 * Math.atan(w / h / (2 * 3500)) * (180 / Math.PI);
  }
  resize(w, h) {
    this.aspect = w / h;
    this.fov = this.calcFov(w, w / h);
    this.updateProjectionMatrix();
  }
}

// ============================================================
//  5. ORIGINAL LAYOUT MESH BASE CLASS (be) & BLOB CLASS (rn)
// ============================================================
class BlobMesh extends THREE.Mesh {
  constructor(material, camera) {
    const geometry = new THREE.PlaneGeometry(1, 1, 1);
    super(geometry, material);
    this.camera = camera;
    this.offset = new THREE.Vector2();
    this.size = 1.0;
  }

  calculateUnitSize(zDistance) {
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fovRad / 2) * zDistance;
    return {
      width: height * this.camera.aspect,
      height: height
    };
  }

  updateSize(width, height, layoutX, layoutY) {
    const camUnit = this.calculateUnitSize(this.camera.position.z - this.position.z);
    const scaleX = width / layoutX;
    const scaleY = height / layoutY;
    this.scale.x = camUnit.width * scaleX * this.size;
    this.scale.y = camUnit.height * scaleY * this.size;
  }

  calculatePosition(layoutX, layoutY, width, height, top, left, scrollTop) {
    const absoluteTop = top + scrollTop;
    this.offset.set(
      -layoutX / 2 + width / 2 + left,
      layoutY / 2 - height / 2 - absoluteTop
    );
  }

  update(scrollTop) {
    this.position.x = this.offset.x;
    this.position.y = this.offset.y + scrollTop;
  }
}

// ============================================================
//  6. MAIN WEBGL APPLICATION COORDINATOR (an)
// ============================================================
class WebGLApp {
  constructor() {
    this.el = document.getElementById('gl');
    this.container = document.body;

    this.mouse = new THREE.Vector2(0, 0);
    this.mouse1 = new THREE.Vector2(0, 0);
    this.mouse2 = new THREE.Vector2(0, 0);

    // Snapping control
    this.snapTarget = null;
    this.snapProgress = 0.05;

    // Hover Card Tracking
    this.hoveredCard = null;
    this.hoveredImg = null;

    // Scroll Snap Tracking
    this.scrollSnapTarget = null;
    this.scrollSnapImg = null;

    // Sizing control
    this.targetBlobSize = W.uSizeDefault;
    this.currentBlobSize = W.uSizeDefault;

    // Hover Image Interpolation state
    this.targetHoverOpacity = 0.0;
    this.currentHoverOpacity = 0.0;
    this.hoverImageCache = {};

    this.opacity = 0;
    this.loaded = false;
    this.time = 0;
    this.clock = new THREE.Clock();

    this.init();
  }

  async init() {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(dpr);
    this.el.appendChild(this.renderer.domElement);

    // Cameras
    this.camera = new CustomPerspectiveCamera();

    // Scenes
    this.scene = new THREE.Scene();

    // Refraction texture (Canvas texture dynamically synchronised with page content)
    this.tRenderCanvas = document.createElement('canvas');
    this.tRenderCtx = this.tRenderCanvas.getContext('2d');
    this.tRenderTexture = new THREE.CanvasTexture(this.tRenderCanvas);
    this.tRenderTexture.minFilter = THREE.LinearFilter;
    this.tRenderTexture.magFilter = THREE.LinearFilter;

    // Hover image texture (Draws target images into this canvas)
    this.tRenderHoverCanvas = document.createElement('canvas');
    this.tRenderHoverCtx = this.tRenderHoverCanvas.getContext('2d');
    this.tRenderHoverTexture = new THREE.CanvasTexture(this.tRenderHoverCanvas);
    this.tRenderHoverTexture.minFilter = THREE.LinearFilter;

    // Load Cubemap
    const cubemap = await this.loadCubemap();
    this.scene.environment = cubemap;

    // Material setup (1:1 decompiled shader logic)
    this.mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 1.0 },
        uDistortionFrequency: { value: W.uDistortionFrequency },
        uDistortionStrength: { value: W.uDistortionStrength },
        uDisplacementFrequency: { value: W.uDisplacementFrequency },
        uDisplacementStrength: { value: W.uDisplacementStrength },
        uDisplacementScale: { value: W.uDisplacementScale },
        uFresnelOffset: { value: W.uFresnelOffset },
        uFresnelPower: { value: W.uFresnelPower },
        uFresnelMultiplier: { value: W.uFresnelMultiplier },
        uRefraction: { value: W.uRefraction },
        uRefractionColorShift: { value: W.uRefractionColorShift },
        tRender: { value: this.tRenderTexture },
        tMap: { value: cubemap },
        tRenderHover: { value: this.tRenderHoverTexture },
        uRenderHoverOpacity: { value: 0 },
        uColorMix1Opacity: { value: W.uColorMix1Opacity },
        uColorMix1Smooth: { value: W.uColorMix1Smooth },
        uHueShift: { value: W.uHueShift },
        uSaturation: { value: W.uSaturation },
        uRedSaturation: { value: W.uRedSaturation },
        uGreenSaturation: { value: W.uGreenSaturation },
        uBlueSaturation: { value: W.uBlueSaturation },
        uRedHue: { value: W.uRedHue },
        uGreenHue: { value: W.uGreenHue },
        uBlueHue: { value: W.uBlueHue },
        uMouse1: { value: new THREE.Vector2() },
        uMouse2: { value: new THREE.Vector2() },
        uResolution: { value: new THREE.Vector4() },
        uSize: { value: W.uSizeDefault },
        uOpacity: { value: 0 },
        uZoom: { value: 1.0 },
      }
    });

    // Mesh
    this.blob = new BlobMesh(this.mat, this.camera);
    this.scene.add(this.blob);

    this.loaded = true;
    this.addEvents();
    this.resize();
    this.fadeIn();
    this.animate();
  }

  // --- Dynamic DOM refraction texture synchronisation ---
  updateRefractionCanvas() {
    if (!this.loaded) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.tRenderCanvas.width = w * dpr;
    this.tRenderCanvas.height = h * dpr;
    this.tRenderCtx.scale(dpr, dpr);

    // 1. Draw actual body background color (or white fallback if transparent)
    const bodyStyle = window.getComputedStyle(document.body);
    let bgColor = bodyStyle.backgroundColor;
    if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
      bgColor = '#ffffff';
    }
    this.tRenderCtx.fillStyle = bgColor;
    this.tRenderCtx.fillRect(0, 0, w, h);

    // 2. Scan DOM for refractable elements & draw them in their computed style colors
    const textElements = document.querySelectorAll('[data-gl-text]');
    textElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Only render elements inside or close to the viewport
      if (rect.bottom < -100 || rect.top > h + 100) return;

      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      const fontFamily = style.fontFamily;
      const fontWeight = style.fontWeight;
      const textAlign = style.textAlign;
      const text = el.innerText.trim();
      const textColor = style.color || '#1a1a2e';

      // Configure font
      this.tRenderCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      this.tRenderCtx.fillStyle = textColor; // Matches the actual DOM text color
      this.tRenderCtx.textBaseline = 'top';

      const x = rect.left;
      const y = rect.top;

      // Draw multi-line text wrapped to its bounding client box width
      const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.25;
      this.wrapText(this.tRenderCtx, text, x, y, rect.width, lineHeight, textAlign);
    });

    this.tRenderTexture.needsUpdate = true;
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight, align) {
    const paragraphs = text.split('\n');
    let currentY = y;

    paragraphs.forEach(para => {
      const words = para.split(' ');
      let line = '';

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          let drawX = x;
          if (align === 'center') drawX = x + (maxWidth - ctx.measureText(line).width) / 2;
          else if (align === 'right') drawX = x + (maxWidth - ctx.measureText(line).width);
          ctx.fillText(line, drawX, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      let drawX = x;
      if (align === 'center') drawX = x + (maxWidth - ctx.measureText(line).width) / 2;
      else if (align === 'right') drawX = x + (maxWidth - ctx.measureText(line).width);
      ctx.fillText(line, drawX, currentY);
      currentY += lineHeight;
    });
  }

  // --- Dynamic Hover Image draw onto buffer ---
  updateHoverImageCanvas(imgElement, cardRect) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.tRenderHoverCanvas.width = w * dpr;
    this.tRenderHoverCanvas.height = h * dpr;
    this.tRenderHoverCtx.scale(dpr, dpr);

    // Clear background with transparent
    this.tRenderHoverCtx.clearRect(0, 0, w, h);

    // Draw the image centered at the target's center and scaled to fill the bubble
    if (imgElement && imgElement.complete) {
      const centerX = cardRect.left + cardRect.width / 2;
      const centerY = cardRect.top + cardRect.height / 2;
      
      // Dynamic bubble diameter in pixels + 20% margin to cover refraction distortion
      const size = 2.0 * this.currentBlobSize * h * 1.2;
      
      // Crop square from image center (object-fit: cover behavior)
      const imgW = imgElement.width;
      const imgH = imgElement.height;
      const imgAspect = imgW / imgH;
      
      let sx = 0, sy = 0, sWidth = imgW, sHeight = imgH;
      if (imgAspect > 1.0) {
        sWidth = imgH;
        sx = (imgW - imgH) / 2;
      } else {
        sHeight = imgW;
        sy = (imgH - imgW) / 2;
      }
      
      const drawX = centerX - size / 2;
      const drawY = centerY - size / 2;
      
      this.tRenderHoverCtx.drawImage(
        imgElement,
        sx, sy, sWidth, sHeight,
        drawX, drawY, size, size
      );
    }
    this.tRenderHoverTexture.needsUpdate = true;
  }

  loadCubemap() {
    return new Promise((resolve) => {
      const loader = new THREE.CubeTextureLoader();
      loader.setPath('./static/cubemaps/01/');
      loader.load(
        ['px.png', 'nx.png', 'ny.png', 'py.png', 'pz.png', 'nz.png'],
        (tex) => resolve(tex),
        undefined,
        (err) => {
          console.warn('Cube textures missing, utilizing high fidelity procedural fallback');
          resolve(this.fallbackCubemap());
        }
      );
    });
  }

  fallbackCubemap() {
    const size = 128, faces = [];
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const x = c.getContext('2d');
      x.fillStyle = '#06050b'; x.fillRect(0, 0, size, size);
      const g = x.createRadialGradient(size * 0.45, size * 0.45, 0, size * 0.45, size * 0.45, size * 0.6);
      g.addColorStop(0, `hsla(${i * 60 + 220}, 75%, 25%, 0.7)`);
      g.addColorStop(1, 'transparent');
      x.fillStyle = g; x.fillRect(0, 0, size, size);
      faces.push(c);
    }
    const t = new THREE.CubeTexture(faces);
    t.needsUpdate = true;
    return t;
  }

  fadeIn() {
    this.el.style.opacity = '1';
    const duration = 1200, startTime = performance.now();
    const tick = () => {
      const progress = Math.min((performance.now() - startTime) / duration, 1);
      this.opacity = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      if (progress < 1) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 200);
  }

  addEvents() {
    // 1. Mouse Move & Coordinate tracking
    const handleMove = (clientX, clientY) => {
      if (this.snapTarget) return; // Ignore actual mouse coordinates if bubble is snapping to target center
      this.mouse.set(clientX / window.innerWidth - 0.5, -(clientY / window.innerHeight) + 0.5);
    };
    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // 2. Interactive Snap & Hover Card Listeners
    const cards = document.querySelectorAll('[data-gl-snap]');
    cards.forEach(card => {
      const imgPath = card.getAttribute('data-gl-hover-img');
      let imgObj = null;

      // Pre-load hover image
      if (imgPath) {
        imgObj = new Image();
        imgObj.src = imgPath;
        this.hoverImageCache[imgPath] = imgObj;
      }

      // Snap & Hover activation on cursor click/mouseenter
      card.addEventListener('mouseenter', () => {
        this.hoveredCard = card;
        this.hoveredImg = imgObj;

        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Snap coordinates override [-0.5, 0.5]
        this.snapTarget = new THREE.Vector2(
          centerX / window.innerWidth - 0.5,
          -(centerY / window.innerHeight) + 0.5
        );

        // Hover image interpolation activation
        if (imgObj) {
          this.updateHoverImageCanvas(imgObj, rect);
          this.targetHoverOpacity = 1.0;
          this.targetBlobSize = W.BlobSizeHover * W.uSizeDefault;
        }
      });

      card.addEventListener('mouseleave', () => {
        this.hoveredCard = null;
        this.hoveredImg = null;

        this.snapTarget = null;
        this.targetHoverOpacity = 0.0;
        this.targetBlobSize = W.uSizeDefault;
      });
    });

    // 3. Scroll & Resize updates
    window.addEventListener('scroll', () => {
      this.updateRefractionCanvas();
      this.checkScrollTriggers();
    });
    window.addEventListener('resize', () => this.resize());
  }

  // --- Scroll triggers for dynamic size scaling and auto-snapping ---
  checkScrollTriggers() {
    // If the user is actively hovering over a mouse-interactive card, prioritize mouse-snap
    if (this.hoveredCard) return;

    const sections = document.querySelectorAll('[data-gl-size]');
    let activeSize = W.uSizeDefault;
    let newScrollSnapTarget = null;
    let snapImgObj = null;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      // Check if section is active (taking up the middle band of the viewport)
      if (rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4) {
        const sizeVal = parseFloat(sec.getAttribute('data-gl-size'));
        activeSize = sizeVal / 10.0;

        // Check for scroll-snap target in active section
        const snapSelector = sec.getAttribute('data-gl-scroll-snap');
        if (snapSelector) {
          const targetEl = document.querySelector(snapSelector);
          if (targetEl) {
            newScrollSnapTarget = targetEl;
            const imgPath = targetEl.getAttribute('data-gl-target-img');
            if (imgPath) {
              if (!this.hoverImageCache[imgPath]) {
                const img = new Image();
                img.src = imgPath;
                this.hoverImageCache[imgPath] = img;
              }
              snapImgObj = this.hoverImageCache[imgPath];
            }
          }
        }
      }
    });

    this.targetBlobSize = activeSize;

    // Handle scroll-snapping alignment and images
    if (newScrollSnapTarget) {
      this.scrollSnapTarget = newScrollSnapTarget;
      this.scrollSnapImg = snapImgObj;
      
      const rect = newScrollSnapTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      this.snapTarget = new THREE.Vector2(
        centerX / window.innerWidth - 0.5,
        -(centerY / window.innerHeight) + 0.5
      );
      
      if (snapImgObj) {
        this.updateHoverImageCanvas(snapImgObj, rect);
        this.targetHoverOpacity = 1.0;
        this.targetBlobSize = W.BlobSizeHover * activeSize;
      }
    } else {
      if (this.scrollSnapTarget) {
        this.scrollSnapTarget = null;
        this.scrollSnapImg = null;
        this.snapTarget = null;
        this.targetHoverOpacity = 0.0;
      }
    }
  }

  resize() {
    if (!this.loaded) return;
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer.setSize(w, h);
    this.camera.resize(w, h);

    // Calculate aspect ratio multipliers
    let aspectX, aspectY;
    const imageAspect = 1.0;
    if (h / w > imageAspect) {
      aspectX = w / h * imageAspect;
      aspectY = 1.0;
    } else {
      aspectX = 1.0;
      aspectY = h / w / imageAspect;
    }

    this.mat.uniforms.uResolution.value.set(w * dpr, h * dpr, aspectX, aspectY);

    // Force full screen alignment independent of DOM bounds to prevent any edge clipping
    this.blob.calculatePosition(w, h, w, h, 0, 0, 0);
    this.blob.updateSize(w, h, w, h);

    // Also update size and clear hover canvas to prevent 0x0 texture issues
    this.tRenderHoverCanvas.width = w * dpr;
    this.tRenderHoverCanvas.height = h * dpr;
    this.tRenderHoverCtx.clearRect(0, 0, w, h);
    this.tRenderHoverTexture.needsUpdate = true;

    // Refresh viewport canvas projection buffer
    this.updateRefractionCanvas();
    this.checkScrollTriggers();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.loaded) return;

    // Linear interpolation helper defined at top to prevent TDZ reference errors
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    this.time = this.clock.getElapsedTime();

    // Smoothly interpolate snap coordinates if set
    if (this.snapTarget) {
      this.mouse.x = lerp(this.mouse.x, this.snapTarget.x, 0.1);
      this.mouse.y = lerp(this.mouse.y, this.snapTarget.y, 0.1);
    }

    this.mouse1.x = lerp(this.mouse1.x, this.mouse.x, 0.05);
    this.mouse1.y = lerp(this.mouse1.y, this.mouse.y, 0.05);
    this.mouse2.x = lerp(this.mouse2.x, this.mouse1.x, 0.075);
    this.mouse2.y = lerp(this.mouse2.y, this.mouse1.y, 0.075);

    // Smoothly transition blob size on scroll triggers
    this.currentBlobSize = lerp(this.currentBlobSize, this.targetBlobSize, 0.05);
    this.mat.uniforms.uSize.value = this.currentBlobSize;

    // Smoothly transition hover image interpolation opacity
    this.currentHoverOpacity = lerp(this.currentHoverOpacity, this.targetHoverOpacity, 0.1);
    this.mat.uniforms.uRenderHoverOpacity.value = this.currentHoverOpacity;

    // Redraw the hover image every frame if a card or scroll-snap target is active
    if (this.hoveredCard && this.hoveredImg) {
      const rect = this.hoveredCard.getBoundingClientRect();
      this.updateHoverImageCanvas(this.hoveredImg, rect);
    } else if (this.scrollSnapTarget && this.scrollSnapImg) {
      const rect = this.scrollSnapTarget.getBoundingClientRect();
      this.updateHoverImageCanvas(this.scrollSnapImg, rect);
      
      // Update coordinates continuously on scroll to follow the moving frame
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (this.snapTarget) {
        this.snapTarget.set(
          centerX / window.innerWidth - 0.5,
          -(centerY / window.innerHeight) + 0.5
        );
      }
    }

    // Update uniforms
    this.mat.uniforms.uTime.value = this.time * W.uDisplacementSpeed;
    this.mat.uniforms.uMouse1.value.copy(this.mouse1);
    this.mat.uniforms.uMouse2.value.copy(this.mouse2);
    this.mat.uniforms.uOpacity.value = this.opacity;

    // Layout update (keeps full screen fixed overlay synchronous and centered)
    this.blob.update(0);

    // Draw frame
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialise application on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new WebGLApp();
});
