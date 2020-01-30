import { Filter, utils } from 'pixi.js'

const vertexShader = `
// https://github.com/brianchirls/Seriously.js/blob/r2015-09-08/effects/seriously.chroma.js

precision mediump float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec3 screen;
uniform float balance;
varying float screenSat;
varying vec3 screenPrimary;

void main(void) {
  float fmin = min(min(screen.r, screen.g), screen.b);
  float fmax = max(max(screen.r, screen.g), screen.b);
  float secondaryComponents;

  screenPrimary = step(fmax, screen.rgb);
  secondaryComponents = dot(1.0 - screenPrimary, screen.rgb);
  screenSat = fmax - mix(secondaryComponents - fmin, secondaryComponents / 2.0, balance);

  gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
  vTextureCoord = aTextureCoord;
}
`

const fragmentShader = `
// https://github.com/brianchirls/Seriously.js/blob/r2015-09-08/effects/seriously.chroma.js

precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 screen;
uniform float balance;
uniform float clipBlack;
uniform float clipWhite;

varying float screenSat;
varying vec3 screenPrimary;

void main(void) {
  float pixelSat, secondaryComponents;
  vec4 sourcePixel = texture2D(uSampler, vTextureCoord);

  float fmin = min(min(sourcePixel.r, sourcePixel.g), sourcePixel.b);
  float fmax = max(max(sourcePixel.r, sourcePixel.g), sourcePixel.b);

  vec3 pixelPrimary = step(fmax, sourcePixel.rgb);

  secondaryComponents = dot(1.0 - pixelPrimary, sourcePixel.rgb);
  pixelSat = fmax - mix(secondaryComponents - fmin, secondaryComponents / 2.0, balance);

  float diffPrimary = dot(abs(pixelPrimary - screenPrimary), vec3(1.0));
  float solid = step(1.0, step(pixelSat, 0.1) + step(fmax, 0.1) + diffPrimary);

  float alpha = max(0.0, 1.0 - pixelSat / screenSat);
  alpha = smoothstep(clipBlack, clipWhite, alpha);
  vec4 semiTransparentPixel = vec4((sourcePixel.rgb - (1.0 - alpha) * screen.rgb) / max(0.00001, alpha), alpha);

  vec4 pixel = mix(semiTransparentPixel, sourcePixel, solid);

  gl_FragColor = pixel;
}
`

export default class ChromaKeyFilter extends Filter {
  public constructor(keyColor = '#00ff00') {
    super(vertexShader, fragmentShader)

    this.uniforms.screen = new Float32Array(3)
    this.uniforms.balance = 1.0
    this.uniforms.clipBlack = 0.0
    this.uniforms.clipWhite = 1.0
    this.keyColor = keyColor
  }

  public get keyColor(): string {
    const hex = utils.rgb2hex(this.uniforms.screen)

    return utils.hex2string(hex)
  }

  public set keyColor(value: string) {
    const hex = utils.string2hex(value)

    utils.hex2rgb(hex, this.uniforms.screen)
  }
}
