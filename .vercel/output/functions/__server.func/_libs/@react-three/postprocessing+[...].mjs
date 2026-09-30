import { i as __toESM } from "../../_runtime.mjs";
import { A as UnsignedInt248Type, C as PerspectiveCamera, D as Texture, E as ShaderMaterial, I as require_jsx_runtime, L as require_react, N as Vector4, O as Uniform, P as WebGLRenderTarget, S as OrthographicCamera, T as Scene, _ as Material, a as BasicDepthPacking, b as MeshNormalMaterial, d as DepthTexture, f as EventDispatcher, g as LinearSRGBColorSpace, h as LinearFilter, i as useThree, j as Vector2, k as UnsignedByteType, l as Color, m as HalfFloatType, n as extend, o as BufferAttribute, p as FloatType, r as useFrame, s as BufferGeometry, u as DepthStencilFormat, w as SRGBColorSpace, x as NearestFilter, y as Mesh } from "./fiber+[...].mjs";
//#region node_modules/postprocessing/build/index.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* postprocessing v6.39.5 build Wed Sep 09 2026
* https://github.com/pmndrs/postprocessing
* Copyright 2015-2026 Raoul van Rüschen
* @license Zlib
*/
var fullscreenGeometry = /* @__PURE__ */ (() => {
	const vertices = new Float32Array([
		-1,
		-1,
		0,
		3,
		-1,
		0,
		-1,
		3,
		0
	]);
	const uvs = new Float32Array([
		0,
		0,
		2,
		0,
		0,
		2
	]);
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(vertices, 3));
	geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
	return geometry;
})();
var Pass = class _Pass {
	/**
	* A shared fullscreen triangle.
	*
	* The screen size is 2x2 units (NDC). A triangle needs to be 4x4 units to fill the screen.
	* @see https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
	* @type {BufferGeometry}
	* @internal
	*/
	static get fullscreenGeometry() {
		return fullscreenGeometry;
	}
	/**
	* Constructs a new pass.
	*
	* @param {String} [name] - The name of this pass. Does not have to be unique.
	* @param {Scene} [scene] - The scene to render. The default scene contains a single mesh that fills the screen.
	* @param {Camera} [camera] - A camera. Fullscreen effect passes don't require a camera.
	*/
	constructor(name = "Pass", scene = new Scene(), camera = new OrthographicCamera()) {
		this.name = name;
		this.renderer = null;
		this.scene = scene;
		this.camera = camera;
		this.screen = null;
		this.rtt = true;
		this.needsSwap = true;
		this.needsDepthBlit = false;
		this.needsDepthTexture = false;
		this.enabled = true;
	}
	/**
	* Sets the render to screen flag.
	*
	* If this flag is changed, the fullscreen material will be updated as well.
	*
	* @type {Boolean}
	*/
	get renderToScreen() {
		return !this.rtt;
	}
	set renderToScreen(value) {
		if (this.rtt === value) {
			const material = this.fullscreenMaterial;
			if (material !== null) material.needsUpdate = true;
			this.rtt = !value;
		}
	}
	/**
	* Sets the main scene.
	*
	* @type {Scene}
	*/
	set mainScene(value) {}
	/**
	* Sets the main camera.
	*
	* @type {Camera}
	*/
	set mainCamera(value) {}
	/**
	* Sets the renderer
	*
	* @deprecated
	* @param {WebGLRenderer} renderer - The renderer.
	*/
	setRenderer(renderer) {
		this.renderer = renderer;
	}
	/**
	* Indicates whether this pass is enabled.
	*
	* @deprecated Use enabled instead.
	* @return {Boolean} Whether this pass is enabled.
	*/
	isEnabled() {
		return this.enabled;
	}
	/**
	* Enables or disables this pass.
	*
	* @deprecated Use enabled instead.
	* @param {Boolean} value - Whether the pass should be enabled.
	*/
	setEnabled(value) {
		this.enabled = value;
	}
	/**
	* The fullscreen material.
	*
	* @type {Material}
	*/
	get fullscreenMaterial() {
		return this.screen !== null ? this.screen.material : null;
	}
	set fullscreenMaterial(value) {
		let screen = this.screen;
		if (screen !== null) screen.material = value;
		else {
			screen = new Mesh(_Pass.fullscreenGeometry, value);
			screen.frustumCulled = false;
			if (this.scene === null) this.scene = new Scene();
			this.scene.add(screen);
			this.screen = screen;
		}
	}
	/**
	* Returns the current fullscreen material.
	*
	* @deprecated Use fullscreenMaterial instead.
	* @return {Material} The current fullscreen material, or null if there is none.
	*/
	getFullscreenMaterial() {
		return this.fullscreenMaterial;
	}
	/**
	* Sets the fullscreen material.
	*
	* @deprecated Use fullscreenMaterial instead.
	* @protected
	* @param {Material} value - A fullscreen material.
	*/
	setFullscreenMaterial(value) {
		this.fullscreenMaterial = value;
	}
	/**
	* Returns the current depth texture.
	*
	* @return {Texture} The current depth texture, or null if there is none.
	*/
	getDepthTexture() {
		return null;
	}
	/**
	* Sets the depth texture.
	*
	* This method will be called automatically by the {@link EffectComposer}.
	* You may override this method if your pass relies on the depth information of a preceding {@link RenderPass}.
	*
	* @param {Texture} depthTexture - A depth texture.
	* @param {DepthPackingStrategy} [depthPacking=BasicDepthPacking] - The depth packing.
	*/
	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {}
	/**
	* Renders this pass.
	*
	* This is an abstract method that must be overridden.
	*
	* @abstract
	* @throws {Error} An error is thrown if the method is not overridden.
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		throw new Error("Render method not implemented!");
	}
	/**
	* Sets the size.
	*
	* You may override this method if you want to be informed about the size of the backbuffer/canvas.
	* This method is called before {@link initialize} and every time the size of the {@link EffectComposer} changes.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {}
	/**
	* Performs initialization tasks.
	*
	* This method is called when this pass is added to an {@link EffectComposer}.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	*/
	initialize(renderer, alpha, frameBufferType) {}
	/**
	* Performs a shallow search for disposable properties and deletes them.
	*
	* The {@link EffectComposer} calls this method when it is being destroyed. You can use it independently to free
	* memory when you're certain that you don't need this pass anymore.
	*/
	dispose() {
		for (const key of Object.keys(this)) {
			const property = this[key];
			if (property instanceof WebGLRenderTarget || property instanceof Material || property instanceof Texture || property instanceof _Pass) this[key].dispose();
		}
		if (this.fullscreenMaterial !== null) this.fullscreenMaterial.dispose();
	}
};
var ClearMaskPass = class extends Pass {
	/**
	* Constructs a new clear mask pass.
	*/
	constructor() {
		super("ClearMaskPass", null, null);
		this.needsSwap = false;
	}
	/**
	* Disables the global stencil test.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const stencil = renderer.state.buffers.stencil;
		stencil.setLocked(false);
		stencil.setTest(false);
	}
};
var copy_default = `#ifdef COLOR_WRITE
#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#endif
#ifdef DEPTH_WRITE
#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}
#endif
#ifdef USE_WEIGHTS
uniform vec4 channelWeights;
#endif
uniform float opacity;varying vec2 vUv;void main(){
#ifdef COLOR_WRITE
vec4 texel=texture2D(inputBuffer,vUv);
#ifdef USE_WEIGHTS
texel*=channelWeights;
#endif
gl_FragColor=opacity*texel;
#ifdef COLOR_SPACE_CONVERSION
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
#else
gl_FragColor=vec4(0.0);
#endif
#ifdef DEPTH_WRITE
gl_FragDepth=readDepth(vUv);
#endif
}`;
var common_default = `varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}`;
var CopyMaterial = class extends ShaderMaterial {
	/**
	* Constructs a new copy material.
	*/
	constructor() {
		super({
			name: "CopyMaterial",
			defines: {
				COLOR_SPACE_CONVERSION: "1",
				DEPTH_PACKING: "0",
				COLOR_WRITE: "1"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer: new Uniform(null),
				channelWeights: new Uniform(null),
				opacity: new Uniform(1)
			},
			blending: 0,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader: copy_default,
			vertexShader: common_default
		});
		this.depthFunc = 1;
	}
	/**
	* The input buffer.
	*
	* @type {Texture}
	*/
	get inputBuffer() {
		return this.uniforms.inputBuffer.value;
	}
	set inputBuffer(value) {
		const colorWrite = value !== null;
		if (this.colorWrite !== colorWrite) {
			if (colorWrite) this.defines.COLOR_WRITE = true;
			else delete this.defines.COLOR_WRITE;
			this.colorWrite = colorWrite;
			this.needsUpdate = true;
		}
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* A depth buffer.
	*
	* @type {Texture}
	*/
	get depthBuffer() {
		return this.uniforms.depthBuffer.value;
	}
	set depthBuffer(value) {
		const depthWrite = value !== null;
		if (this.depthWrite !== depthWrite) {
			if (depthWrite) this.defines.DEPTH_WRITE = true;
			else delete this.defines.DEPTH_WRITE;
			this.depthTest = depthWrite;
			this.depthWrite = depthWrite;
			this.needsUpdate = true;
		}
		this.uniforms.depthBuffer.value = value;
	}
	/**
	* The depth packing strategy of the depth buffer.
	*
	* @type {DepthPackingStrategies}
	*/
	set depthPacking(value) {
		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}
	/**
	* Indicates whether output color space conversion is enabled.
	*
	* @type {Boolean}
	*/
	get colorSpaceConversion() {
		return this.defines.COLOR_SPACE_CONVERSION !== void 0;
	}
	set colorSpaceConversion(value) {
		if (this.colorSpaceConversion !== value) {
			if (value) this.defines.COLOR_SPACE_CONVERSION = true;
			else delete this.defines.COLOR_SPACE_CONVERSION;
			this.needsUpdate = true;
		}
	}
	/**
	* Color channel weights that modulate texels from the input buffer.
	*
	* Set to `null` to disable.
	*
	* @type {Vector4 | null}
	*/
	get channelWeights() {
		return this.uniforms.channelWeights.value;
	}
	set channelWeights(value) {
		if (value !== null) {
			this.defines.USE_WEIGHTS = "1";
			this.uniforms.channelWeights.value = value;
		} else delete this.defines.USE_WEIGHTS;
		this.needsUpdate = true;
	}
	/**
	* Sets the input buffer.
	*
	* @deprecated Use inputBuffer instead.
	* @param {Number} value - The buffer.
	*/
	setInputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* Returns the opacity.
	*
	* @deprecated Use opacity instead.
	* @return {Number} The opacity.
	*/
	getOpacity(value) {
		return this.uniforms.opacity.value;
	}
	/**
	* Sets the opacity.
	*
	* @deprecated Use opacity instead.
	* @param {Number} value - The opacity.
	*/
	setOpacity(value) {
		this.uniforms.opacity.value = value;
	}
};
var CopyPass = class extends Pass {
	/**
	* Constructs a new save pass.
	*
	* @param {WebGLRenderTarget} [renderTarget] - A render target.
	* @param {Boolean} [autoResize=true] - Whether the render target size should be updated automatically.
	*/
	constructor(renderTarget, autoResize = true) {
		super("CopyPass");
		this.fullscreenMaterial = new CopyMaterial();
		this.needsSwap = false;
		this.renderTarget = renderTarget;
		if (renderTarget === void 0) {
			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});
			this.renderTarget.texture.name = "CopyPass.Target";
		}
		this.autoResize = autoResize;
	}
	/**
	* Enables or disables auto resizing of the render target.
	*
	* @deprecated Use autoResize instead.
	* @type {Boolean}
	*/
	get resize() {
		return this.autoResize;
	}
	set resize(value) {
		this.autoResize = value;
	}
	/**
	* The output texture.
	*
	* @type {Texture}
	*/
	get texture() {
		return this.renderTarget.texture;
	}
	/**
	* Returns the output texture.
	*
	* @deprecated Use texture instead.
	* @return {Texture} The texture.
	*/
	getTexture() {
		return this.renderTarget.texture;
	}
	/**
	* Enables or disables auto resizing of the render target.
	*
	* @deprecated Use autoResize instead.
	* @param {Boolean} value - Whether the render target size should be updated automatically.
	*/
	setAutoResizeEnabled(value) {
		this.autoResize = value;
	}
	/**
	* Saves the input buffer.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		this.fullscreenMaterial.inputBuffer = inputBuffer.texture;
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);
	}
	/**
	* Updates the size of this pass.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		if (this.autoResize) this.renderTarget.setSize(width, height);
	}
	/**
	* Performs initialization tasks.
	*
	* @param {WebGLRenderer} renderer - A renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	*/
	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== void 0) {
			this.renderTarget.texture.type = frameBufferType;
			if (frameBufferType !== 1009) this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			else if (renderer !== null && renderer.outputColorSpace === "srgb") this.renderTarget.texture.colorSpace = SRGBColorSpace;
		}
	}
};
var color = /* @__PURE__ */ new Color();
var ClearPass = class extends Pass {
	/**
	* Constructs a new clear pass.
	*
	* @param {Boolean} [color=true] - Determines whether the color buffer should be cleared.
	* @param {Boolean} [depth=true] - Determines whether the depth buffer should be cleared.
	* @param {Boolean} [stencil=false] - Determines whether the stencil buffer should be cleared.
	*/
	constructor(color2 = true, depth = true, stencil = false) {
		super("ClearPass", null, null);
		this.needsSwap = false;
		this.color = color2;
		this.depth = depth;
		this.stencil = stencil;
		this.overrideClearColor = null;
		this.overrideClearAlpha = -1;
	}
	/**
	* Sets the clear flags.
	*
	* @param {Boolean} color - Whether the color buffer should be cleared.
	* @param {Boolean} depth - Whether the depth buffer should be cleared.
	* @param {Boolean} stencil - Whether the stencil buffer should be cleared.
	*/
	setClearFlags(color2, depth, stencil) {
		this.color = color2;
		this.depth = depth;
		this.stencil = stencil;
	}
	/**
	* Returns the override clear color. Default is null.
	*
	* @deprecated Use overrideClearColor instead.
	* @return {Color} The clear color.
	*/
	getOverrideClearColor() {
		return this.overrideClearColor;
	}
	/**
	* Sets the override clear color.
	*
	* @deprecated Use overrideClearColor instead.
	* @param {Color} value - The clear color.
	*/
	setOverrideClearColor(value) {
		this.overrideClearColor = value;
	}
	/**
	* Returns the override clear alpha. Default is -1.
	*
	* @deprecated Use overrideClearAlpha instead.
	* @return {Number} The clear alpha.
	*/
	getOverrideClearAlpha() {
		return this.overrideClearAlpha;
	}
	/**
	* Sets the override clear alpha.
	*
	* @deprecated Use overrideClearAlpha instead.
	* @param {Number} value - The clear alpha.
	*/
	setOverrideClearAlpha(value) {
		this.overrideClearAlpha = value;
	}
	/**
	* Clears the input buffer or the screen.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const overrideClearColor = this.overrideClearColor;
		const overrideClearAlpha = this.overrideClearAlpha;
		const clearAlpha = renderer.getClearAlpha();
		const hasOverrideClearColor = overrideClearColor !== null;
		const hasOverrideClearAlpha = overrideClearAlpha >= 0;
		if (hasOverrideClearColor) {
			renderer.getClearColor(color);
			renderer.setClearColor(overrideClearColor, hasOverrideClearAlpha ? overrideClearAlpha : clearAlpha);
		} else if (hasOverrideClearAlpha) renderer.setClearAlpha(overrideClearAlpha);
		renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
		renderer.clear(this.color, this.depth, this.stencil);
		if (hasOverrideClearColor) renderer.setClearColor(color, clearAlpha);
		else if (hasOverrideClearAlpha) renderer.setClearAlpha(clearAlpha);
	}
};
var MaskPass = class extends Pass {
	/**
	* Constructs a new mask pass.
	*
	* @param {Scene} scene - The scene to render.
	* @param {Camera} camera - The camera to use.
	*/
	constructor(scene, camera) {
		super("MaskPass", scene, camera);
		this.needsSwap = false;
		this.clearPass = new ClearPass(false, false, true);
		this.inverse = false;
	}
	set mainScene(value) {
		this.scene = value;
	}
	set mainCamera(value) {
		this.camera = value;
	}
	/**
	* Indicates whether the mask should be inverted.
	*
	* @type {Boolean}
	*/
	get inverted() {
		return this.inverse;
	}
	set inverted(value) {
		this.inverse = value;
	}
	/**
	* Indicates whether this pass should clear the stencil buffer.
	*
	* @type {Boolean}
	* @deprecated Use clearPass.enabled instead.
	*/
	get clear() {
		return this.clearPass.enabled;
	}
	set clear(value) {
		this.clearPass.enabled = value;
	}
	/**
	* Returns the internal clear pass.
	*
	* @deprecated Use clearPass.enabled instead.
	* @return {ClearPass} The clear pass.
	*/
	getClearPass() {
		return this.clearPass;
	}
	/**
	* Indicates whether the mask is inverted.
	*
	* @deprecated Use inverted instead.
	* @return {Boolean} Whether the mask is inverted.
	*/
	isInverted() {
		return this.inverted;
	}
	/**
	* Enables or disable mask inversion.
	*
	* @deprecated Use inverted instead.
	* @param {Boolean} value - Whether the mask should be inverted.
	*/
	setInverted(value) {
		this.inverted = value;
	}
	/**
	* Renders the effect.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const context = renderer.getContext();
		const buffers = renderer.state.buffers;
		const scene = this.scene;
		const camera = this.camera;
		const clearPass = this.clearPass;
		const writeValue = this.inverted ? 0 : 1;
		const clearValue = 1 - writeValue;
		buffers.color.setMask(false);
		buffers.depth.setMask(false);
		buffers.color.setLocked(true);
		buffers.depth.setLocked(true);
		buffers.stencil.setTest(true);
		buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
		buffers.stencil.setFunc(context.ALWAYS, writeValue, 4294967295);
		buffers.stencil.setClear(clearValue);
		buffers.stencil.setLocked(true);
		if (this.clearPass.enabled) {
			if (this.renderToScreen) clearPass.render(renderer, null);
			else {
				clearPass.render(renderer, inputBuffer);
				clearPass.render(renderer, outputBuffer);
			}
		}
		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			renderer.render(scene, camera);
		} else {
			renderer.setRenderTarget(inputBuffer);
			renderer.render(scene, camera);
			renderer.setRenderTarget(outputBuffer);
			renderer.render(scene, camera);
		}
		buffers.color.setLocked(false);
		buffers.depth.setLocked(false);
		buffers.stencil.setLocked(false);
		buffers.stencil.setFunc(context.EQUAL, 1, 4294967295);
		buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
		buffers.stencil.setLocked(true);
	}
};
function getSafeSamples(renderer, samples) {
	const gl = renderer.getContext();
	if (samples <= 0 || typeof gl.renderbufferStorageMultisample !== "function") return 0;
	const maxSamples = gl.getParameter(gl.MAX_SAMPLES);
	const safeSamples = Math.min(samples, maxSamples);
	if (safeSamples <= 0) return 0;
	const previousRenderbuffer = gl.getParameter(gl.RENDERBUFFER_BINDING);
	const renderbuffer = gl.createRenderbuffer();
	try {
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorageMultisample(gl.RENDERBUFFER, safeSamples, gl.RGBA8, 1, 1);
		return safeSamples;
	} catch (e) {
		return 0;
	} finally {
		gl.bindRenderbuffer(gl.RENDERBUFFER, previousRenderbuffer);
		gl.deleteRenderbuffer(renderbuffer);
	}
}
var MILLISECONDS_TO_SECONDS = 1 / 1e3;
var SECONDS_TO_MILLISECONDS = 1e3;
var Timer = class {
	/**
	* Constructs a new timer.
	*/
	constructor() {
		this.startTime = performance.now();
		this.previousTime = 0;
		this.currentTime = 0;
		this._delta = 0;
		this._elapsed = 0;
		this._fixedDelta = 1e3 / 60;
		this.timescale = 1;
		this.useFixedDelta = false;
		this._autoReset = false;
	}
	/**
	* Enables or disables auto reset based on page visibility.
	*
	* If enabled, the timer will be reset when the page becomes visible. This effectively pauses the timer when the page
	* is hidden. Has no effect if the API is not supported.
	*
	* @type {Boolean}
	* @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	*/
	get autoReset() {
		return this._autoReset;
	}
	set autoReset(value) {
		if (typeof document !== "undefined" && document.hidden !== void 0) {
			if (value) document.addEventListener("visibilitychange", this);
			else document.removeEventListener("visibilitychange", this);
			this._autoReset = value;
		}
	}
	get delta() {
		return this._delta * MILLISECONDS_TO_SECONDS;
	}
	get fixedDelta() {
		return this._fixedDelta * MILLISECONDS_TO_SECONDS;
	}
	set fixedDelta(value) {
		this._fixedDelta = value * SECONDS_TO_MILLISECONDS;
	}
	get elapsed() {
		return this._elapsed * MILLISECONDS_TO_SECONDS;
	}
	/**
	* Updates this timer.
	*
	* @param {Boolean} [timestamp] - The current time in milliseconds.
	*/
	update(timestamp) {
		if (this.useFixedDelta) this._delta = this.fixedDelta;
		else {
			this.previousTime = this.currentTime;
			this.currentTime = (timestamp !== void 0 ? timestamp : performance.now()) - this.startTime;
			this._delta = this.currentTime - this.previousTime;
		}
		this._delta *= this.timescale;
		this._elapsed += this._delta;
	}
	/**
	* Resets this timer.
	*/
	reset() {
		this._delta = 0;
		this._elapsed = 0;
		this.currentTime = performance.now() - this.startTime;
	}
	getDelta() {
		return this.delta;
	}
	getElapsed() {
		return this.elapsed;
	}
	handleEvent(e) {
		if (!document.hidden) this.currentTime = performance.now() - this.startTime;
	}
	dispose() {
		this.autoReset = false;
	}
};
var EffectComposer$1 = class {
	/**
	* Constructs a new effect composer.
	*
	* @param {WebGLRenderer} renderer - The renderer that should be used.
	* @param {Object} [options] - The options.
	* @param {Boolean} [options.depthBuffer=true] - Whether the main render targets should have a depth buffer.
	* @param {Boolean} [options.stencilBuffer=false] - Whether the main render targets should have a stencil buffer.
	* @param {Number} [options.multisampling=0] - The number of samples used for multisample antialiasing. Requires WebGL 2.
	* @param {TextureDataType} [options.frameBufferType=UnsignedByteType] - The type of the internal frame buffers. It's recommended to use HalfFloatType if possible.
	*/
	constructor(renderer = null, { depthBuffer = true, stencilBuffer = false, multisampling = 0, frameBufferType = UnsignedByteType } = {}) {
		this.renderer = null;
		this.inputBuffer = this.createBuffer(depthBuffer, stencilBuffer, frameBufferType, multisampling);
		this.outputBuffer = this.inputBuffer.clone();
		this.copyPass = new CopyPass();
		this.depthRenderTarget = null;
		this.passes = [];
		this.timer = new Timer();
		this.autoRenderToScreen = true;
		this.setRenderer(renderer);
	}
	/**
	* A stable depth texture to be used by depth-aware passes.
	*
	* @type {DepthTexture}
	* @private
	*/
	get stableDepthTexture() {
		return this.depthRenderTarget === null ? null : this.depthRenderTarget.depthTexture;
	}
	/**
	* The current amount of samples used for multisample anti-aliasing.
	*
	* @type {Number}
	*/
	get multisampling() {
		return this.inputBuffer.samples;
	}
	/**
	* Sets the amount of MSAA samples.
	*
	* Requires WebGL 2. Set to zero to disable multisampling.
	*
	* @type {Number}
	*/
	set multisampling(value) {
		const samples = this.renderer === null ? value : getSafeSamples(this.renderer, value);
		if (this.multisampling === samples) return;
		this.inputBuffer.samples = samples;
		this.outputBuffer.samples = samples;
		this.inputBuffer.dispose();
		this.outputBuffer.dispose();
	}
	/**
	* Returns the internal timer.
	*
	* @return {Timer} The timer.
	*/
	getTimer() {
		return this.timer;
	}
	/**
	* Returns the renderer.
	*
	* @return {WebGLRenderer} The renderer.
	*/
	getRenderer() {
		return this.renderer;
	}
	/**
	* Sets the renderer.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	*/
	setRenderer(renderer) {
		this.renderer = renderer;
		if (renderer !== null) {
			const size = renderer.getSize(new Vector2());
			const alpha = renderer.getContext().getContextAttributes().alpha;
			const frameBufferType = this.inputBuffer.texture.type;
			if (frameBufferType === 1009 && renderer.outputColorSpace === "srgb") {
				this.inputBuffer.texture.colorSpace = SRGBColorSpace;
				this.outputBuffer.texture.colorSpace = SRGBColorSpace;
				this.inputBuffer.dispose();
				this.outputBuffer.dispose();
			}
			const samples = this.multisampling;
			this.multisampling = samples;
			renderer.autoClear = false;
			this.setSize(size.width, size.height);
			for (const pass of this.passes) pass.initialize(renderer, alpha, frameBufferType);
		}
	}
	/**
	* Replaces the current renderer with the given one.
	*
	* The auto clear mechanism of the provided renderer will be disabled. If the new render size differs from the
	* previous one, all passes will be updated.
	*
	* By default, the DOM element of the current renderer will automatically be removed from its parent node and the DOM
	* element of the new renderer will take its place.
	*
	* @deprecated Use setRenderer instead.
	* @param {WebGLRenderer} renderer - The new renderer.
	* @param {Boolean} updateDOM - Indicates whether the old canvas should be replaced by the new one in the DOM.
	* @return {WebGLRenderer} The old renderer.
	*/
	replaceRenderer(renderer, updateDOM = true) {
		const oldRenderer = this.renderer;
		const parent = oldRenderer.domElement.parentNode;
		this.setRenderer(renderer);
		if (updateDOM && parent !== null) {
			parent.removeChild(oldRenderer.domElement);
			parent.appendChild(renderer.domElement);
		}
		return oldRenderer;
	}
	/**
	* Creates a depth texture attachment that will be provided to all passes.
	*
	* To prevent errors or incorrect behavior when the same depth buffer is attached to the input and output buffers,
	* a separate stable depth target is created alongside the ping-pong buffers. All passes receive the stable target's
	* depth texture, which is never used as a render output and therefore cannot create a feedback loop.  The stable
	* texture is populated each frame via blitFramebuffer immediately before the first buffer swap.
	*
	* @private
	*/
	createDepthTexture() {
		const inputDepthTexture = new DepthTexture();
		inputDepthTexture.name = "EffectComposer.InputDepth";
		if (this.inputBuffer.stencilBuffer) {
			inputDepthTexture.format = DepthStencilFormat;
			inputDepthTexture.type = UnsignedInt248Type;
		} else inputDepthTexture.type = FloatType;
		const outputDepthTexture = new DepthTexture();
		outputDepthTexture.format = inputDepthTexture.format;
		outputDepthTexture.type = inputDepthTexture.type;
		outputDepthTexture.name = "EffectComposer.OutputDepth";
		const stableDepthTexture = new DepthTexture();
		stableDepthTexture.format = inputDepthTexture.format;
		stableDepthTexture.type = inputDepthTexture.type;
		stableDepthTexture.name = "EffectComposer.StableDepth";
		this.inputBuffer.depthTexture = inputDepthTexture;
		this.outputBuffer.depthTexture = outputDepthTexture;
		this.inputBuffer.dispose();
		this.outputBuffer.dispose();
		const { width, height } = this.inputBuffer;
		this.depthRenderTarget = new WebGLRenderTarget(width, height, {
			depthBuffer: true,
			stencilBuffer: this.inputBuffer.stencilBuffer,
			depthTexture: stableDepthTexture
		});
	}
	/**
	* Copies the depth buffer from the src render target into the stable depth target.
	*
	* @private
	* @param {WebGLRenderTarget} renderTarget - The render target whose depth buffer should be copied.
	*/
	blitDepthBuffer(renderTarget) {
		const renderer = this.renderer;
		const depthRenderTarget = this.depthRenderTarget;
		const props = renderer.properties;
		const gl = renderer.getContext();
		renderer.setRenderTarget(depthRenderTarget);
		const srcFBO = props.get(renderTarget).__webglFramebuffer;
		const dstFBO = props.get(depthRenderTarget).__webglFramebuffer;
		const blitMask = renderTarget.stencilBuffer ? gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT : gl.DEPTH_BUFFER_BIT;
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, srcFBO);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dstFBO);
		gl.blitFramebuffer(0, 0, renderTarget.width, renderTarget.height, 0, 0, depthRenderTarget.width, depthRenderTarget.height, blitMask, gl.NEAREST);
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
		renderer.setRenderTarget(null);
	}
	/**
	* Deletes the current depth texture.
	*
	* @private
	*/
	deleteDepthTexture() {
		const stableDepthTexture = this.stableDepthTexture;
		for (const pass of this.passes) if (pass.getDepthTexture() === stableDepthTexture) pass.setDepthTexture(null);
		if (this.depthRenderTarget !== null) {
			this.depthRenderTarget.dispose();
			this.depthRenderTarget = null;
		}
		if (this.inputBuffer.depthTexture !== null) {
			this.inputBuffer.depthTexture.dispose();
			this.inputBuffer.depthTexture = null;
		}
		if (this.outputBuffer.depthTexture !== null) {
			this.outputBuffer.depthTexture.dispose();
			this.outputBuffer.depthTexture = null;
		}
	}
	/**
	* Creates a new render target.
	*
	* @private
	* @param {Boolean} depthBuffer - Whether the render target should have a depth buffer.
	* @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
	* @param {Number} type - The frame buffer type.
	* @param {Number} multisampling - The number of samples to use for antialiasing.
	* @return {WebGLRenderTarget} A new render target that equals the renderer's canvas.
	*/
	createBuffer(depthBuffer, stencilBuffer, type, multisampling) {
		const renderer = this.renderer;
		const size = renderer === null ? new Vector2() : renderer.getDrawingBufferSize(new Vector2());
		const renderTarget = new WebGLRenderTarget(size.width, size.height, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			samples: multisampling,
			stencilBuffer,
			depthBuffer,
			type
		});
		if (type === 1009 && renderer !== null && renderer.outputColorSpace === "srgb") renderTarget.texture.colorSpace = SRGBColorSpace;
		renderTarget.texture.name = "EffectComposer.Buffer";
		renderTarget.texture.generateMipmaps = false;
		return renderTarget;
	}
	/**
	* Can be used to change the main scene for all registered passes and effects.
	*
	* @param {Scene} scene - The scene.
	*/
	setMainScene(scene) {
		for (const pass of this.passes) pass.mainScene = scene;
	}
	/**
	* Can be used to change the main camera for all registered passes and effects.
	*
	* @param {Camera} camera - The camera.
	*/
	setMainCamera(camera) {
		for (const pass of this.passes) pass.mainCamera = camera;
	}
	/**
	* Adds a pass, optionally at a specific index.
	*
	* @param {Pass} pass - A new pass.
	* @param {Number} [index] - An index at which the pass should be inserted.
	*/
	addPass(pass, index) {
		const passes = this.passes;
		const renderer = this.renderer;
		const drawingBufferSize = renderer.getDrawingBufferSize(new Vector2());
		const alpha = renderer.getContext().getContextAttributes().alpha;
		const frameBufferType = this.inputBuffer.texture.type;
		pass.renderer = renderer;
		pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
		pass.initialize(renderer, alpha, frameBufferType);
		if (this.autoRenderToScreen) {
			if (passes.length > 0) passes[passes.length - 1].renderToScreen = false;
			if (pass.renderToScreen) this.autoRenderToScreen = false;
		}
		if (index !== void 0) passes.splice(index, 0, pass);
		else passes.push(pass);
		if (this.autoRenderToScreen) passes[passes.length - 1].renderToScreen = true;
		if (pass.needsDepthTexture || this.depthRenderTarget !== null) {
			if (this.depthRenderTarget === null) {
				this.createDepthTexture();
				for (const existingPass of passes) existingPass.setDepthTexture(this.stableDepthTexture);
			} else pass.setDepthTexture(this.stableDepthTexture);
		}
	}
	/**
	* Removes a pass.
	*
	* @param {Pass} pass - The pass.
	*/
	removePass(pass) {
		const passes = this.passes;
		const index = passes.indexOf(pass);
		if (index !== -1 && passes.splice(index, 1).length > 0) {
			const stableDepthTexture = this.stableDepthTexture;
			if (stableDepthTexture !== null) {
				const reducer = (a, b) => a || b.needsDepthTexture;
				if (!passes.reduce(reducer, false)) {
					if (pass.getDepthTexture() === stableDepthTexture) pass.setDepthTexture(null);
					this.deleteDepthTexture();
				}
			}
			if (this.autoRenderToScreen) {
				if (index === passes.length) {
					pass.renderToScreen = false;
					if (passes.length > 0) passes[passes.length - 1].renderToScreen = true;
				}
			}
		}
	}
	/**
	* Removes all passes.
	*/
	removeAllPasses() {
		const passes = this.passes;
		this.deleteDepthTexture();
		if (passes.length > 0) {
			if (this.autoRenderToScreen) passes[passes.length - 1].renderToScreen = false;
			this.passes = [];
		}
	}
	/**
	* Renders all enabled passes in the order in which they were added.
	*
	* @param {Number} [deltaTime] - The time since the last frame in seconds.
	*/
	render(deltaTime) {
		const renderer = this.renderer;
		const copyPass = this.copyPass;
		let inputBuffer = this.inputBuffer;
		let outputBuffer = this.outputBuffer;
		let buffer;
		let stencilTest = false;
		if (deltaTime === void 0) {
			this.timer.update();
			deltaTime = this.timer.getDelta();
		}
		for (const pass of this.passes) {
			if (!pass.enabled) continue;
			pass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
			if (pass.needsDepthBlit) {
				if (this.depthRenderTarget !== null) this.blitDepthBuffer(inputBuffer);
			}
			if (pass.needsSwap) {
				if (stencilTest) {
					copyPass.renderToScreen = pass.renderToScreen;
					const context = renderer.getContext();
					const stencil = renderer.state.buffers.stencil;
					stencil.setFunc(context.NOTEQUAL, 1, 4294967295);
					copyPass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
					stencil.setFunc(context.EQUAL, 1, 4294967295);
				}
				buffer = inputBuffer;
				inputBuffer = outputBuffer;
				outputBuffer = buffer;
			}
			if (pass instanceof MaskPass) stencilTest = true;
			else if (pass instanceof ClearMaskPass) stencilTest = false;
		}
	}
	/**
	* Sets the size of the buffers, passes and the renderer.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	* @param {Boolean} [updateStyle] - Determines whether the style of the canvas should be updated.
	*/
	setSize(width, height, updateStyle) {
		const renderer = this.renderer;
		const currentSize = renderer.getSize(new Vector2());
		if (width === void 0 || height === void 0) {
			width = currentSize.width;
			height = currentSize.height;
		}
		if (currentSize.width !== width || currentSize.height !== height) renderer.setSize(width, height, updateStyle);
		const drawingBufferSize = renderer.getDrawingBufferSize(new Vector2());
		this.inputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
		this.outputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
		if (this.depthRenderTarget !== null) this.depthRenderTarget.setSize(drawingBufferSize.width, drawingBufferSize.height);
		for (const pass of this.passes) pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
	}
	/**
	* Resets this composer by deleting all passes and creating new buffers.
	*/
	reset() {
		this.dispose();
		this.autoRenderToScreen = true;
	}
	/**
	* Disposes this composer and all passes.
	*/
	dispose() {
		for (const pass of this.passes) pass.dispose();
		this.deleteDepthTexture();
		this.inputBuffer.dispose();
		this.outputBuffer.dispose();
		this.copyPass.dispose();
		this.timer.dispose();
		this.passes = [];
		Pass.fullscreenGeometry.dispose();
	}
};
var EffectAttribute = {
	NONE: 0,
	DEPTH: 1,
	CONVOLUTION: 2
};
var EffectShaderSection = {
	FRAGMENT_HEAD: "FRAGMENT_HEAD",
	FRAGMENT_MAIN_UV: "FRAGMENT_MAIN_UV",
	FRAGMENT_MAIN_IMAGE: "FRAGMENT_MAIN_IMAGE",
	VERTEX_HEAD: "VERTEX_HEAD",
	VERTEX_MAIN_SUPPORT: "VERTEX_MAIN_SUPPORT"
};
var EffectShaderData = class {
	/**
	* Constructs new shader data.
	*/
	constructor() {
		this.shaderParts = /* @__PURE__ */ new Map([
			[EffectShaderSection.FRAGMENT_HEAD, null],
			[EffectShaderSection.FRAGMENT_MAIN_UV, null],
			[EffectShaderSection.FRAGMENT_MAIN_IMAGE, null],
			[EffectShaderSection.VERTEX_HEAD, null],
			[EffectShaderSection.VERTEX_MAIN_SUPPORT, null]
		]);
		this.defines = /* @__PURE__ */ new Map();
		this.uniforms = /* @__PURE__ */ new Map();
		this.blendModes = /* @__PURE__ */ new Map();
		this.extensions = /* @__PURE__ */ new Set();
		this.attributes = EffectAttribute.NONE;
		this.varyings = /* @__PURE__ */ new Set();
		this.uvTransformation = false;
		this.readDepth = false;
		this.colorSpace = LinearSRGBColorSpace;
	}
};
var workaroundEnabled = false;
var OverrideMaterialManager = class {
	/**
	* Constructs a new override material manager.
	*
	* @param {Material} [material=null] - An override material.
	*/
	constructor(material = null) {
		this.originalMaterials = /* @__PURE__ */ new Map();
		this.material = null;
		this.materials = null;
		this.materialsBackSide = null;
		this.materialsDoubleSide = null;
		this.materialsFlatShaded = null;
		this.materialsFlatShadedBackSide = null;
		this.materialsFlatShadedDoubleSide = null;
		this.setMaterial(material);
		this.meshCount = 0;
		this.replaceMaterial = (node) => {
			if (node.isMesh) {
				let materials;
				if (node.material.flatShading) switch (node.material.side) {
					case 2:
						materials = this.materialsFlatShadedDoubleSide;
						break;
					case 1:
						materials = this.materialsFlatShadedBackSide;
						break;
					default: materials = this.materialsFlatShaded;
				}
				else switch (node.material.side) {
					case 2:
						materials = this.materialsDoubleSide;
						break;
					case 1:
						materials = this.materialsBackSide;
						break;
					default: materials = this.materials;
				}
				this.originalMaterials.set(node, node.material);
				if (node.isSkinnedMesh) node.material = materials[2];
				else if (node.isInstancedMesh) node.material = materials[1];
				else node.material = materials[0];
				++this.meshCount;
			}
		};
	}
	/**
	* Clones the given material.
	*
	* @private
	* @param {Material} material - The material.
	* @return {Material} The cloned material.
	*/
	cloneMaterial(material) {
		if (!(material instanceof ShaderMaterial)) return material.clone();
		const uniforms = material.uniforms;
		const textureUniforms = /* @__PURE__ */ new Map();
		for (const key in uniforms) {
			const value = uniforms[key].value;
			if (value.isRenderTargetTexture) {
				uniforms[key].value = null;
				textureUniforms.set(key, value);
			}
		}
		const clone = material.clone();
		for (const entry of textureUniforms) {
			uniforms[entry[0]].value = entry[1];
			clone.uniforms[entry[0]].value = entry[1];
		}
		return clone;
	}
	/**
	* Sets the override material.
	*
	* @param {Material} material - The material.
	*/
	setMaterial(material) {
		this.disposeMaterials();
		this.material = material;
		if (material !== null) {
			const materials = this.materials = [
				this.cloneMaterial(material),
				this.cloneMaterial(material),
				this.cloneMaterial(material)
			];
			for (const m2 of materials) {
				m2.uniforms = Object.assign({}, material.uniforms);
				m2.side = 0;
			}
			materials[2].skinning = true;
			this.materialsBackSide = materials.map((m2) => {
				const c2 = this.cloneMaterial(m2);
				c2.uniforms = Object.assign({}, material.uniforms);
				c2.side = 1;
				return c2;
			});
			this.materialsDoubleSide = materials.map((m2) => {
				const c2 = this.cloneMaterial(m2);
				c2.uniforms = Object.assign({}, material.uniforms);
				c2.side = 2;
				return c2;
			});
			this.materialsFlatShaded = materials.map((m2) => {
				const c2 = this.cloneMaterial(m2);
				c2.uniforms = Object.assign({}, material.uniforms);
				c2.flatShading = true;
				return c2;
			});
			this.materialsFlatShadedBackSide = materials.map((m2) => {
				const c2 = this.cloneMaterial(m2);
				c2.uniforms = Object.assign({}, material.uniforms);
				c2.flatShading = true;
				c2.side = 1;
				return c2;
			});
			this.materialsFlatShadedDoubleSide = materials.map((m2) => {
				const c2 = this.cloneMaterial(m2);
				c2.uniforms = Object.assign({}, material.uniforms);
				c2.flatShading = true;
				c2.side = 2;
				return c2;
			});
		}
	}
	/**
	* Renders the scene with the override material.
	*
	* @private
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Scene} scene - A scene.
	* @param {Camera} camera - A camera.
	*/
	render(renderer, scene, camera) {
		const shadowMapEnabled = renderer.shadowMap.enabled;
		renderer.shadowMap.enabled = false;
		if (workaroundEnabled) {
			const originalMaterials = this.originalMaterials;
			this.meshCount = 0;
			scene.traverse(this.replaceMaterial);
			renderer.render(scene, camera);
			for (const entry of originalMaterials) entry[0].material = entry[1];
			if (this.meshCount !== originalMaterials.size) originalMaterials.clear();
		} else {
			const overrideMaterial = scene.overrideMaterial;
			scene.overrideMaterial = this.material;
			renderer.render(scene, camera);
			scene.overrideMaterial = overrideMaterial;
		}
		renderer.shadowMap.enabled = shadowMapEnabled;
	}
	/**
	* Deletes cloned override materials.
	*
	* @private
	*/
	disposeMaterials() {
		if (this.material !== null) {
			const materials = this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);
			for (const m2 of materials) m2.dispose();
		}
	}
	/**
	* Performs cleanup tasks.
	*/
	dispose() {
		this.originalMaterials.clear();
		this.disposeMaterials();
	}
	/**
	* Indicates whether the override material workaround is enabled.
	*
	* @type {Boolean}
	*/
	static get workaroundEnabled() {
		return workaroundEnabled;
	}
	/**
	* Enables or disables the override material workaround globally.
	*
	* This only affects post processing passes and effects.
	*
	* @type {Boolean}
	*/
	static set workaroundEnabled(value) {
		workaroundEnabled = value;
	}
};
var AUTO_SIZE = -1;
var Resolution = class extends EventDispatcher {
	/**
	* Constructs a new resolution.
	*
	* @param {Resizable} [resizable=null] - Deprecated. Use `addEventListener("change", listener)` instead.
	* @param {Number} [width=Resolution.AUTO_SIZE] - The preferred width.
	* @param {Number} [height=Resolution.AUTO_SIZE] - The preferred height.
	* @param {Number} [scale=1.0] - A resolution scale.
	*/
	constructor(resizable = null, width = AUTO_SIZE, height = AUTO_SIZE, scale = 1) {
		super();
		if (resizable !== null) this.addEventListener("change", () => resizable.setSize(this.baseSize.width, this.baseSize.height));
		this.baseSize = new Vector2(1, 1);
		this.preferredSize = new Vector2(width, height);
		this.target = this.preferredSize;
		this.s = scale;
		this.effectiveSize = new Vector2();
		this.addEventListener("change", () => this.updateEffectiveSize());
		this.updateEffectiveSize();
	}
	/**
	* Calculates the effective size.
	*
	* @private
	*/
	updateEffectiveSize() {
		const base = this.baseSize;
		const preferred = this.preferredSize;
		const effective = this.effectiveSize;
		const scale = this.scale;
		if (preferred.width !== AUTO_SIZE) effective.width = preferred.width;
		else if (preferred.height !== AUTO_SIZE) effective.width = Math.round(preferred.height * (base.width / Math.max(base.height, 1)));
		else effective.width = Math.round(base.width * scale);
		if (preferred.height !== AUTO_SIZE) effective.height = preferred.height;
		else if (preferred.width !== AUTO_SIZE) effective.height = Math.round(preferred.width / Math.max(base.width / Math.max(base.height, 1), 1));
		else effective.height = Math.round(base.height * scale);
	}
	/**
	* The effective width.
	*
	* If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
	*
	* @type {Number}
	*/
	get width() {
		return this.effectiveSize.width;
	}
	set width(value) {
		this.preferredWidth = value;
	}
	/**
	* The effective height.
	*
	* If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
	*
	* @type {Number}
	*/
	get height() {
		return this.effectiveSize.height;
	}
	set height(value) {
		this.preferredHeight = value;
	}
	/**
	* Returns the effective width.
	*
	* If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
	*
	* @deprecated Use width instead.
	* @return {Number} The effective width.
	*/
	getWidth() {
		return this.width;
	}
	/**
	* Returns the effective height.
	*
	* If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
	*
	* @deprecated Use height instead.
	* @return {Number} The effective height.
	*/
	getHeight() {
		return this.height;
	}
	/**
	* The resolution scale.
	*
	* @type {Number}
	*/
	get scale() {
		return this.s;
	}
	set scale(value) {
		if (this.s !== value) {
			this.s = value;
			this.preferredSize.setScalar(AUTO_SIZE);
			this.dispatchEvent({ type: "change" });
		}
	}
	/**
	* Returns the current resolution scale.
	*
	* @deprecated Use scale instead.
	* @return {Number} The scale.
	*/
	getScale() {
		return this.scale;
	}
	/**
	* Sets the resolution scale.
	*
	* Also sets the preferred resolution to {@link Resizer.AUTO_SIZE}.
	*
	* @deprecated Use scale instead.
	* @param {Number} value - The scale.
	*/
	setScale(value) {
		this.scale = value;
	}
	/**
	* The base width.
	*
	* @type {Number}
	*/
	get baseWidth() {
		return this.baseSize.width;
	}
	set baseWidth(value) {
		if (this.baseSize.width !== value) {
			this.baseSize.width = value;
			this.dispatchEvent({ type: "change" });
		}
	}
	/**
	* Returns the base width.
	*
	* @deprecated Use baseWidth instead.
	* @return {Number} The base width.
	*/
	getBaseWidth() {
		return this.baseWidth;
	}
	/**
	* Sets the base width.
	*
	* @deprecated Use baseWidth instead.
	* @param {Number} value - The width.
	*/
	setBaseWidth(value) {
		this.baseWidth = value;
	}
	/**
	* The base height.
	*
	* @type {Number}
	*/
	get baseHeight() {
		return this.baseSize.height;
	}
	set baseHeight(value) {
		if (this.baseSize.height !== value) {
			this.baseSize.height = value;
			this.dispatchEvent({ type: "change" });
		}
	}
	/**
	* Returns the base height.
	*
	* @deprecated Use baseHeight instead.
	* @return {Number} The base height.
	*/
	getBaseHeight() {
		return this.baseHeight;
	}
	/**
	* Sets the base height.
	*
	* @deprecated Use baseHeight instead.
	* @param {Number} value - The height.
	*/
	setBaseHeight(value) {
		this.baseHeight = value;
	}
	/**
	* Sets the base size.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setBaseSize(width, height) {
		if (this.baseSize.width !== width || this.baseSize.height !== height) {
			this.baseSize.set(width, height);
			this.dispatchEvent({ type: "change" });
		}
	}
	/**
	* The preferred width.
	*
	* @type {Number}
	*/
	get preferredWidth() {
		return this.preferredSize.width;
	}
	set preferredWidth(value) {
		if (this.preferredSize.width !== value) {
			this.preferredSize.width = value;
			this.dispatchEvent({ type: "change" });
		}
	}
	/**
	* Returns the preferred width.
	*
	* @deprecated Use preferredWidth instead.
	* @return {Number} The preferred width.
	*/
	getPreferredWidth() {
		return this.preferredWidth;
	}
	/**
	* Sets the preferred width.
	*
	* Use {@link Resizer.AUTO_SIZE} to automatically calculate the width based on the height and aspect ratio.
	*
	* @deprecated Use preferredWidth instead.
	* @param {Number} value - The width.
	*/
	setPreferredWidth(value) {
		this.preferredWidth = value;
	}
	/**
	* The preferred height.
	*
	* @type {Number}
	*/
	get preferredHeight() {
		return this.preferredSize.height;
	}
	set preferredHeight(value) {
		if (this.preferredSize.height !== value) {
			this.preferredSize.height = value;
			this.dispatchEvent({ type: "change" });
		}
	}
	/**
	* Returns the preferred height.
	*
	* @deprecated Use preferredHeight instead.
	* @return {Number} The preferred height.
	*/
	getPreferredHeight() {
		return this.preferredHeight;
	}
	/**
	* Sets the preferred height.
	*
	* Use {@link Resizer.AUTO_SIZE} to automatically calculate the height based on the width and aspect ratio.
	*
	* @deprecated Use preferredHeight instead.
	* @param {Number} value - The height.
	*/
	setPreferredHeight(value) {
		this.preferredHeight = value;
	}
	/**
	* Sets the preferred size.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setPreferredSize(width, height) {
		if (this.preferredSize.width !== width || this.preferredSize.height !== height) {
			this.preferredSize.set(width, height);
			this.dispatchEvent({ type: "change" });
		}
	}
	/**
	* Copies the given resolution.
	*
	* @param {Resolution} resolution - The resolution.
	*/
	copy(resolution) {
		this.s = resolution.scale;
		this.baseSize.set(resolution.baseWidth, resolution.baseHeight);
		this.preferredSize.set(resolution.preferredWidth, resolution.preferredHeight);
		this.dispatchEvent({ type: "change" });
	}
	/**
	* An auto sizing constant.
	*
	* Can be used to automatically calculate the width or height based on the original aspect ratio.
	*
	* @type {Number}
	*/
	static get AUTO_SIZE() {
		return AUTO_SIZE;
	}
};
var BlendFunction = {
	SKIP: 9,
	SET: 30,
	ADD: 0,
	ALPHA: 1,
	AVERAGE: 2,
	COLOR: 3,
	COLOR_BURN: 4,
	COLOR_DODGE: 5,
	DARKEN: 6,
	DIFFERENCE: 7,
	DIVIDE: 8,
	DST: 9,
	EXCLUSION: 10,
	HARD_LIGHT: 11,
	HARD_MIX: 12,
	HUE: 13,
	INVERT: 14,
	INVERT_RGB: 15,
	LIGHTEN: 16,
	LINEAR_BURN: 17,
	LINEAR_DODGE: 18,
	LINEAR_LIGHT: 19,
	LUMINOSITY: 20,
	MULTIPLY: 21,
	NEGATION: 22,
	NORMAL: 23,
	OVERLAY: 24,
	PIN_LIGHT: 25,
	REFLECT: 26,
	SATURATION: 27,
	SCREEN: 28,
	SOFT_LIGHT: 29,
	SRC: 30,
	SUBTRACT: 31,
	VIVID_LIGHT: 32
};
var blendFunctions = /* @__PURE__ */ new Map([
	[BlendFunction.ADD, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.ALPHA, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,src.a*opacity);}`],
	[BlendFunction.AVERAGE, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=(dst.rgb+src.rgb)*0.5;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.COLOR, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.xy,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.COLOR_BURN, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=mix(step(0.0,b)*(1.0-min(vec3(1.0),(1.0-a)/max(b,1e-9))),vec3(1.0),step(1.0,a));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.COLOR_DODGE, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=step(0.0,a)*mix(min(vec3(1.0),a/max(1.0-b,1e-9)),vec3(1.0),step(1.0,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.DARKEN, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.DIFFERENCE, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=abs(dst.rgb-src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.DIVIDE, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb/max(src.rgb,1e-9);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.DST, null],
	[BlendFunction.EXCLUSION, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-2.0*dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.HARD_LIGHT, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb,1.0);vec3 b=min(src.rgb,1.0);vec3 c=mix(2.0*a*b,1.0-2.0*(1.0-a)*(1.0-b),step(0.5,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.HARD_MIX, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=step(1.0,dst.rgb+src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.HUE, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.x,a.yz));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.INVERT, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.INVERT_RGB, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=src.rgb*max(1.0-dst.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.LIGHTEN, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.LINEAR_BURN, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.LINEAR_DODGE, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb+src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.LINEAR_LIGHT, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(2.0*src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.LUMINOSITY, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.xy,b.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.MULTIPLY, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.NEGATION, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-abs(1.0-dst.rgb-src.rgb),0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.NORMAL, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,opacity);}`],
	[BlendFunction.OVERLAY, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=2.0*src.rgb*dst.rgb;vec3 b=1.0-2.0*(1.0-src.rgb)*(1.0-dst.rgb);vec3 c=mix(a,b,step(0.5,dst.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.PIN_LIGHT, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 c=mix(mix(src2,dst.rgb,step(0.5*dst.rgb,src.rgb)),max(src2-1.0,vec3(0.0)),step(dst.rgb,src2-1.0));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.REFLECT, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb*dst.rgb/max(1.0-src.rgb,1e-9),1.0);vec3 c=mix(a,src.rgb,step(1.0,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.SATURATION, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.x,b.y,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.SCREEN, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-min(dst.rgb*src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.SOFT_LIGHT, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 d=dst.rgb+(src2-1.0);vec3 w=step(0.5,src.rgb);vec3 a=dst.rgb-(1.0-src2)*dst.rgb*(1.0-dst.rgb);vec3 b=mix(d*(sqrt(dst.rgb)-dst.rgb),d*dst.rgb*((16.0*dst.rgb-12.0)*dst.rgb+3.0),w*(1.0-step(0.25,dst.rgb)));vec3 c=mix(a,b,w);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.SRC, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return src;}`],
	[BlendFunction.SUBTRACT, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`],
	[BlendFunction.VIVID_LIGHT, `vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=mix(max(1.0-min((1.0-dst.rgb)/(2.0*src.rgb),1.0),0.0),min(dst.rgb/(2.0*(1.0-src.rgb)),1.0),step(0.5,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}`]
]);
var BlendMode = class extends EventDispatcher {
	/**
	* Constructs a new blend mode.
	*
	* @param {BlendFunction} blendFunction - The blend function.
	* @param {Number} opacity - The opacity of the color that will be blended with the base color.
	*/
	constructor(blendFunction, opacity = 1) {
		super();
		this._blendFunction = blendFunction;
		this.opacity = new Uniform(opacity);
	}
	/**
	* Returns the opacity.
	*
	* @return {Number} The opacity.
	*/
	getOpacity() {
		return this.opacity.value;
	}
	/**
	* Sets the opacity.
	*
	* @param {Number} value - The opacity.
	*/
	setOpacity(value) {
		this.opacity.value = value;
	}
	/**
	* The blend function.
	*
	* @type {BlendFunction}
	*/
	get blendFunction() {
		return this._blendFunction;
	}
	set blendFunction(value) {
		this._blendFunction = value;
		this.dispatchEvent({ type: "change" });
	}
	/**
	* Returns the blend function.
	*
	* @deprecated Use blendFunction instead.
	* @return {BlendFunction} The blend function.
	*/
	getBlendFunction() {
		return this.blendFunction;
	}
	/**
	* Sets the blend function.
	*
	* @deprecated Use blendFunction instead.
	* @param {BlendFunction} value - The blend function.
	*/
	setBlendFunction(value) {
		this.blendFunction = value;
	}
	/**
	* Returns the blend function shader code.
	*
	* @return {String} The blend function shader code.
	*/
	getShaderCode() {
		return blendFunctions.get(this.blendFunction);
	}
};
var Effect = class extends EventDispatcher {
	/**
	* Constructs a new effect.
	*
	* @param {String} name - The name of this effect. Doesn't have to be unique.
	* @param {String} fragmentShader - The fragment shader. This shader is required.
	* @param {Object} [options] - Additional options.
	* @param {EffectAttribute} [options.attributes=EffectAttribute.NONE] - The effect attributes that determine the execution priority and resource requirements.
	* @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	* @param {Map<String, String>} [options.defines] - Custom preprocessor macro definitions. Keys are names and values are code.
	* @param {Map<String, Uniform>} [options.uniforms] - Custom shader uniforms. Keys are names and values are uniforms.
	* @param {Set<WebGLExtension>} [options.extensions] - WebGL extensions.
	* @param {String} [options.vertexShader=null] - The vertex shader. Most effects don't need one.
	*/
	constructor(name, fragmentShader, { attributes = EffectAttribute.NONE, blendFunction = BlendFunction.NORMAL, defines = /* @__PURE__ */ new Map(), uniforms = /* @__PURE__ */ new Map(), extensions = null, vertexShader = null } = {}) {
		super();
		this.name = name;
		this.renderer = null;
		this.attributes = attributes;
		this.fragmentShader = fragmentShader;
		this.vertexShader = vertexShader;
		this.defines = defines;
		this.uniforms = uniforms;
		this.extensions = extensions;
		this.blendMode = new BlendMode(blendFunction);
		this.blendMode.addEventListener("change", (event) => this.setChanged());
		this._inputColorSpace = LinearSRGBColorSpace;
		this._outputColorSpace = "";
	}
	/**
	* The input color space.
	*
	* @type {ColorSpace}
	* @experimental
	*/
	get inputColorSpace() {
		return this._inputColorSpace;
	}
	/**
	* @type {ColorSpace}
	* @protected
	* @experimental
	*/
	set inputColorSpace(value) {
		this._inputColorSpace = value;
		this.setChanged();
	}
	/**
	* The output color space.
	*
	* Should only be changed if this effect converts the input colors to a different color space.
	*
	* @type {ColorSpace}
	* @experimental
	*/
	get outputColorSpace() {
		return this._outputColorSpace;
	}
	/**
	* @type {ColorSpace}
	* @protected
	* @experimental
	*/
	set outputColorSpace(value) {
		this._outputColorSpace = value;
		this.setChanged();
	}
	/**
	* Sets the main scene.
	*
	* @type {Scene}
	*/
	set mainScene(value) {}
	/**
	* Sets the main camera.
	*
	* @type {Camera}
	*/
	set mainCamera(value) {}
	/**
	* Returns the name of this effect.
	*
	* @deprecated Use name instead.
	* @return {String} The name.
	*/
	getName() {
		return this.name;
	}
	/**
	* Sets the renderer.
	*
	* @deprecated
	* @param {WebGLRenderer} renderer - The renderer.
	*/
	setRenderer(renderer) {
		this.renderer = renderer;
	}
	/**
	* Returns the preprocessor macro definitions.
	*
	* @deprecated Use defines instead.
	* @return {Map<String, String>} The extensions.
	*/
	getDefines() {
		return this.defines;
	}
	/**
	* Returns the uniforms of this effect.
	*
	* @deprecated Use uniforms instead.
	* @return {Map<String, Uniform>} The extensions.
	*/
	getUniforms() {
		return this.uniforms;
	}
	/**
	* Returns the WebGL extensions that are required by this effect.
	*
	* @deprecated Use extensions instead.
	* @return {Set<WebGLExtension>} The extensions.
	*/
	getExtensions() {
		return this.extensions;
	}
	/**
	* Returns the blend mode.
	*
	* The result of this effect will be blended with the result of the previous effect using this blend mode.
	*
	* @deprecated Use blendMode instead.
	* @return {BlendMode} The blend mode.
	*/
	getBlendMode() {
		return this.blendMode;
	}
	/**
	* Returns the effect attributes.
	*
	* @return {EffectAttribute} The attributes.
	*/
	getAttributes() {
		return this.attributes;
	}
	/**
	* Sets the effect attributes.
	*
	* Effects that have the same attributes will be executed in the order in which they were registered. Some attributes
	* imply a higher priority.
	*
	* @protected
	* @param {EffectAttribute} attributes - The attributes.
	*/
	setAttributes(attributes) {
		this.attributes = attributes;
		this.setChanged();
	}
	/**
	* Returns the fragment shader.
	*
	* @return {String} The fragment shader.
	*/
	getFragmentShader() {
		return this.fragmentShader;
	}
	/**
	* Sets the fragment shader.
	*
	* @protected
	* @param {String} fragmentShader - The fragment shader.
	*/
	setFragmentShader(fragmentShader) {
		this.fragmentShader = fragmentShader;
		this.setChanged();
	}
	/**
	* Returns the vertex shader.
	*
	* @return {String} The vertex shader.
	*/
	getVertexShader() {
		return this.vertexShader;
	}
	/**
	* Sets the vertex shader.
	*
	* @protected
	* @param {String} vertexShader - The vertex shader.
	*/
	setVertexShader(vertexShader) {
		this.vertexShader = vertexShader;
		this.setChanged();
	}
	/**
	* Informs the associated {@link EffectPass} that this effect requires a shader recompilation.
	*
	* Should be called after changing macros or extensions and after adding/removing uniforms.
	*
	* @protected
	*/
	setChanged() {
		this.dispatchEvent({ type: "change" });
	}
	/**
	* Sets the depth texture.
	*
	* You may override this method if your effect requires direct access to the depth texture that is bound to the
	* associated {@link EffectPass}.
	*
	* @param {Texture} depthTexture - A depth texture.
	* @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	*/
	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {}
	/**
	* Updates this effect by performing supporting operations.
	*
	* This method is called by the {@link EffectPass} right before the main fullscreen render operation, even if the
	* blend function is set to `SKIP`.
	*
	* You may override this method if you need to update custom uniforms or render additional off-screen textures.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	*/
	update(renderer, inputBuffer, deltaTime) {}
	/**
	* Updates the size of this effect.
	*
	* You may override this method if you want to be informed about the size of the backbuffer/canvas.
	* This method is called before {@link initialize} and every time the size of the {@link EffectComposer} changes.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {}
	/**
	* Performs initialization tasks.
	*
	* This method is called when the associated {@link EffectPass} is added to an {@link EffectComposer}.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	* @example if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }
	*/
	initialize(renderer, alpha, frameBufferType) {}
	/**
	* Performs a shallow search for properties that define a dispose method and deletes them.
	*
	* The {@link EffectComposer} calls this method when it is being destroyed.
	*/
	dispose() {
		for (const key of Object.keys(this)) {
			const property = this[key];
			if (property instanceof WebGLRenderTarget || property instanceof Material || property instanceof Texture || property instanceof Pass) this[key].dispose();
		}
	}
};
var KernelSize = {
	VERY_SMALL: 0,
	SMALL: 1,
	MEDIUM: 2,
	LARGE: 3,
	VERY_LARGE: 4,
	HUGE: 5
};
var convolution_kawase_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec4 sum=texture2D(inputBuffer,vUv0);sum+=texture2D(inputBuffer,vUv1);sum+=texture2D(inputBuffer,vUv2);sum+=texture2D(inputBuffer,vUv3);gl_FragColor=sum*0.25;
#include <colorspace_fragment>
}`;
var convolution_kawase_default2 = `uniform vec4 texelSize;uniform float kernel;uniform float scale;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vec2 dUv=(texelSize.xy*vec2(kernel)+texelSize.zw)*scale;vUv0=vec2(uv.x-dUv.x,uv.y+dUv.y);vUv1=vec2(uv.x+dUv.x,uv.y+dUv.y);vUv2=vec2(uv.x+dUv.x,uv.y-dUv.y);vUv3=vec2(uv.x-dUv.x,uv.y-dUv.y);gl_Position=vec4(position.xy,1.0,1.0);}`;
var kernelPresets = [
	new Float32Array([0, 0]),
	new Float32Array([
		0,
		1,
		1
	]),
	new Float32Array([
		0,
		1,
		1,
		2
	]),
	new Float32Array([
		0,
		1,
		2,
		2,
		3
	]),
	new Float32Array([
		0,
		1,
		2,
		3,
		4,
		4,
		5
	]),
	new Float32Array([
		0,
		1,
		2,
		3,
		4,
		5,
		7,
		8,
		9,
		10
	])
];
var KawaseBlurMaterial = class extends ShaderMaterial {
	/**
	* Constructs a new convolution material.
	*
	* TODO Remove texelSize param.
	* @param {Vector4} [texelSize] - Deprecated.
	*/
	constructor(texelSize = new Vector4()) {
		super({
			name: "KawaseBlurMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector4()),
				scale: new Uniform(1),
				kernel: new Uniform(0)
			},
			blending: 0,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader: convolution_kawase_default,
			vertexShader: convolution_kawase_default2
		});
		this.setTexelSize(texelSize.x, texelSize.y);
		this.kernelSize = KernelSize.MEDIUM;
	}
	/**
	* The input buffer.
	*
	* @type {Texture}
	*/
	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* Sets the input buffer.
	*
	* @deprecated Use inputBuffer instead.
	* @param {Texture} value - The input buffer.
	*/
	setInputBuffer(value) {
		this.inputBuffer = value;
	}
	/**
	* The kernel sequence for the current kernel size.
	*
	* @type {Float32Array}
	*/
	get kernelSequence() {
		return kernelPresets[this.kernelSize];
	}
	/**
	* The blur scale.
	*
	* @type {Number}
	*/
	get scale() {
		return this.uniforms.scale.value;
	}
	set scale(value) {
		this.uniforms.scale.value = value;
	}
	/**
	* Returns the blur scale.
	*
	* @deprecated Use scale instead.
	* @return {Number} The scale.
	*/
	getScale() {
		return this.uniforms.scale.value;
	}
	/**
	* Sets the blur scale.
	*
	* @deprecated Use scale instead.
	* @return {Number} value - The scale.
	*/
	setScale(value) {
		this.uniforms.scale.value = value;
	}
	/**
	* Returns the kernel.
	*
	* @return {Float32Array} The kernel.
	* @deprecated Implementation detail, removed with no replacement.
	*/
	getKernel() {
		return null;
	}
	/**
	* The current kernel.
	*
	* @type {Number}
	*/
	get kernel() {
		return this.uniforms.kernel.value;
	}
	set kernel(value) {
		this.uniforms.kernel.value = value;
	}
	/**
	* Sets the current kernel.
	*
	* @deprecated Use kernel instead.
	* @param {Number} value - The kernel.
	*/
	setKernel(value) {
		this.kernel = value;
	}
	/**
	* Sets the texel size.
	*
	* @deprecated Use setSize() instead.
	* @param {Number} x - The texel width.
	* @param {Number} y - The texel height.
	*/
	setTexelSize(x, y) {
		this.uniforms.texelSize.value.set(x, y, x * .5, y * .5);
	}
	/**
	* Sets the size of this object.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		const x = 1 / width, y = 1 / height;
		this.uniforms.texelSize.value.set(x, y, x * .5, y * .5);
	}
};
var KawaseBlurPass = class extends Pass {
	/**
	* Constructs a new Kawase blur pass.
	*
	* @param {Object} [options] - The options.
	* @param {KernelSize} [options.kernelSize=KernelSize.MEDIUM] - The blur kernel size.
	* @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	* @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	* @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	* @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	* @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	*/
	constructor({ kernelSize = KernelSize.MEDIUM, resolutionScale = .5, width = Resolution.AUTO_SIZE, height = Resolution.AUTO_SIZE, resolutionX = width, resolutionY = height } = {}) {
		super("KawaseBlurPass");
		this.renderTargetA = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTargetA.texture.name = "Blur.Target.A";
		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "Blur.Target.B";
		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
		this._blurMaterial = new KawaseBlurMaterial();
		this._blurMaterial.kernelSize = kernelSize;
		this.copyMaterial = new CopyMaterial();
	}
	/**
	* Returns the resolution settings.
	*
	* @deprecated Use resolution instead.
	* @return {Resolution} The resolution.
	*/
	getResolution() {
		return this.resolution;
	}
	/**
	* The blur material.
	*
	* @type {KawaseBlurMaterial}
	*/
	get blurMaterial() {
		return this._blurMaterial;
	}
	/**
	* The blur material.
	*
	* @type {KawaseBlurMaterial}
	* @protected
	*/
	set blurMaterial(value) {
		this._blurMaterial = value;
	}
	/**
	* Indicates whether dithering is enabled.
	*
	* @type {Boolean}
	* @deprecated Use copyMaterial.dithering instead.
	*/
	get dithering() {
		return this.copyMaterial.dithering;
	}
	set dithering(value) {
		this.copyMaterial.dithering = value;
	}
	/**
	* The kernel size.
	*
	* @type {KernelSize}
	* @deprecated Use blurMaterial.kernelSize instead.
	*/
	get kernelSize() {
		return this.blurMaterial.kernelSize;
	}
	set kernelSize(value) {
		this.blurMaterial.kernelSize = value;
	}
	/**
	* The current width of the internal render targets.
	*
	* @type {Number}
	* @deprecated Use resolution.width instead.
	*/
	get width() {
		return this.resolution.width;
	}
	/**
	* Sets the render width.
	*
	* @type {Number}
	* @deprecated Use resolution.preferredWidth instead.
	*/
	set width(value) {
		this.resolution.preferredWidth = value;
	}
	/**
	* The current height of the internal render targets.
	*
	* @type {Number}
	* @deprecated Use resolution.height instead.
	*/
	get height() {
		return this.resolution.height;
	}
	/**
	* Sets the render height.
	*
	* @type {Number}
	* @deprecated Use resolution.preferredHeight instead.
	*/
	set height(value) {
		this.resolution.preferredHeight = value;
	}
	/**
	* The current blur scale.
	*
	* @type {Number}
	* @deprecated Use blurMaterial.scale instead.
	*/
	get scale() {
		return this.blurMaterial.scale;
	}
	set scale(value) {
		this.blurMaterial.scale = value;
	}
	/**
	* Returns the current blur scale.
	*
	* @deprecated Use blurMaterial.scale instead.
	* @return {Number} The scale.
	*/
	getScale() {
		return this.blurMaterial.scale;
	}
	/**
	* Sets the blur scale.
	*
	* @deprecated Use blurMaterial.scale instead.
	* @param {Number} value - The scale.
	*/
	setScale(value) {
		this.blurMaterial.scale = value;
	}
	/**
	* Returns the kernel size.
	*
	* @deprecated Use blurMaterial.kernelSize instead.
	* @return {KernelSize} The kernel size.
	*/
	getKernelSize() {
		return this.kernelSize;
	}
	/**
	* Sets the kernel size.
	*
	* Larger kernels require more processing power but scale well with larger render resolutions.
	*
	* @deprecated Use blurMaterial.kernelSize instead.
	* @param {KernelSize} value - The kernel size.
	*/
	setKernelSize(value) {
		this.kernelSize = value;
	}
	/**
	* Returns the current resolution scale.
	*
	* @return {Number} The resolution scale.
	* @deprecated Use resolution instead.
	*/
	getResolutionScale() {
		return this.resolution.scale;
	}
	/**
	* Sets the resolution scale.
	*
	* @param {Number} scale - The new resolution scale.
	* @deprecated Use resolution instead.
	*/
	setResolutionScale(scale) {
		this.resolution.scale = scale;
	}
	/**
	* Renders the blur.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const scene = this.scene;
		const camera = this.camera;
		const renderTargetA = this.renderTargetA;
		const renderTargetB = this.renderTargetB;
		const material = this.blurMaterial;
		const kernelSequence = material.kernelSequence;
		let previousBuffer = inputBuffer;
		this.fullscreenMaterial = material;
		for (let i = 0, l = kernelSequence.length; i < l; ++i) {
			const buffer = (i & 1) === 0 ? renderTargetA : renderTargetB;
			material.kernel = kernelSequence[i];
			material.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(buffer);
			renderer.render(scene, camera);
			previousBuffer = buffer;
		}
		this.fullscreenMaterial = this.copyMaterial;
		this.copyMaterial.inputBuffer = previousBuffer.texture;
		renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
		renderer.render(scene, camera);
	}
	/**
	* Updates the size of this pass.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		const w = resolution.width, h = resolution.height;
		this.renderTargetA.setSize(w, h);
		this.renderTargetB.setSize(w, h);
		this.blurMaterial.setSize(width, height);
	}
	/**
	* Performs initialization tasks.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	*/
	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== void 0) {
			this.renderTargetA.texture.type = frameBufferType;
			this.renderTargetB.texture.type = frameBufferType;
			if (frameBufferType !== 1009) {
				this.blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
				this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			} else if (renderer !== null && renderer.outputColorSpace === "srgb") {
				this.renderTargetA.texture.colorSpace = SRGBColorSpace;
				this.renderTargetB.texture.colorSpace = SRGBColorSpace;
			}
		}
	}
	/**
	* An auto sizing flag.
	*
	* @type {Number}
	* @deprecated Use {@link Resolution.AUTO_SIZE} instead.
	*/
	static get AUTO_SIZE() {
		return Resolution.AUTO_SIZE;
	}
};
var luminance_default = `#include <common>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#ifdef RANGE
uniform vec2 range;
#elif defined(THRESHOLD)
uniform float threshold;uniform float smoothing;
#endif
varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=luminance(texel.rgb);float mask=1.0;
#ifdef RANGE
float low=step(range.x,l);float high=step(l,range.y);mask=low*high;
#elif defined(THRESHOLD)
mask=smoothstep(threshold,threshold+smoothing,l);
#endif
#ifdef COLOR
gl_FragColor=texel*mask;
#else
gl_FragColor=vec4(l*mask);
#endif
}`;
var LuminanceMaterial = class extends ShaderMaterial {
	/**
	* Constructs a new luminance material.
	*
	* @param {Boolean} [colorOutput=false] - Defines whether the shader should output colors scaled with their luminance value.
	* @param {Vector2} [luminanceRange] - If provided, the shader will mask out texels that aren't in the specified luminance range.
	*/
	constructor(colorOutput = false, luminanceRange = null) {
		super({
			name: "LuminanceMaterial",
			defines: { THREE_REVISION: "186".replace(/\D+/g, "") },
			uniforms: {
				inputBuffer: new Uniform(null),
				threshold: new Uniform(0),
				smoothing: new Uniform(1),
				range: new Uniform(null)
			},
			blending: 0,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader: luminance_default,
			vertexShader: common_default
		});
		this.colorOutput = colorOutput;
		this.luminanceRange = luminanceRange;
	}
	/**
	* The input buffer.
	*
	* @type {Texture}
	*/
	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* Sets the input buffer.
	*
	* @deprecated Use inputBuffer instead.
	* @param {Texture} value - The input buffer.
	*/
	setInputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* The luminance threshold.
	*
	* @type {Number}
	*/
	get threshold() {
		return this.uniforms.threshold.value;
	}
	set threshold(value) {
		if (this.smoothing > 0 || value > 0) this.defines.THRESHOLD = "1";
		else delete this.defines.THRESHOLD;
		this.uniforms.threshold.value = value;
	}
	/**
	* Returns the luminance threshold.
	*
	* @deprecated Use threshold instead.
	* @return {Number} The threshold.
	*/
	getThreshold() {
		return this.threshold;
	}
	/**
	* Sets the luminance threshold.
	*
	* @deprecated Use threshold instead.
	* @param {Number} value - The threshold.
	*/
	setThreshold(value) {
		this.threshold = value;
	}
	/**
	* The luminance threshold smoothing.
	*
	* @type {Number}
	*/
	get smoothing() {
		return this.uniforms.smoothing.value;
	}
	set smoothing(value) {
		if (this.threshold > 0 || value > 0) this.defines.THRESHOLD = "1";
		else delete this.defines.THRESHOLD;
		this.uniforms.smoothing.value = value;
	}
	/**
	* Returns the luminance threshold smoothing factor.
	*
	* @deprecated Use smoothing instead.
	* @return {Number} The smoothing factor.
	*/
	getSmoothingFactor() {
		return this.smoothing;
	}
	/**
	* Sets the luminance threshold smoothing factor.
	*
	* @deprecated Use smoothing instead.
	* @param {Number} value - The smoothing factor.
	*/
	setSmoothingFactor(value) {
		this.smoothing = value;
	}
	/**
	* Indicates whether the luminance threshold is enabled.
	*
	* @type {Boolean}
	* @deprecated Adjust the threshold or smoothing factor instead.
	*/
	get useThreshold() {
		return this.threshold > 0 || this.smoothing > 0;
	}
	set useThreshold(value) {}
	/**
	* Indicates whether color output is enabled.
	*
	* @type {Boolean}
	*/
	get colorOutput() {
		return this.defines.COLOR !== void 0;
	}
	set colorOutput(value) {
		if (value) this.defines.COLOR = "1";
		else delete this.defines.COLOR;
		this.needsUpdate = true;
	}
	/**
	* Indicates whether color output is enabled.
	*
	* @deprecated Use colorOutput instead.
	* @return {Boolean} Whether color output is enabled.
	*/
	isColorOutputEnabled(value) {
		return this.colorOutput;
	}
	/**
	* Enables or disables color output.
	*
	* @deprecated Use colorOutput instead.
	* @param {Boolean} value - Whether color output should be enabled.
	*/
	setColorOutputEnabled(value) {
		this.colorOutput = value;
	}
	/**
	* Indicates whether luminance masking is enabled.
	*
	* @type {Boolean}
	* @deprecated
	*/
	get useRange() {
		return this.luminanceRange !== null;
	}
	set useRange(value) {
		this.luminanceRange = null;
	}
	/**
	* The luminance range. Set to null to disable.
	*
	* @type {Boolean}
	*/
	get luminanceRange() {
		return this.uniforms.range.value;
	}
	set luminanceRange(value) {
		if (value !== null) this.defines.RANGE = "1";
		else delete this.defines.RANGE;
		this.uniforms.range.value = value;
		this.needsUpdate = true;
	}
	/**
	* Returns the current luminance range.
	*
	* @deprecated Use luminanceRange instead.
	* @return {Vector2} The luminance range.
	*/
	getLuminanceRange() {
		return this.luminanceRange;
	}
	/**
	* Sets a luminance range. Set to null to disable.
	*
	* @deprecated Use luminanceRange instead.
	* @param {Vector2} value - The luminance range.
	*/
	setLuminanceRange(value) {
		this.luminanceRange = value;
	}
};
var LuminancePass = class extends Pass {
	/**
	* Constructs a new luminance pass.
	*
	* @param {Object} [options] - The options. See {@link LuminanceMaterial} for additional options.
	* @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
	* @param {Number} [options.resolutionScale=1.0] - The resolution scale.
	* @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	* @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	* @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	* @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	*/
	constructor({ renderTarget, luminanceRange, colorOutput, resolutionScale = 1, width = Resolution.AUTO_SIZE, height = Resolution.AUTO_SIZE, resolutionX = width, resolutionY = height } = {}) {
		super("LuminancePass");
		this.fullscreenMaterial = new LuminanceMaterial(colorOutput, luminanceRange);
		this.needsSwap = false;
		this.renderTarget = renderTarget;
		if (this.renderTarget === void 0) {
			this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
			this.renderTarget.texture.name = "LuminancePass.Target";
		}
		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
	}
	/**
	* The luminance texture.
	*
	* @type {Texture}
	*/
	get texture() {
		return this.renderTarget.texture;
	}
	/**
	* Returns the luminance texture.
	*
	* @deprecated Use texture instead.
	* @return {Texture} The texture.
	*/
	getTexture() {
		return this.renderTarget.texture;
	}
	/**
	* Returns the resolution settings.
	*
	* @deprecated Use resolution instead.
	* @return {Resolution} The resolution.
	*/
	getResolution() {
		return this.resolution;
	}
	/**
	* Renders the luminance.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const material = this.fullscreenMaterial;
		material.inputBuffer = inputBuffer.texture;
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);
	}
	/**
	* Updates the size of this pass.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.width, resolution.height);
	}
	/**
	* Performs initialization tasks.
	*
	* @param {WebGLRenderer} renderer - A renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	*/
	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== void 0 && frameBufferType !== 1009) {
			this.renderTarget.texture.type = frameBufferType;
			this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
		}
	}
};
var convolution_downsampling_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#define WEIGHT_INNER 0.125
#define WEIGHT_OUTER 0.05556
varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;float clampToBorder(const in vec2 uv){return float(uv.s>=0.0&&uv.s<=1.0&&uv.t>=0.0&&uv.t<=1.0);}void main(){vec4 c=vec4(0.0);vec4 w=WEIGHT_INNER*vec4(clampToBorder(vUv00),clampToBorder(vUv01),clampToBorder(vUv02),clampToBorder(vUv03));c+=w.x*texture2D(inputBuffer,vUv00);c+=w.y*texture2D(inputBuffer,vUv01);c+=w.z*texture2D(inputBuffer,vUv02);c+=w.w*texture2D(inputBuffer,vUv03);w=WEIGHT_OUTER*vec4(clampToBorder(vUv04),clampToBorder(vUv05),clampToBorder(vUv06),clampToBorder(vUv07));c+=w.x*texture2D(inputBuffer,vUv04);c+=w.y*texture2D(inputBuffer,vUv05);c+=w.z*texture2D(inputBuffer,vUv06);c+=w.w*texture2D(inputBuffer,vUv07);w=WEIGHT_OUTER*vec4(clampToBorder(vUv08),clampToBorder(vUv09),clampToBorder(vUv10),clampToBorder(vUv11));c+=w.x*texture2D(inputBuffer,vUv08);c+=w.y*texture2D(inputBuffer,vUv09);c+=w.z*texture2D(inputBuffer,vUv10);c+=w.w*texture2D(inputBuffer,vUv11);c+=WEIGHT_OUTER*texture2D(inputBuffer,vUv);gl_FragColor=c;
#include <colorspace_fragment>
}`;
var convolution_downsampling_default2 = `uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;void main(){vUv=position.xy*0.5+0.5;vUv00=vUv+texelSize*vec2(-1.0,1.0);vUv01=vUv+texelSize*vec2(1.0,1.0);vUv02=vUv+texelSize*vec2(-1.0,-1.0);vUv03=vUv+texelSize*vec2(1.0,-1.0);vUv04=vUv+texelSize*vec2(-2.0,2.0);vUv05=vUv+texelSize*vec2(0.0,2.0);vUv06=vUv+texelSize*vec2(2.0,2.0);vUv07=vUv+texelSize*vec2(-2.0,0.0);vUv08=vUv+texelSize*vec2(2.0,0.0);vUv09=vUv+texelSize*vec2(-2.0,-2.0);vUv10=vUv+texelSize*vec2(0.0,-2.0);vUv11=vUv+texelSize*vec2(2.0,-2.0);gl_Position=vec4(position.xy,1.0,1.0);}`;
var DownsamplingMaterial = class extends ShaderMaterial {
	/**
	* Constructs a new downsampling material.
	*/
	constructor() {
		super({
			name: "DownsamplingMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2())
			},
			blending: 0,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader: convolution_downsampling_default,
			vertexShader: convolution_downsampling_default2
		});
	}
	/**
	* The input buffer.
	*
	* @type {Texture}
	*/
	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* Sets the size of this object.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		this.uniforms.texelSize.value.set(1 / width, 1 / height);
	}
};
var convolution_upsampling_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;uniform mediump sampler2D supportBuffer;
#else
uniform lowp sampler2D inputBuffer;uniform lowp sampler2D supportBuffer;
#endif
uniform float radius;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vec4 c=vec4(0.0);c+=texture2D(inputBuffer,vUv0)*0.0625;c+=texture2D(inputBuffer,vUv1)*0.125;c+=texture2D(inputBuffer,vUv2)*0.0625;c+=texture2D(inputBuffer,vUv3)*0.125;c+=texture2D(inputBuffer,vUv)*0.25;c+=texture2D(inputBuffer,vUv4)*0.125;c+=texture2D(inputBuffer,vUv5)*0.0625;c+=texture2D(inputBuffer,vUv6)*0.125;c+=texture2D(inputBuffer,vUv7)*0.0625;vec4 baseColor=texture2D(supportBuffer,vUv);gl_FragColor=mix(baseColor,c,radius);
#include <colorspace_fragment>
}`;
var convolution_upsampling_default2 = `uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vUv=position.xy*0.5+0.5;vUv0=vUv+texelSize*vec2(-1.0,1.0);vUv1=vUv+texelSize*vec2(0.0,1.0);vUv2=vUv+texelSize*vec2(1.0,1.0);vUv3=vUv+texelSize*vec2(-1.0,0.0);vUv4=vUv+texelSize*vec2(1.0,0.0);vUv5=vUv+texelSize*vec2(-1.0,-1.0);vUv6=vUv+texelSize*vec2(0.0,-1.0);vUv7=vUv+texelSize*vec2(1.0,-1.0);gl_Position=vec4(position.xy,1.0,1.0);}`;
var UpsamplingMaterial = class extends ShaderMaterial {
	/**
	* Constructs a new upsampling material.
	*/
	constructor() {
		super({
			name: "UpsamplingMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				supportBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				radius: new Uniform(.85)
			},
			blending: 0,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader: convolution_upsampling_default,
			vertexShader: convolution_upsampling_default2
		});
	}
	/**
	* The input buffer.
	*
	* @type {Texture}
	*/
	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* A support buffer.
	*
	* @type {Texture}
	*/
	set supportBuffer(value) {
		this.uniforms.supportBuffer.value = value;
	}
	/**
	* The blur radius.
	*
	* @type {Number}
	*/
	get radius() {
		return this.uniforms.radius.value;
	}
	set radius(value) {
		this.uniforms.radius.value = value;
	}
	/**
	* Sets the size of this object.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		this.uniforms.texelSize.value.set(1 / width, 1 / height);
	}
};
var MipmapBlurPass = class extends Pass {
	/**
	* Constructs a new mipmap blur pass.
	*
	* @param {Object} [options] - The options.
	*/
	constructor() {
		super("MipmapBlurPass");
		this.needsSwap = false;
		this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget.texture.name = "Upsampling.Mipmap0";
		this.downsamplingMipmaps = [];
		this.upsamplingMipmaps = [];
		this.downsamplingMaterial = new DownsamplingMaterial();
		this.upsamplingMaterial = new UpsamplingMaterial();
		this.resolution = new Vector2();
	}
	/**
	* A texture that contains the blurred result.
	*
	* @type {Texture}
	*/
	get texture() {
		return this.renderTarget.texture;
	}
	/**
	* The MIP levels. Default is 8.
	*
	* @type {Number}
	*/
	get levels() {
		return this.downsamplingMipmaps.length;
	}
	set levels(value) {
		if (this.levels !== value) {
			const renderTarget = this.renderTarget;
			this.dispose();
			this.downsamplingMipmaps = [];
			this.upsamplingMipmaps = [];
			for (let i = 0; i < value; ++i) {
				const mipmap = renderTarget.clone();
				mipmap.texture.name = "Downsampling.Mipmap" + i;
				this.downsamplingMipmaps.push(mipmap);
			}
			this.upsamplingMipmaps.push(renderTarget);
			for (let i = 1, l = value - 1; i < l; ++i) {
				const mipmap = renderTarget.clone();
				mipmap.texture.name = "Upsampling.Mipmap" + i;
				this.upsamplingMipmaps.push(mipmap);
			}
			this.setSize(this.resolution.x, this.resolution.y);
		}
	}
	/**
	* The blur radius.
	*
	* @type {Number}
	*/
	get radius() {
		return this.upsamplingMaterial.radius;
	}
	set radius(value) {
		this.upsamplingMaterial.radius = value;
	}
	/**
	* Renders the blur.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const { scene, camera } = this;
		const { downsamplingMaterial, upsamplingMaterial } = this;
		const { downsamplingMipmaps, upsamplingMipmaps } = this;
		let previousBuffer = inputBuffer;
		this.fullscreenMaterial = downsamplingMaterial;
		for (let i = 0, l = downsamplingMipmaps.length; i < l; ++i) {
			const mipmap = downsamplingMipmaps[i];
			downsamplingMaterial.setSize(previousBuffer.width, previousBuffer.height);
			downsamplingMaterial.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(mipmap);
			renderer.render(scene, camera);
			previousBuffer = mipmap;
		}
		this.fullscreenMaterial = upsamplingMaterial;
		for (let i = upsamplingMipmaps.length - 1; i >= 0; --i) {
			const mipmap = upsamplingMipmaps[i];
			upsamplingMaterial.setSize(previousBuffer.width, previousBuffer.height);
			upsamplingMaterial.inputBuffer = previousBuffer.texture;
			upsamplingMaterial.supportBuffer = downsamplingMipmaps[i].texture;
			renderer.setRenderTarget(mipmap);
			renderer.render(scene, camera);
			previousBuffer = mipmap;
		}
	}
	/**
	* Updates the size of this pass.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		const resolution = this.resolution;
		resolution.set(width, height);
		let w = resolution.width, h = resolution.height;
		for (let i = 0, l = this.downsamplingMipmaps.length; i < l; ++i) {
			w = Math.round(w * .5);
			h = Math.round(h * .5);
			this.downsamplingMipmaps[i].setSize(w, h);
			if (i < this.upsamplingMipmaps.length) this.upsamplingMipmaps[i].setSize(w, h);
		}
	}
	/**
	* Performs initialization tasks.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	*/
	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== void 0) {
			const mipmaps = this.downsamplingMipmaps.concat(this.upsamplingMipmaps);
			for (const mipmap of mipmaps) mipmap.texture.type = frameBufferType;
			if (frameBufferType !== 1009) {
				this.downsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
				this.upsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			} else if (renderer !== null && renderer.outputColorSpace === "srgb") for (const mipmap of mipmaps) mipmap.texture.colorSpace = SRGBColorSpace;
		}
	}
	/**
	* Deletes internal render targets and textures.
	*/
	dispose() {
		super.dispose();
		for (const mipmap of this.downsamplingMipmaps.concat(this.upsamplingMipmaps)) mipmap.dispose();
	}
};
var bloom_default = `#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif
uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=texture2D(map,uv)*intensity;}`;
var BloomEffect = class extends Effect {
	/**
	* Constructs a new bloom effect.
	*
	* @param {Object} [options] - The options.
	* @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	* @param {Number} [options.luminanceThreshold=1.0] - The luminance threshold. Raise this value to mask out darker elements in the scene.
	* @param {Number} [options.luminanceSmoothing=0.03] - Controls the smoothness of the luminance threshold.
	* @param {Boolean} [options.mipmapBlur=true] - Enables or disables mipmap blur.
	* @param {Number} [options.intensity=1.0] - The bloom intensity.
	* @param {Number} [options.radius=0.85] - The blur radius. Only applies to mipmap blur.
	* @param {Number} [options.levels=8] - The amount of MIP levels. Only applies to mipmap blur.
	* @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - Deprecated. Use mipmapBlur instead.
	* @param {Number} [options.resolutionScale=0.5] - Deprecated. Use mipmapBlur instead.
	* @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
	* @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
	* @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
	* @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
	*/
	constructor({ blendFunction = BlendFunction.SCREEN, luminanceThreshold = 1, luminanceSmoothing = .03, mipmapBlur = true, intensity = 1, radius = .85, levels = 8, kernelSize = KernelSize.LARGE, resolutionScale = .5, width = Resolution.AUTO_SIZE, height = Resolution.AUTO_SIZE, resolutionX = width, resolutionY = height } = {}) {
		super("BloomEffect", bloom_default, {
			blendFunction,
			uniforms: /* @__PURE__ */ new Map([["map", new Uniform(null)], ["intensity", new Uniform(intensity)]])
		});
		this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget.texture.name = "Bloom.Target";
		this.blurPass = new KawaseBlurPass({ kernelSize });
		this.luminancePass = new LuminancePass({ colorOutput: true });
		this.luminanceMaterial.threshold = luminanceThreshold;
		this.luminanceMaterial.smoothing = luminanceSmoothing;
		this.mipmapBlurPass = new MipmapBlurPass();
		this.mipmapBlurPass.enabled = mipmapBlur;
		this.mipmapBlurPass.radius = radius;
		this.mipmapBlurPass.levels = levels;
		this.uniforms.get("map").value = mipmapBlur ? this.mipmapBlurPass.texture : this.renderTarget.texture;
		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
	}
	/**
	* A texture that contains the intermediate result of this effect.
	*
	* @type {Texture}
	*/
	get texture() {
		return this.mipmapBlurPass.enabled ? this.mipmapBlurPass.texture : this.renderTarget.texture;
	}
	/**
	* Returns the generated bloom texture.
	*
	* @deprecated Use texture instead.
	* @return {Texture} The texture.
	*/
	getTexture() {
		return this.texture;
	}
	/**
	* Returns the resolution settings.
	*
	* @deprecated Use resolution instead.
	* @return {Resolution} The resolution.
	*/
	getResolution() {
		return this.resolution;
	}
	/**
	* Returns the blur pass.
	*
	* @deprecated
	* @return {KawaseBlurPass} The blur pass.
	*/
	getBlurPass() {
		return this.blurPass;
	}
	/**
	* Returns the luminance pass.
	*
	* @deprecated Use luminancePass instead.
	* @return {LuminancePass} The luminance pass.
	*/
	getLuminancePass() {
		return this.luminancePass;
	}
	/**
	* The luminance material.
	*
	* @type {LuminanceMaterial}
	*/
	get luminanceMaterial() {
		return this.luminancePass.fullscreenMaterial;
	}
	/**
	* Returns the luminance material.
	*
	* @deprecated Use luminanceMaterial instead.
	* @return {LuminanceMaterial} The material.
	*/
	getLuminanceMaterial() {
		return this.luminancePass.fullscreenMaterial;
	}
	/**
	* The current width of the internal render targets.
	*
	* @type {Number}
	* @deprecated
	*/
	get width() {
		return this.resolution.width;
	}
	set width(value) {
		this.resolution.preferredWidth = value;
	}
	/**
	* The current height of the internal render targets.
	*
	* @type {Number}
	* @deprecated
	*/
	get height() {
		return this.resolution.height;
	}
	set height(value) {
		this.resolution.preferredHeight = value;
	}
	/**
	* Indicates whether dithering is enabled.
	*
	* @type {Boolean}
	* @deprecated Use EffectPass.dithering instead.
	*/
	get dithering() {
		return this.blurPass.dithering;
	}
	set dithering(value) {
		this.blurPass.dithering = value;
	}
	/**
	* The blur kernel size.
	*
	* @type {KernelSize}
	* @deprecated
	*/
	get kernelSize() {
		return this.blurPass.kernelSize;
	}
	set kernelSize(value) {
		this.blurPass.kernelSize = value;
	}
	/**
	* @type {Number}
	* @deprecated
	*/
	get distinction() {
		console.warn(this.name, "distinction was removed");
		return 1;
	}
	set distinction(value) {
		console.warn(this.name, "distinction was removed");
	}
	/**
	* The bloom intensity.
	*
	* @type {Number}
	*/
	get intensity() {
		return this.uniforms.get("intensity").value;
	}
	set intensity(value) {
		this.uniforms.get("intensity").value = value;
	}
	/**
	* The bloom intensity.
	*
	* @deprecated Use intensity instead.
	* @return {Number} The intensity.
	*/
	getIntensity() {
		return this.intensity;
	}
	/**
	* Sets the bloom intensity.
	*
	* @deprecated Use intensity instead.
	* @param {Number} value - The intensity.
	*/
	setIntensity(value) {
		this.intensity = value;
	}
	/**
	* Returns the current resolution scale.
	*
	* @return {Number} The resolution scale.
	* @deprecated
	*/
	getResolutionScale() {
		return this.resolution.scale;
	}
	/**
	* Sets the resolution scale.
	*
	* @param {Number} scale - The new resolution scale.
	* @deprecated
	*/
	setResolutionScale(scale) {
		this.resolution.scale = scale;
	}
	/**
	* Updates this effect.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	*/
	update(renderer, inputBuffer, deltaTime) {
		const renderTarget = this.renderTarget;
		const luminancePass = this.luminancePass;
		if (luminancePass.enabled) {
			luminancePass.render(renderer, inputBuffer);
			if (this.mipmapBlurPass.enabled) this.mipmapBlurPass.render(renderer, luminancePass.renderTarget);
			else this.blurPass.render(renderer, luminancePass.renderTarget, renderTarget);
		} else if (this.mipmapBlurPass.enabled) this.mipmapBlurPass.render(renderer, inputBuffer);
		else this.blurPass.render(renderer, inputBuffer, renderTarget);
	}
	/**
	* Updates the size of internal render targets.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.width, resolution.height);
		this.blurPass.resolution.copy(resolution);
		this.luminancePass.setSize(width, height);
		this.mipmapBlurPass.setSize(width, height);
	}
	/**
	* Performs initialization tasks.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	*/
	initialize(renderer, alpha, frameBufferType) {
		this.blurPass.initialize(renderer, alpha, frameBufferType);
		this.luminancePass.initialize(renderer, alpha, frameBufferType);
		this.mipmapBlurPass.initialize(renderer, alpha, frameBufferType);
		if (frameBufferType !== void 0) {
			this.renderTarget.texture.type = frameBufferType;
			if (renderer !== null && renderer.outputColorSpace === "srgb") this.renderTarget.texture.colorSpace = SRGBColorSpace;
		}
	}
};
var RenderPass = class extends Pass {
	/**
	* Constructs a new render pass.
	*
	* @param {Scene} scene - The scene to render.
	* @param {Camera} camera - The camera to use to render the scene.
	* @param {Material} [overrideMaterial=null] - An override material.
	*/
	constructor(scene, camera, overrideMaterial = null) {
		super("RenderPass", scene, camera);
		this.needsSwap = false;
		this.needsDepthBlit = true;
		this.clearPass = new ClearPass();
		this.overrideMaterialManager = overrideMaterial === null ? null : new OverrideMaterialManager(overrideMaterial);
		this.ignoreBackground = false;
		this.skipShadowMapUpdate = false;
		this.selection = null;
	}
	set mainScene(value) {
		this.scene = value;
	}
	set mainCamera(value) {
		this.camera = value;
	}
	get renderToScreen() {
		return super.renderToScreen;
	}
	set renderToScreen(value) {
		super.renderToScreen = value;
		this.clearPass.renderToScreen = value;
	}
	/**
	* The current override material.
	*
	* @type {Material}
	*/
	get overrideMaterial() {
		const manager = this.overrideMaterialManager;
		return manager !== null ? manager.material : null;
	}
	set overrideMaterial(value) {
		const manager = this.overrideMaterialManager;
		if (value !== null) {
			if (manager !== null) manager.setMaterial(value);
			else this.overrideMaterialManager = new OverrideMaterialManager(value);
		} else if (manager !== null) {
			manager.dispose();
			this.overrideMaterialManager = null;
		}
	}
	/**
	* Returns the current override material.
	*
	* @deprecated Use overrideMaterial instead.
	* @return {Material} The material.
	*/
	getOverrideMaterial() {
		return this.overrideMaterial;
	}
	/**
	* Sets the override material.
	*
	* @deprecated Use overrideMaterial instead.
	* @return {Material} value - The material.
	*/
	setOverrideMaterial(value) {
		this.overrideMaterial = value;
	}
	/**
	* Indicates whether the target buffer should be cleared before rendering.
	*
	* @type {Boolean}
	* @deprecated Use clearPass.enabled instead.
	*/
	get clear() {
		return this.clearPass.enabled;
	}
	set clear(value) {
		this.clearPass.enabled = value;
	}
	/**
	* Returns the selection. Default is `null` (no restriction).
	*
	* @deprecated Use selection instead.
	* @return {Selection} The selection.
	*/
	getSelection() {
		return this.selection;
	}
	/**
	* Sets the selection. Set to `null` to disable.
	*
	* @deprecated Use selection instead.
	* @param {Selection} value - The selection.
	*/
	setSelection(value) {
		this.selection = value;
	}
	/**
	* Indicates whether the scene background is disabled.
	*
	* @deprecated Use ignoreBackground instead.
	* @return {Boolean} Whether the scene background is disabled.
	*/
	isBackgroundDisabled() {
		return this.ignoreBackground;
	}
	/**
	* Enables or disables the scene background.
	*
	* @deprecated Use ignoreBackground instead.
	* @param {Boolean} value - Whether the scene background should be disabled.
	*/
	setBackgroundDisabled(value) {
		this.ignoreBackground = value;
	}
	/**
	* Indicates whether the shadow map auto update is disabled.
	*
	* @deprecated Use skipShadowMapUpdate instead.
	* @return {Boolean} Whether the shadow map update is disabled.
	*/
	isShadowMapDisabled() {
		return this.skipShadowMapUpdate;
	}
	/**
	* Enables or disables the shadow map auto update.
	*
	* @deprecated Use skipShadowMapUpdate instead.
	* @param {Boolean} value - Whether the shadow map auto update should be disabled.
	*/
	setShadowMapDisabled(value) {
		this.skipShadowMapUpdate = value;
	}
	/**
	* Returns the clear pass.
	*
	* @deprecated Use clearPass.enabled instead.
	* @return {ClearPass} The clear pass.
	*/
	getClearPass() {
		return this.clearPass;
	}
	/**
	* Renders the scene.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const scene = this.scene;
		const camera = this.camera;
		const selection = this.selection;
		const mask = camera.layers.mask;
		const background = scene.background;
		const shadowMapAutoUpdate = renderer.shadowMap.autoUpdate;
		const renderTarget = this.renderToScreen ? null : inputBuffer;
		if (selection !== null) camera.layers.set(selection.getLayer());
		if (this.skipShadowMapUpdate) renderer.shadowMap.autoUpdate = false;
		if (this.ignoreBackground || this.clearPass.overrideClearColor !== null) scene.background = null;
		if (this.clearPass.enabled) this.clearPass.render(renderer, inputBuffer);
		renderer.setRenderTarget(renderTarget);
		if (this.overrideMaterialManager !== null) this.overrideMaterialManager.render(renderer, scene, camera);
		else renderer.render(scene, camera);
		camera.layers.mask = mask;
		scene.background = background;
		renderer.shadowMap.autoUpdate = shadowMapAutoUpdate;
	}
};
var depth_downsampling_default = `#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
#ifdef DOWNSAMPLE_NORMALS
uniform lowp sampler2D normalBuffer;
#endif
varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}int findBestDepth(const in float samples[4]){float c=(samples[0]+samples[1]+samples[2]+samples[3])*0.25;float distances[4];distances[0]=abs(c-samples[0]);distances[1]=abs(c-samples[1]);distances[2]=abs(c-samples[2]);distances[3]=abs(c-samples[3]);float maxDistance=max(max(distances[0],distances[1]),max(distances[2],distances[3]));int remaining[3];int rejected[3];int i,j,k;for(i=0,j=0,k=0;i<4;++i){if(distances[i]<maxDistance){remaining[j++]=i;}else{rejected[k++]=i;}}for(;j<3;++j){remaining[j]=rejected[--k];}vec3 s=vec3(samples[remaining[0]],samples[remaining[1]],samples[remaining[2]]);c=(s.x+s.y+s.z)/3.0;distances[0]=abs(c-s.x);distances[1]=abs(c-s.y);distances[2]=abs(c-s.z);float minDistance=min(distances[0],min(distances[1],distances[2]));for(i=0;i<3;++i){if(distances[i]==minDistance){break;}}return remaining[i];}void main(){float d[4];d[0]=readDepth(vUv0);d[1]=readDepth(vUv1);d[2]=readDepth(vUv2);d[3]=readDepth(vUv3);int index=findBestDepth(d);
#ifdef DOWNSAMPLE_NORMALS
vec3 n[4];n[0]=texture2D(normalBuffer,vUv0).rgb;n[1]=texture2D(normalBuffer,vUv1).rgb;n[2]=texture2D(normalBuffer,vUv2).rgb;n[3]=texture2D(normalBuffer,vUv3).rgb;
#else
vec3 n[4];n[0]=vec3(0.0);n[1]=vec3(0.0);n[2]=vec3(0.0);n[3]=vec3(0.0);
#endif
gl_FragColor=vec4(n[index],d[index]);}`;
var depth_downsampling_default2 = `uniform vec2 texelSize;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vUv0=uv;vUv1=vec2(uv.x,uv.y+texelSize.y);vUv2=vec2(uv.x+texelSize.x,uv.y);vUv3=uv+texelSize;gl_Position=vec4(position.xy,1.0,1.0);}`;
var DepthDownsamplingMaterial = class extends ShaderMaterial {
	/**
	* Constructs a new depth downsampling material.
	*/
	constructor() {
		super({
			name: "DepthDownsamplingMaterial",
			defines: { DEPTH_PACKING: "0" },
			uniforms: {
				depthBuffer: new Uniform(null),
				normalBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2())
			},
			blending: 0,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader: depth_downsampling_default,
			vertexShader: depth_downsampling_default2
		});
	}
	/**
	* The depth buffer.
	*
	* @type {Texture}
	*/
	set depthBuffer(value) {
		this.uniforms.depthBuffer.value = value;
	}
	/**
	* The depth packing strategy.
	*
	* @type {DepthPackingStrategies}
	*/
	set depthPacking(value) {
		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}
	/**
	* Sets the depth buffer.
	*
	* @deprecated Use depthBuffer and depthPacking instead.
	* @param {Texture} buffer - The depth texture.
	* @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	*/
	setDepthBuffer(buffer, depthPacking = BasicDepthPacking) {
		this.depthBuffer = buffer;
		this.depthPacking = depthPacking;
	}
	/**
	* The normal buffer.
	*
	* @type {Texture}
	*/
	set normalBuffer(value) {
		this.uniforms.normalBuffer.value = value;
		if (value !== null) this.defines.DOWNSAMPLE_NORMALS = "1";
		else delete this.defines.DOWNSAMPLE_NORMALS;
		this.needsUpdate = true;
	}
	/**
	* Sets the normal buffer.
	*
	* @deprecated Use normalBuffer instead.
	* @param {Texture} value - The normal buffer.
	*/
	setNormalBuffer(value) {
		this.normalBuffer = value;
	}
	/**
	* Sets the texel size.
	*
	* @deprecated Use setSize() instead.
	* @param {Number} x - The texel width.
	* @param {Number} y - The texel height.
	*/
	setTexelSize(x, y) {
		this.uniforms.texelSize.value.set(x, y);
	}
	/**
	* Sets the size of this object.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		this.uniforms.texelSize.value.set(1 / width, 1 / height);
	}
};
var DepthDownsamplingPass = class extends Pass {
	/**
	* Constructs a new depth downsampling pass.
	*
	* @param {Object} [options] - The options.
	* @param {Texture} [options.normalBuffer=null] - A texture that contains view space normals. See {@link NormalPass}.
	* @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	* @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	* @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	* @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	* @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	*/
	constructor({ normalBuffer = null, resolutionScale = .5, width = Resolution.AUTO_SIZE, height = Resolution.AUTO_SIZE, resolutionX = width, resolutionY = height } = {}) {
		super("DepthDownsamplingPass");
		const material = new DepthDownsamplingMaterial();
		material.normalBuffer = normalBuffer;
		this.fullscreenMaterial = material;
		this.needsDepthTexture = true;
		this.needsSwap = false;
		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false,
			type: FloatType
		});
		this.renderTarget.texture.name = "DepthDownsamplingPass.Target";
		this.renderTarget.texture.generateMipmaps = false;
		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
	}
	/**
	* The normal(RGB) + depth(A) texture.
	*
	* @type {Texture}
	*/
	get texture() {
		return this.renderTarget.texture;
	}
	/**
	* Returns the normal(RGB) + depth(A) texture.
	*
	* @deprecated Use texture instead.
	* @return {Texture} The texture.
	*/
	getTexture() {
		return this.renderTarget.texture;
	}
	/**
	* Returns the resolution settings.
	*
	* @deprecated Use resolution instead.
	* @return {Resolution} The resolution.
	*/
	getResolution() {
		return this.resolution;
	}
	/**
	* Sets the depth texture.
	*
	* @param {Texture} depthTexture - A depth texture.
	* @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	*/
	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
		this.fullscreenMaterial.depthBuffer = depthTexture;
		this.fullscreenMaterial.depthPacking = depthPacking;
	}
	/**
	* Downsamples depth and scene normals.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);
	}
	/**
	* Updates the size of this pass.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.width, resolution.height);
		this.fullscreenMaterial.setSize(width, height);
	}
	/**
	* Performs initialization tasks.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	*/
	initialize(renderer, alpha, frameBufferType) {
		const gl = renderer.getContext();
		if (!(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"))) throw new Error("Rendering to float texture is not supported.");
	}
};
var effect_default = `#include <common>
#include <packing>
#include <dithering_pars_fragment>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#if DEPTH_PACKING == 3201
uniform lowp sampler2D depthBuffer;
#elif defined(GL_FRAGMENT_PRECISION_HIGH)
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;vec4 sRGBToLinear(const in vec4 value){return vec4(mix(pow(value.rgb*0.9478672986+vec3(0.0521327014),vec3(2.4)),value.rgb*0.0773993808,vec3(lessThanEqual(value.rgb,vec3(0.04045)))),value.a);}float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
float depth=unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
float depth=texture2D(depthBuffer,uv).r;
#endif
#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)
float d=pow(2.0,depth*log2(cameraFar+1.0))-1.0;float a=cameraFar/(cameraFar-cameraNear);float b=cameraFar*cameraNear/(cameraNear-cameraFar);depth=a+b/d;
#elif defined(USE_REVERSED_DEPTH_BUFFER)
depth=1.0-depth;
#endif
return depth;}float getViewZ(const in float depth){
#ifdef PERSPECTIVE_CAMERA
return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);
#else
return orthographicDepthToViewZ(depth,cameraNear,cameraFar);
#endif
}vec3 RGBToHCV(const in vec3 RGB){vec4 P=mix(vec4(RGB.bg,-1.0,2.0/3.0),vec4(RGB.gb,0.0,-1.0/3.0),step(RGB.b,RGB.g));vec4 Q=mix(vec4(P.xyw,RGB.r),vec4(RGB.r,P.yzx),step(P.x,RGB.r));float C=Q.x-min(Q.w,Q.y);float H=abs((Q.w-Q.y)/(6.0*C+EPSILON)+Q.z);return vec3(H,C,Q.x);}vec3 RGBToHSL(const in vec3 RGB){vec3 HCV=RGBToHCV(RGB);float L=HCV.z-HCV.y*0.5;float S=HCV.y/(1.0-abs(L*2.0-1.0)+EPSILON);return vec3(HCV.x,S,L);}vec3 HueToRGB(const in float H){float R=abs(H*6.0-3.0)-1.0;float G=2.0-abs(H*6.0-2.0);float B=2.0-abs(H*6.0-4.0);return clamp(vec3(R,G,B),0.0,1.0);}vec3 HSLToRGB(const in vec3 HSL){vec3 RGB=HueToRGB(HSL.x);float C=(1.0-abs(2.0*HSL.z-1.0))*HSL.y;return(RGB-0.5)*C+HSL.z;}FRAGMENT_HEAD void main(){FRAGMENT_MAIN_UV vec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGE color0.a=clamp(color0.a,0.0,1.0);gl_FragColor=color0;
#ifdef ENCODE_OUTPUT
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
}`;
var effect_default2 = `uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEAD void main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORT gl_Position=vec4(position.xy,1.0,1.0);}`;
var EffectMaterial = class extends ShaderMaterial {
	/**
	* Constructs a new effect material.
	*
	* @param {Map<String, String>} [shaderParts] - Deprecated. Use setShaderData instead.
	* @param {Map<String, String>} [defines] - Deprecated. Use setShaderData instead.
	* @param {Map<String, Uniform>} [uniforms] - Deprecated. Use setShaderData instead.
	* @param {Camera} [camera] - A camera.
	* @param {Boolean} [dithering=false] - Deprecated.
	*/
	constructor(shaderParts, defines, uniforms, camera, dithering = false) {
		super({
			name: "EffectMaterial",
			defines: {
				THREE_REVISION: "186".replace(/\D+/g, ""),
				DEPTH_PACKING: "0",
				ENCODE_OUTPUT: "1"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer: new Uniform(null),
				resolution: new Uniform(new Vector2()),
				texelSize: new Uniform(new Vector2()),
				cameraNear: new Uniform(.3),
				cameraFar: new Uniform(1e3),
				aspect: new Uniform(1),
				time: new Uniform(0)
			},
			blending: 0,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			dithering
		});
		if (shaderParts) this.setShaderParts(shaderParts);
		if (defines) this.setDefines(defines);
		if (uniforms) this.setUniforms(uniforms);
		this.copyCameraSettings(camera);
	}
	/**
	* The input buffer.
	*
	* @type {Texture}
	*/
	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* Sets the input buffer.
	*
	* @deprecated Use inputBuffer instead.
	* @param {Texture} value - The input buffer.
	*/
	setInputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}
	/**
	* The depth buffer.
	*
	* @type {Texture}
	*/
	get depthBuffer() {
		return this.uniforms.depthBuffer.value;
	}
	set depthBuffer(value) {
		this.uniforms.depthBuffer.value = value;
	}
	/**
	* The depth packing strategy.
	*
	* @type {DepthPackingStrategies}
	*/
	get depthPacking() {
		return Number(this.defines.DEPTH_PACKING);
	}
	set depthPacking(value) {
		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}
	/**
	* Sets the depth buffer.
	*
	* @deprecated Use depthBuffer and depthPacking instead.
	* @param {Texture} buffer - The depth texture.
	* @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	*/
	setDepthBuffer(buffer, depthPacking = BasicDepthPacking) {
		this.depthBuffer = buffer;
		this.depthPacking = depthPacking;
	}
	/**
	* Sets the shader data.
	*
	* @param {EffectShaderData} data - The shader data.
	* @return {EffectMaterial} This material.
	*/
	setShaderData(data) {
		this.setShaderParts(data.shaderParts);
		this.setDefines(data.defines);
		this.setUniforms(data.uniforms);
		this.setExtensions(data.extensions);
	}
	/**
	* Sets the shader parts.
	*
	* @deprecated Use setShaderData instead.
	* @param {Map<String, String>} shaderParts - A collection of shader snippets. See {@link EffectShaderSection}.
	* @return {EffectMaterial} This material.
	*/
	setShaderParts(shaderParts) {
		this.fragmentShader = effect_default.replace(EffectShaderSection.FRAGMENT_HEAD, shaderParts.get(EffectShaderSection.FRAGMENT_HEAD) || "").replace(EffectShaderSection.FRAGMENT_MAIN_UV, shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_UV) || "").replace(EffectShaderSection.FRAGMENT_MAIN_IMAGE, shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_IMAGE) || "");
		this.vertexShader = effect_default2.replace(EffectShaderSection.VERTEX_HEAD, shaderParts.get(EffectShaderSection.VERTEX_HEAD) || "").replace(EffectShaderSection.VERTEX_MAIN_SUPPORT, shaderParts.get(EffectShaderSection.VERTEX_MAIN_SUPPORT) || "");
		this.needsUpdate = true;
		return this;
	}
	/**
	* Sets the shader macros.
	*
	* @deprecated Use setShaderData instead.
	* @param {Map<String, String>} defines - A collection of preprocessor macro definitions.
	* @return {EffectMaterial} This material.
	*/
	setDefines(defines) {
		for (const entry of defines.entries()) this.defines[entry[0]] = entry[1];
		this.needsUpdate = true;
		return this;
	}
	/**
	* Sets the shader uniforms.
	*
	* @deprecated Use setShaderData instead.
	* @param {Map<String, Uniform>} uniforms - A collection of uniforms.
	* @return {EffectMaterial} This material.
	*/
	setUniforms(uniforms) {
		for (const entry of uniforms.entries()) this.uniforms[entry[0]] = entry[1];
		return this;
	}
	/**
	* Sets the required shader extensions.
	*
	* @deprecated Use setShaderData instead.
	* @param {Set<WebGLExtension>} extensions - A collection of extensions.
	* @return {EffectMaterial} This material.
	*/
	setExtensions(extensions) {
		this.extensions = {};
		for (const extension of extensions) this.extensions[extension] = true;
		return this;
	}
	/**
	* Indicates whether output encoding is enabled.
	*
	* @type {Boolean}
	*/
	get encodeOutput() {
		return this.defines.ENCODE_OUTPUT !== void 0;
	}
	set encodeOutput(value) {
		if (this.encodeOutput !== value) {
			if (value) this.defines.ENCODE_OUTPUT = "1";
			else delete this.defines.ENCODE_OUTPUT;
			this.needsUpdate = true;
		}
	}
	/**
	* Indicates whether output encoding is enabled.
	*
	* @deprecated Use encodeOutput instead.
	* @return {Boolean} Whether output encoding is enabled.
	*/
	isOutputEncodingEnabled(value) {
		return this.encodeOutput;
	}
	/**
	* Enables or disables output encoding.
	*
	* @deprecated Use encodeOutput instead.
	* @param {Boolean} value - Whether output encoding should be enabled.
	*/
	setOutputEncodingEnabled(value) {
		this.encodeOutput = value;
	}
	/**
	* The time in seconds.
	*
	* @type {Number}
	*/
	get time() {
		return this.uniforms.time.value;
	}
	set time(value) {
		this.uniforms.time.value = value;
	}
	/**
	* Sets the delta time.
	*
	* @deprecated Use time instead.
	* @param {Number} value - The delta time in seconds.
	*/
	setDeltaTime(value) {
		this.uniforms.time.value += value;
	}
	/**
	* Copies the settings of the given camera.
	*
	* @deprecated Use copyCameraSettings instead.
	* @param {Camera} camera - A camera.
	*/
	adoptCameraSettings(camera) {
		this.copyCameraSettings(camera);
	}
	/**
	* Copies the settings of the given camera.
	*
	* @param {Camera} camera - A camera.
	*/
	copyCameraSettings(camera) {
		if (camera) {
			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;
			if (camera instanceof PerspectiveCamera) this.defines.PERSPECTIVE_CAMERA = "1";
			else delete this.defines.PERSPECTIVE_CAMERA;
			this.needsUpdate = true;
		}
	}
	/**
	* Sets the resolution.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		const uniforms = this.uniforms;
		uniforms.resolution.value.set(width, height);
		uniforms.texelSize.value.set(1 / width, 1 / height);
		uniforms.aspect.value = width / height;
	}
	/**
	* An enumeration of shader code placeholders.
	*
	* @deprecated Use EffectShaderSection instead.
	* @type {Object}
	*/
	static get Section() {
		return EffectShaderSection;
	}
};
Number("186".replace(/\D+/g, ""));
var unpackDownscale = 255 / 256;
new Float32Array([
	unpackDownscale / 256 ** 3,
	unpackDownscale / 256 ** 2,
	unpackDownscale / 256,
	unpackDownscale
]);
new Float32Array([
	unpackDownscale,
	unpackDownscale / 256,
	unpackDownscale / 256 ** 2,
	1 / 256 ** 3
]);
function prefixSubstrings(prefix, substrings, strings) {
	for (const substring of substrings) {
		const prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
		const regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");
		for (const entry of strings.entries()) if (entry[1] !== null) strings.set(entry[0], entry[1].replace(regExp, prefixed));
	}
}
function integrateEffect(prefix, effect, data) {
	let fragmentShader = effect.getFragmentShader();
	let vertexShader = effect.getVertexShader();
	const mainImageExists = fragmentShader !== void 0 && /mainImage/.test(fragmentShader);
	const mainUvExists = fragmentShader !== void 0 && /mainUv/.test(fragmentShader);
	data.attributes |= effect.getAttributes();
	if (fragmentShader === void 0) throw new Error(`Missing fragment shader (${effect.name})`);
	else if (mainUvExists && (data.attributes & EffectAttribute.CONVOLUTION) !== 0) throw new Error(`Effects that transform UVs are incompatible with convolution effects (${effect.name})`);
	else if (!mainImageExists && !mainUvExists) throw new Error(`Could not find mainImage or mainUv function (${effect.name})`);
	else {
		const functionRegExp = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g;
		const shaderParts = data.shaderParts;
		let fragmentHead = shaderParts.get(EffectShaderSection.FRAGMENT_HEAD) || "";
		let fragmentMainUv = shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_UV) || "";
		let fragmentMainImage = shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_IMAGE) || "";
		let vertexHead = shaderParts.get(EffectShaderSection.VERTEX_HEAD) || "";
		let vertexMainSupport = shaderParts.get(EffectShaderSection.VERTEX_MAIN_SUPPORT) || "";
		const varyings = /* @__PURE__ */ new Set();
		const names = /* @__PURE__ */ new Set();
		if (mainUvExists) {
			fragmentMainUv += `	${prefix}MainUv(UV);
`;
			data.uvTransformation = true;
		}
		if (vertexShader !== null && /mainSupport/.test(vertexShader)) {
			const needsUv = /mainSupport *\([\w\s]*?uv\s*?\)/.test(vertexShader);
			vertexMainSupport += `	${prefix}MainSupport(`;
			vertexMainSupport += needsUv ? "vUv);\n" : ");\n";
			for (const m2 of vertexShader.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g)) for (const n of m2[1].split(/\s*,\s*/)) {
				data.varyings.add(n);
				varyings.add(n);
				names.add(n);
			}
			for (const m2 of vertexShader.matchAll(functionRegExp)) names.add(m2[1]);
		}
		for (const m2 of fragmentShader.matchAll(functionRegExp)) names.add(m2[1]);
		for (const d of effect.defines.keys()) names.add(d.replace(/\([\w\s,]*\)/g, ""));
		for (const u of effect.uniforms.keys()) names.add(u);
		names.delete("while");
		names.delete("for");
		names.delete("if");
		effect.uniforms.forEach((val, key) => data.uniforms.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));
		effect.defines.forEach((val, key) => data.defines.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));
		const shaders = /* @__PURE__ */ new Map([["fragment", fragmentShader], ["vertex", vertexShader]]);
		prefixSubstrings(prefix, names, data.defines);
		prefixSubstrings(prefix, names, shaders);
		fragmentShader = shaders.get("fragment");
		vertexShader = shaders.get("vertex");
		const blendMode = effect.blendMode;
		data.blendModes.set(blendMode.blendFunction, blendMode);
		if (mainImageExists) {
			if (effect.inputColorSpace !== null && effect.inputColorSpace !== data.colorSpace) fragmentMainImage += effect.inputColorSpace === "srgb" ? "color0 = sRGBTransferOETF(color0);\n	" : "color0 = sRGBToLinear(color0);\n	";
			if (effect.outputColorSpace !== "") data.colorSpace = effect.outputColorSpace;
			else if (effect.inputColorSpace !== null) data.colorSpace = effect.inputColorSpace;
			const depthParamRegExp = /MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;
			fragmentMainImage += `${prefix}MainImage(color0, UV, `;
			if ((data.attributes & EffectAttribute.DEPTH) !== 0 && depthParamRegExp.test(fragmentShader)) {
				fragmentMainImage += "depth, ";
				data.readDepth = true;
			}
			fragmentMainImage += "color1);\n	";
			const blendOpacity = prefix + "BlendOpacity";
			data.uniforms.set(blendOpacity, blendMode.opacity);
			fragmentMainImage += `color0 = blend${blendMode.blendFunction}(color0, color1, ${blendOpacity});

	`;
			fragmentHead += `uniform float ${blendOpacity};

`;
		}
		fragmentHead += fragmentShader + "\n";
		if (vertexShader !== null) vertexHead += vertexShader + "\n";
		shaderParts.set(EffectShaderSection.FRAGMENT_HEAD, fragmentHead);
		shaderParts.set(EffectShaderSection.FRAGMENT_MAIN_UV, fragmentMainUv);
		shaderParts.set(EffectShaderSection.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
		shaderParts.set(EffectShaderSection.VERTEX_HEAD, vertexHead);
		shaderParts.set(EffectShaderSection.VERTEX_MAIN_SUPPORT, vertexMainSupport);
		if (effect.extensions !== null) for (const extension of effect.extensions) data.extensions.add(extension);
	}
}
var EffectPass = class extends Pass {
	/**
	* Constructs a new effect pass.
	*
	* @param {Camera} camera - The main camera.
	* @param {...Effect} effects - The effects that will be rendered by this pass.
	*/
	constructor(camera, ...effects) {
		super("EffectPass");
		this.fullscreenMaterial = new EffectMaterial(null, null, null, camera);
		this.listener = (event) => this.handleEvent(event);
		this.effects = [];
		this.setEffects(effects);
		this.skipRendering = false;
		this.minTime = 1;
		this.maxTime = Number.POSITIVE_INFINITY;
		this.timeScale = 1;
	}
	set mainScene(value) {
		for (const effect of this.effects) effect.mainScene = value;
	}
	set mainCamera(value) {
		this.fullscreenMaterial.copyCameraSettings(value);
		for (const effect of this.effects) effect.mainCamera = value;
	}
	/**
	* Indicates whether this pass encodes its output when rendering to screen.
	*
	* @type {Boolean}
	* @deprecated Use fullscreenMaterial.encodeOutput instead.
	*/
	get encodeOutput() {
		return this.fullscreenMaterial.encodeOutput;
	}
	set encodeOutput(value) {
		this.fullscreenMaterial.encodeOutput = value;
	}
	/**
	* Indicates whether dithering is enabled.
	*
	* @type {Boolean}
	*/
	get dithering() {
		return this.fullscreenMaterial.dithering;
	}
	set dithering(value) {
		const material = this.fullscreenMaterial;
		material.dithering = value;
		material.needsUpdate = true;
	}
	/**
	* Sets the effects.
	*
	* @param {Effect[]} effects - The effects.
	* @protected
	*/
	setEffects(effects) {
		for (const effect of this.effects) effect.removeEventListener("change", this.listener);
		this.effects = effects.sort((a, b) => b.attributes - a.attributes);
		for (const effect of this.effects) effect.addEventListener("change", this.listener);
	}
	/**
	* Updates the compound shader material.
	*
	* @protected
	*/
	updateMaterial() {
		const data = new EffectShaderData();
		let id = 0;
		for (const effect of this.effects) if (effect.blendMode.blendFunction === BlendFunction.DST) data.attributes |= effect.getAttributes() & EffectAttribute.DEPTH;
		else if ((data.attributes & effect.getAttributes() & EffectAttribute.CONVOLUTION) !== 0) throw new Error(`Convolution effects cannot be merged (${effect.name})`);
		else integrateEffect("e" + id++, effect, data);
		let fragmentHead = data.shaderParts.get(EffectShaderSection.FRAGMENT_HEAD);
		let fragmentMainImage = data.shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_IMAGE);
		let fragmentMainUv = data.shaderParts.get(EffectShaderSection.FRAGMENT_MAIN_UV);
		const blendRegExp = /\bblend\b/g;
		for (const blendMode of data.blendModes.values()) fragmentHead += blendMode.getShaderCode().replace(blendRegExp, `blend${blendMode.blendFunction}`) + "\n";
		if ((data.attributes & EffectAttribute.DEPTH) !== 0) {
			if (data.readDepth) fragmentMainImage = "float depth = readDepth(UV);\n\n	" + fragmentMainImage;
			this.needsDepthTexture = this.getDepthTexture() === null;
		} else this.needsDepthTexture = false;
		if (data.colorSpace === "srgb") fragmentMainImage += "color0 = sRGBToLinear(color0);\n	";
		if (data.uvTransformation) {
			fragmentMainUv = "vec2 transformedUv = vUv;\n" + fragmentMainUv;
			data.defines.set("UV", "transformedUv");
		} else data.defines.set("UV", "vUv");
		data.shaderParts.set(EffectShaderSection.FRAGMENT_HEAD, fragmentHead);
		data.shaderParts.set(EffectShaderSection.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
		data.shaderParts.set(EffectShaderSection.FRAGMENT_MAIN_UV, fragmentMainUv);
		for (const [key, value] of data.shaderParts) if (value !== null) data.shaderParts.set(key, value.trim().replace(/^#/, "\n#"));
		this.skipRendering = id === 0;
		this.needsSwap = !this.skipRendering;
		this.fullscreenMaterial.setShaderData(data);
	}
	/**
	* Rebuilds the shader material.
	*/
	recompile() {
		this.updateMaterial();
	}
	/**
	* Returns the current depth texture.
	*
	* @return {Texture} The current depth texture, or null if there is none.
	*/
	getDepthTexture() {
		return this.fullscreenMaterial.depthBuffer;
	}
	/**
	* Sets the depth texture.
	*
	* @param {Texture} depthTexture - A depth texture.
	* @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	*/
	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
		this.fullscreenMaterial.depthBuffer = depthTexture;
		this.fullscreenMaterial.depthPacking = depthPacking;
		for (const effect of this.effects) effect.setDepthTexture(depthTexture, depthPacking);
	}
	/**
	* Renders the effect.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		for (const effect of this.effects) effect.update(renderer, inputBuffer, deltaTime);
		if (!this.skipRendering || this.renderToScreen) {
			const material = this.fullscreenMaterial;
			material.inputBuffer = inputBuffer.texture;
			material.time += deltaTime * this.timeScale;
			renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
			renderer.render(this.scene, this.camera);
		}
	}
	/**
	* Updates the size of this pass.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		this.fullscreenMaterial.setSize(width, height);
		for (const effect of this.effects) effect.setSize(width, height);
	}
	/**
	* Performs initialization tasks.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	* @param {Number} frameBufferType - The type of the main frame buffers.
	*/
	initialize(renderer, alpha, frameBufferType) {
		this.renderer = renderer;
		for (const effect of this.effects) effect.initialize(renderer, alpha, frameBufferType);
		this.updateMaterial();
		if (frameBufferType !== void 0 && frameBufferType !== 1009) this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
	}
	/**
	* Deletes disposable objects.
	*/
	dispose() {
		super.dispose();
		for (const effect of this.effects) {
			effect.removeEventListener("change", this.listener);
			effect.dispose();
		}
	}
	/**
	* Handles events.
	*
	* @param {Event} event - An event.
	*/
	handleEvent(event) {
		switch (event.type) {
			case "change": this.recompile();
		}
	}
};
var NormalPass = class extends Pass {
	/**
	* Constructs a new normal pass.
	*
	* @param {Scene} scene - The scene to render.
	* @param {Camera} camera - The camera to use to render the scene.
	* @param {Object} [options] - The options.
	* @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
	* @param {Number} [options.resolutionScale=1.0] - The resolution scale.
	* @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	* @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	* @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	* @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	*/
	constructor(scene, camera, { renderTarget, resolutionScale = 1, width = Resolution.AUTO_SIZE, height = Resolution.AUTO_SIZE, resolutionX = width, resolutionY = height } = {}) {
		super("NormalPass");
		this.needsSwap = false;
		this.renderPass = new RenderPass(scene, camera, new MeshNormalMaterial());
		const renderPass = this.renderPass;
		renderPass.ignoreBackground = true;
		renderPass.skipShadowMapUpdate = true;
		const clearPass = renderPass.getClearPass();
		clearPass.overrideClearColor = new Color(7829503);
		clearPass.overrideClearAlpha = 1;
		this.renderTarget = renderTarget;
		if (this.renderTarget === void 0) {
			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: NearestFilter,
				magFilter: NearestFilter
			});
			this.renderTarget.texture.name = "NormalPass.Target";
		}
		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));
	}
	set mainScene(value) {
		this.renderPass.mainScene = value;
	}
	set mainCamera(value) {
		this.renderPass.mainCamera = value;
	}
	/**
	* The normal texture.
	*
	* @type {Texture}
	*/
	get texture() {
		return this.renderTarget.texture;
	}
	/**
	* The normal texture.
	*
	* @deprecated Use texture instead.
	* @return {Texture} The texture.
	*/
	getTexture() {
		return this.renderTarget.texture;
	}
	/**
	* Returns the resolution settings.
	*
	* @deprecated Use resolution instead.
	* @return {Resolution} The resolution.
	*/
	getResolution() {
		return this.resolution;
	}
	/**
	* Returns the current resolution scale.
	*
	* @return {Number} The resolution scale.
	* @deprecated Use resolution.preferredWidth or resolution.preferredHeight instead.
	*/
	getResolutionScale() {
		return this.resolution.scale;
	}
	/**
	* Sets the resolution scale.
	*
	* @param {Number} scale - The new resolution scale.
	* @deprecated Use resolution.preferredWidth or resolution.preferredHeight instead.
	*/
	setResolutionScale(scale) {
		this.resolution.scale = scale;
	}
	/**
	* Renders the scene normals.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	* @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	* @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	* @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	*/
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const renderTarget = this.renderToScreen ? null : this.renderTarget;
		this.renderPass.render(renderer, renderTarget, renderTarget);
	}
	/**
	* Updates the size of this pass.
	*
	* @param {Number} width - The width.
	* @param {Number} height - The height.
	*/
	setSize(width, height) {
		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.width, resolution.height);
	}
};
new Float32Array([
	0,
	0,
	0
]), new Float32Array([
	1,
	0,
	0
]), new Float32Array([
	1,
	1,
	0
]), new Float32Array([
	1,
	1,
	1
]), new Float32Array([
	0,
	0,
	0
]), new Float32Array([
	1,
	0,
	0
]), new Float32Array([
	1,
	0,
	1
]), new Float32Array([
	1,
	1,
	1
]), new Float32Array([
	0,
	0,
	0
]), new Float32Array([
	0,
	0,
	1
]), new Float32Array([
	1,
	0,
	1
]), new Float32Array([
	1,
	1,
	1
]), new Float32Array([
	0,
	0,
	0
]), new Float32Array([
	0,
	1,
	0
]), new Float32Array([
	1,
	1,
	0
]), new Float32Array([
	1,
	1,
	1
]), new Float32Array([
	0,
	0,
	0
]), new Float32Array([
	0,
	1,
	0
]), new Float32Array([
	0,
	1,
	1
]), new Float32Array([
	1,
	1,
	1
]), new Float32Array([
	0,
	0,
	0
]), new Float32Array([
	0,
	0,
	1
]), new Float32Array([
	0,
	1,
	1
]), new Float32Array([
	1,
	1,
	1
]);
new Float32Array([
	0,
	-.25,
	.25,
	-.125,
	.125,
	-.375,
	.375
]);
new Float32Array([0, 0]), new Float32Array([.25, -.25]), new Float32Array([-.25, .25]), new Float32Array([.125, -.125]), new Float32Array([-.125, .125]);
new Uint8Array([0, 0]), new Uint8Array([3, 0]), new Uint8Array([0, 3]), new Uint8Array([3, 3]), new Uint8Array([1, 0]), new Uint8Array([4, 0]), new Uint8Array([1, 3]), new Uint8Array([4, 3]), new Uint8Array([0, 1]), new Uint8Array([3, 1]), new Uint8Array([0, 4]), new Uint8Array([3, 4]), new Uint8Array([1, 1]), new Uint8Array([4, 1]), new Uint8Array([1, 4]), new Uint8Array([4, 4]);
new Uint8Array([0, 0]), new Uint8Array([1, 0]), new Uint8Array([0, 2]), new Uint8Array([1, 2]), new Uint8Array([2, 0]), new Uint8Array([3, 0]), new Uint8Array([2, 2]), new Uint8Array([3, 2]), new Uint8Array([0, 1]), new Uint8Array([1, 1]), new Uint8Array([0, 3]), new Uint8Array([1, 3]), new Uint8Array([2, 1]), new Uint8Array([3, 1]), new Uint8Array([2, 3]), new Uint8Array([3, 3]);
bilinear(0, 0, 0, 0), new Float32Array([
	0,
	0,
	0,
	0
]), bilinear(0, 0, 0, 1), new Float32Array([
	0,
	0,
	0,
	1
]), bilinear(0, 0, 1, 0), new Float32Array([
	0,
	0,
	1,
	0
]), bilinear(0, 0, 1, 1), new Float32Array([
	0,
	0,
	1,
	1
]), bilinear(0, 1, 0, 0), new Float32Array([
	0,
	1,
	0,
	0
]), bilinear(0, 1, 0, 1), new Float32Array([
	0,
	1,
	0,
	1
]), bilinear(0, 1, 1, 0), new Float32Array([
	0,
	1,
	1,
	0
]), bilinear(0, 1, 1, 1), new Float32Array([
	0,
	1,
	1,
	1
]), bilinear(1, 0, 0, 0), new Float32Array([
	1,
	0,
	0,
	0
]), bilinear(1, 0, 0, 1), new Float32Array([
	1,
	0,
	0,
	1
]), bilinear(1, 0, 1, 0), new Float32Array([
	1,
	0,
	1,
	0
]), bilinear(1, 0, 1, 1), new Float32Array([
	1,
	0,
	1,
	1
]), bilinear(1, 1, 0, 0), new Float32Array([
	1,
	1,
	0,
	0
]), bilinear(1, 1, 0, 1), new Float32Array([
	1,
	1,
	0,
	1
]), bilinear(1, 1, 1, 0), new Float32Array([
	1,
	1,
	1,
	0
]), bilinear(1, 1, 1, 1), new Float32Array([
	1,
	1,
	1,
	1
]);
function lerp2(a, b, p) {
	return a + (b - a) * p;
}
function bilinear(e0, e1, e2, e3) {
	return lerp2(lerp2(e0, e1, .75), lerp2(e2, e3, .75), .875);
}
//#endregion
//#region node_modules/maath/dist/objectSpread2-284232a6.esm.js
function _defineProperty(obj, key, value) {
	if (key in obj) Object.defineProperty(obj, key, {
		value,
		enumerable: true,
		configurable: true,
		writable: true
	});
	else obj[key] = value;
	return obj;
}
new Vector2();
new Vector2();
//#endregion
//#region node_modules/maath/dist/classCallCheck-9098b006.esm.js
function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}
//#endregion
//#region node_modules/maath/dist/index-0332b2ed.esm.js
var Grad = function Grad(x, y, z) {
	var _this = this;
	_classCallCheck(this, Grad);
	_defineProperty(this, "dot2", function(x, y) {
		return _this.x * x + _this.y * y;
	});
	_defineProperty(this, "dot3", function(x, y, z) {
		return _this.x * x + _this.y * y + _this.z * z;
	});
	this.x = x;
	this.y = y;
	this.z = z;
};
var grad3 = [
	new Grad(1, 1, 0),
	new Grad(-1, 1, 0),
	new Grad(1, -1, 0),
	new Grad(-1, -1, 0),
	new Grad(1, 0, 1),
	new Grad(-1, 0, 1),
	new Grad(1, 0, -1),
	new Grad(-1, 0, -1),
	new Grad(0, 1, 1),
	new Grad(0, -1, 1),
	new Grad(0, 1, -1),
	new Grad(0, -1, -1)
];
var p = [
	151,
	160,
	137,
	91,
	90,
	15,
	131,
	13,
	201,
	95,
	96,
	53,
	194,
	233,
	7,
	225,
	140,
	36,
	103,
	30,
	69,
	142,
	8,
	99,
	37,
	240,
	21,
	10,
	23,
	190,
	6,
	148,
	247,
	120,
	234,
	75,
	0,
	26,
	197,
	62,
	94,
	252,
	219,
	203,
	117,
	35,
	11,
	32,
	57,
	177,
	33,
	88,
	237,
	149,
	56,
	87,
	174,
	20,
	125,
	136,
	171,
	168,
	68,
	175,
	74,
	165,
	71,
	134,
	139,
	48,
	27,
	166,
	77,
	146,
	158,
	231,
	83,
	111,
	229,
	122,
	60,
	211,
	133,
	230,
	220,
	105,
	92,
	41,
	55,
	46,
	245,
	40,
	244,
	102,
	143,
	54,
	65,
	25,
	63,
	161,
	1,
	216,
	80,
	73,
	209,
	76,
	132,
	187,
	208,
	89,
	18,
	169,
	200,
	196,
	135,
	130,
	116,
	188,
	159,
	86,
	164,
	100,
	109,
	198,
	173,
	186,
	3,
	64,
	52,
	217,
	226,
	250,
	124,
	123,
	5,
	202,
	38,
	147,
	118,
	126,
	255,
	82,
	85,
	212,
	207,
	206,
	59,
	227,
	47,
	16,
	58,
	17,
	182,
	189,
	28,
	42,
	223,
	183,
	170,
	213,
	119,
	248,
	152,
	2,
	44,
	154,
	163,
	70,
	221,
	153,
	101,
	155,
	167,
	43,
	172,
	9,
	129,
	22,
	39,
	253,
	19,
	98,
	108,
	110,
	79,
	113,
	224,
	232,
	178,
	185,
	112,
	104,
	218,
	246,
	97,
	228,
	251,
	34,
	242,
	193,
	238,
	210,
	144,
	12,
	191,
	179,
	162,
	241,
	81,
	51,
	145,
	235,
	249,
	14,
	239,
	107,
	49,
	192,
	214,
	31,
	181,
	199,
	106,
	157,
	184,
	84,
	204,
	176,
	115,
	121,
	50,
	45,
	127,
	4,
	150,
	254,
	138,
	236,
	205,
	93,
	222,
	114,
	67,
	29,
	24,
	72,
	243,
	141,
	128,
	195,
	78,
	66,
	215,
	61,
	156,
	180
];
var perm = new Array(512);
var gradP = new Array(512);
(function seed(_seed) {
	if (_seed > 0 && _seed < 1) _seed *= 65536;
	_seed = Math.floor(_seed);
	if (_seed < 256) _seed |= _seed << 8;
	for (var i = 0; i < 256; i++) {
		var v;
		if (i & 1) v = p[i] ^ _seed & 255;
		else v = p[i] ^ _seed >> 8 & 255;
		perm[i] = perm[i + 256] = v;
		gradP[i] = gradP[i + 256] = grad3[v % 12];
	}
})(0);
.5 * (Math.sqrt(3) - 1);
(3 - Math.sqrt(3)) / 6;
function normalizeSeed(seed) {
	if (typeof seed === "number") seed = Math.abs(seed);
	else if (typeof seed === "string") {
		var string = seed;
		seed = 0;
		for (var i = 0; i < string.length; i++) seed = (seed + (i + 1) * (string.charCodeAt(i) % 96)) % 2147483647;
	}
	if (seed === 0) seed = 311;
	return seed;
}
function lcgRandom(seed) {
	var state = normalizeSeed(seed);
	return function() {
		var result = state * 48271 % 2147483647;
		state = result;
		return result / 2147483647;
	};
}
new function Generator(_seed) {
	var _this = this;
	_classCallCheck(this, Generator);
	_defineProperty(this, "seed", 0);
	_defineProperty(this, "init", function(seed) {
		_this.seed = seed;
		_this.value = lcgRandom(seed);
	});
	_defineProperty(this, "value", lcgRandom(this.seed));
	this.init(_seed);
}(Math.random());
//#endregion
//#region node_modules/n8ao/dist/N8AO.js
function $parcel$interopDefault(a) {
	return a && a.__esModule ? a.default : a;
}
var $62561e92e160ec9a$exports = {};
$62561e92e160ec9a$exports = JSON.parse("{\"architecture\":\"attention-v3-int8\",\"formatVersion\":3,\"globalBias\":[-0.32877659797668457,0.4370867609977722,-0.05251404270529747,1.3072023391723633,0.0477047860622406,0.24477416276931763,0.009111796505749226,-0.17459993064403534],\"globalFeatureInverseStandardDeviation\":[10.771836280822754,1.9548665285110474,1.612365484237671],\"globalFeatureMean\":[0.9198138117790222,-0.49808526039123535,0.03374629095196724],\"globalWeights\":[101,-4,7,-127,6,-11,3,1,0,-16,-7,8,-8,-1,7,-4,0,0,-12,-3,-13,1,0,2],\"headBias\":[-0.15895532071590424,0.007501596584916115,-0.47742825746536255,0.01632097363471985,-0.48355796933174133,-0.1052703931927681,-0.8414919376373291,-0.21046382188796997],\"headWeights\":[-45,-7,-45,-20,7,-13,120,-24,-15,-26,-19,1,27,-48,-4,-10,1,-5,-24,64,91,-1,-68,39,54,39,101,-40,-127,64,-41,-17,-23,-19,3,35,-2,33,3,9,-64,-32,30,42,-112,12,28,-11,15,2,-4,-7,7,-3,-5,1,76,48,-34,-67,103,-40,-26,1,58,-11,46,-41,5,-6,-17,-8,13,17,-35,45,27,-17,-28,7,-53,12,-51,6,-32,-5,58,-9,-28,-21,37,-12,1,20,2,2,11,7,-4,-9,2,-15,-1,-8,16,12,-27,-1,61,-5,-1,4,-7,-2,7,4,1,4,-2,4,-18,-16,28,6,-65,16,3,-3,-5,-2,0,-40,-21,-22,14,30,-21,49,15,-64,43,19,23,18,5,-15,21,21,30,17,-11,-6,22,-38,-20,97,-46,-5,-13,-59,26,-13,11,-2,-10,-8,2,-15,-17,-27,-9,26,7,-7,6,9,-32,5,-9,12,49,17,-1,24,20,35,14,-33,-50,-1,-4,-26,11,11,9,-80,30,9,36,6,-12,-4,-7,39,-10,-30,-49,1,-43,-20,-34,76,-36,-10,15,-8,43,31,38,-42,39,37,-7,7,8,16,28,-83,32,9,23,-13,39,119,23,-127,-24,8,-48,-29,-7,-33,-12,58,-24,-29,-19,12,-55,-90,0,126,26,42,54,22],\"keyProjectionWeights\":[0,-1,-1,1,1,1,1,1,-64,32,49,23,-25,4,27,-22,0,1,-1,-1,-1,1,1,0,-34,38,64,88,13,-53,-41,58,-7,-4,79,-41,27,26,14,2,-2,1,1,1,-1,-1,1,1,1,-1,-1,-1,-1,-1,1,1,4,-3,126,42,-40,-116,35,20],\"name\":\"residual-attention-v3-50m-qat-int8-epoch-25-zo-278w\",\"outputBias\":-0.0005526235327124596,\"outputWeights\":[11,11,14,-27,9,-22,127,6],\"quantization\":{\"scales\":{\"globalWeight\":0.021090541950849095,\"headWeight\":0.04935851140909355,\"keyWeight\":0.1733924937791441,\"outputWeight\":0.0030087142047955295,\"tapInputWeight\":0.1096231754049479,\"tapOutputWeight\":0.017949438644286102,\"valueWeight\":0.013986751242596301},\"scheme\":\"symmetric-int8-per-tensor\",\"zeroPoint\":0},\"summaryQueries\":[0.0038647791370749474,0.09565000981092453,0.002756686182692647,-0.08183622360229492,-0.15209506452083588,-0.0006105066277086735,0.0010439646430313587,-0.03020688332617283,0.005065929610282183,0.14488759636878967,0.003160916268825531,-0.0855727270245552,-0.3123375475406647,0.00039022407145239413,0.0037786494940519333,0.1451321840286255,-0.002009483054280281,0.0597594790160656,0.0045239729806780815,-0.08765853196382523,-0.13884992897510529,-0.0021647117100656033,0.003985927440226078,0.09727758169174194,0.007170629221946001,0.0786278173327446,0.004103775601834059,-0.1198369711637497,-0.2925199568271637,-0.002055276418104768,0.0030450925696641207,0.14401987195014954],\"supportedDenoiseSamples\":[4,8,16],\"tapFeatureInverseStandardDeviation\":[2.283243417739868,0.8810898065567017,0.8210930228233337,3.752316474914551,3.6375720500946045,2.670454978942871,10.249449729919434,0.12639354169368744,100],\"tapFeatureMean\":[0.010318092070519924,0.01364430133253336,0.13411010801792145,-0.004725644364953041,0.10053129494190216,0.8384788632392883,0.9203217625617981,1.7139031887054443,1],\"tapInputBias\":[0.4780646860599518,-0.45214661955833435,0.289407879114151,0.34804567694664,-0.1320028454065323,0.17722633481025696,0.011480014771223068,-0.26692497730255127],\"tapInputWeights\":[0,1,7,0,-1,-7,0,31,-2,-1,14,-126,0,0,-1,2,26,-2,0,66,-73,0,0,0,-12,22,-3,0,-76,-90,0,-1,-7,-3,58,-1,0,2,6,0,0,3,4,-40,0,0,3,-13,0,0,1,-7,-13,0,0,-7,10,0,-2,-7,0,-39,-2,0,-13,-19,0,-2,20,-1,3,-1],\"tapOutputBias\":[-0.3867710530757904,0.1349504142999649,0.35706064105033875,-0.5938405394554138,-0.031154220923781395,1.4079623222351074,-1.9221038818359375,0.6029739379882812],\"tapOutputWeights\":[18,-4,47,19,74,-94,-21,-9,73,-59,88,-10,-3,71,-7,24,20,74,24,-31,-12,-10,-15,-45,-126,2,-4,27,-5,24,35,-11,-4,9,-8,26,-10,27,26,-20,17,-50,5,-35,0,-5,12,-71,89,-58,22,-83,-115,7,-16,-89,89,22,1,-20,-22,-25,-26,44],\"valueProjectionWeights\":[-16,-6,40,-17,84,-76,59,51,-10,-2,-10,-1,-23,74,-70,23,-5,4,4,-7,-77,127,20,-48,-36,4,-17,-12,-4,10,29,-27,-2,11,-47,-50,-54,-3,14,11,-23,-1,109,31,4,-100,-33,-36,-19,0,-8,20,-35,-24,79,2,44,2,5,7,22,-70,-67,-35]}");
var $1193f60a44983e43$var$MATRIX_LAYOUTS = [
	[
		"tapInputWeight",
		"tapInputWeights",
		8,
		9
	],
	[
		"tapOutputWeight",
		"tapOutputWeights",
		8,
		8
	],
	[
		"globalWeight",
		"globalWeights",
		8,
		3
	],
	[
		"keyWeight",
		"keyProjectionWeights",
		8,
		8
	],
	[
		"valueWeight",
		"valueProjectionWeights",
		8,
		8
	],
	[
		"headWeight",
		"headWeights",
		8,
		32
	],
	[
		"outputWeight",
		"outputWeights",
		1,
		8
	]
];
var $1193f60a44983e43$var$scale = (name) => {
	const value = (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).quantization?.scales?.[name];
	if (!(value > 0) || !Number.isFinite(value)) throw new Error(`The bundled N8AO neural model has no valid ${name} scale.`);
	return value;
};
if ((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).architecture !== "attention-v3-int8" || (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).formatVersion !== 3 || (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).quantization?.scheme !== "symmetric-int8-per-tensor" || (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).quantization?.zeroPoint !== 0 || (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).supportedDenoiseSamples?.join(",") !== "4,8,16" || $1193f60a44983e43$var$MATRIX_LAYOUTS.some(([, field, rows, columns]) => (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports))[field]?.length !== rows * columns || (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports))[field].some((value) => !Number.isInteger(value) || value < -127 || value > 127))) throw new Error("The bundled N8AO neural denoise model has an unsupported layout.");
var $1193f60a44983e43$var$glslFloat = (value) => {
	if (!Number.isFinite(value)) throw new Error("The bundled N8AO neural model contains a non-finite value.");
	if (Object.is(value, -0)) return "0.0";
	const text = Number(value).toString();
	return /[.eE]/.test(text) ? text : `${text}.0`;
};
var $1193f60a44983e43$var$COMPONENTS = [
	"x",
	"y",
	"z",
	"w"
];
var $1193f60a44983e43$var$tokenAccessors = (name) => [...$1193f60a44983e43$var$COMPONENTS.map((component) => `${name}.lo.${component}`), ...$1193f60a44983e43$var$COMPONENTS.map((component) => `${name}.hi.${component}`)];
var $1193f60a44983e43$var$weightedTerm = (coefficient, input) => {
	if (coefficient === 0) return null;
	if (coefficient === 1) return input;
	if (coefficient === -1) return `(-${input})`;
	if (coefficient < 0) return `(-${$1193f60a44983e43$var$glslFloat(-coefficient)} * ${input})`;
	return `${$1193f60a44983e43$var$glslFloat(coefficient)} * ${input}`;
};
var $1193f60a44983e43$var$floatWeightedTerm = (coefficient, input) => {
	if (coefficient === 0) return null;
	return `${$1193f60a44983e43$var$glslFloat(coefficient)} * ${input}`;
};
var $1193f60a44983e43$var$sumTerms = (terms) => terms.filter(Boolean).join(" + ") || "0.0";
var $1193f60a44983e43$var$quantizedRow = (weights, row, width, inputs, tensorScale, bias) => {
	const terms = inputs.map((input, column) => $1193f60a44983e43$var$weightedTerm(weights[row * width + column], input));
	return `${$1193f60a44983e43$var$glslFloat(tensorScale)} * (${$1193f60a44983e43$var$sumTerms(terms)}) + ${$1193f60a44983e43$var$glslFloat(bias[row])}`;
};
var $1193f60a44983e43$var$vec4 = (values, indent = "        ") => `vec4(\n${values.map((value) => `${indent}    ${value}`).join(",\n")}\n${indent})`;
var $1193f60a44983e43$var$tokenLayer = ({ functionName, scaleName, weights, bias, width = 8, relu = false }) => {
	const inputs = $1193f60a44983e43$var$tokenAccessors("inputToken");
	const tensorScale = $1193f60a44983e43$var$scale(scaleName);
	const rows = Array.from({ length: 8 }, (_, row) => $1193f60a44983e43$var$quantizedRow(weights, row, width, inputs, tensorScale, bias));
	const low = $1193f60a44983e43$var$vec4(rows.slice(0, 4));
	const high = $1193f60a44983e43$var$vec4(rows.slice(4));
	const wrap = (value) => relu ? `max(${value}, vec4(0.0))` : value;
	return `
    NeuralToken neural${functionName[0].toUpperCase()}${functionName.slice(1)}(NeuralToken inputToken) {
        return NeuralToken(
            ${wrap(low)},
            ${wrap(high)}
        );
    }
`;
};
var $1193f60a44983e43$var$foldedBias = (weights, bias, means, inverseStandardDeviations, rows, width, tensorScale, constantInputs = {}) => Array.from({ length: rows }, (_, row) => {
	let value = bias[row];
	for (let column = 0; column < width; column++) {
		const weight = weights[row * width + column] * tensorScale;
		value -= weight * inverseStandardDeviations[column] * means[column];
		if (Object.hasOwn(constantInputs, column)) value += weight * inverseStandardDeviations[column] * constantInputs[column];
	}
	return value;
});
var $1193f60a44983e43$var$tapInputScale = $1193f60a44983e43$var$scale("tapInputWeight");
var $1193f60a44983e43$var$tapInputBias = $1193f60a44983e43$var$foldedBias((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapInputWeights, (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapInputBias, (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapFeatureMean, (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapFeatureInverseStandardDeviation, 8, 9, $1193f60a44983e43$var$tapInputScale, { 8: 1 });
var $1193f60a44983e43$var$tapScaledAccessors = $1193f60a44983e43$var$tokenAccessors("scaledInput");
var $1193f60a44983e43$var$tapInputRows = Array.from({ length: 8 }, (_, row) => $1193f60a44983e43$var$quantizedRow((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapInputWeights, row, 9, $1193f60a44983e43$var$tapScaledAccessors, $1193f60a44983e43$var$tapInputScale, $1193f60a44983e43$var$tapInputBias));
var $1193f60a44983e43$var$tapInputShader = `
    NeuralToken neuralTapInput(NeuralToken raw) {
        NeuralToken scaledInput = NeuralToken(
            raw.lo * ${$1193f60a44983e43$var$vec4((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapFeatureInverseStandardDeviation.slice(0, 4), "            ")},
            raw.hi * ${$1193f60a44983e43$var$vec4((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapFeatureInverseStandardDeviation.slice(4, 8), "            ")}
        );
        return NeuralToken(
            max(${$1193f60a44983e43$var$vec4($1193f60a44983e43$var$tapInputRows.slice(0, 4))}, vec4(0.0)),
            max(${$1193f60a44983e43$var$vec4($1193f60a44983e43$var$tapInputRows.slice(4))}, vec4(0.0))
        );
    }
`;
var $1193f60a44983e43$var$globalScale = $1193f60a44983e43$var$scale("globalWeight");
var $1193f60a44983e43$var$globalBias = $1193f60a44983e43$var$foldedBias((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).globalWeights, (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).globalBias, (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).globalFeatureMean, (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).globalFeatureInverseStandardDeviation, 8, 3, $1193f60a44983e43$var$globalScale);
var $1193f60a44983e43$var$globalInputs = $1193f60a44983e43$var$COMPONENTS.slice(0, 3).map((component) => `scaledInput.${component}`);
var $1193f60a44983e43$var$globalRows = Array.from({ length: 8 }, (_, row) => $1193f60a44983e43$var$quantizedRow((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).globalWeights, row, 3, $1193f60a44983e43$var$globalInputs, $1193f60a44983e43$var$globalScale, $1193f60a44983e43$var$globalBias));
var $1193f60a44983e43$var$globalInputShader = `
    NeuralToken neuralEncodeGlobal(vec4 raw) {
        vec3 scaledInput = raw.xyz * vec3(
            ${(/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).globalFeatureInverseStandardDeviation.map($1193f60a44983e43$var$glslFloat).join(", ")}
        );
        return NeuralToken(
            max(${$1193f60a44983e43$var$vec4($1193f60a44983e43$var$globalRows.slice(0, 4))}, vec4(0.0)),
            max(${$1193f60a44983e43$var$vec4($1193f60a44983e43$var$globalRows.slice(4))}, vec4(0.0))
        );
    }
`;
var $1193f60a44983e43$var$queryInputs = $1193f60a44983e43$var$tokenAccessors("key");
var $1193f60a44983e43$var$queryShader = `
    vec4 neuralQueryScores(NeuralToken key) {
        return ${$1193f60a44983e43$var$vec4(Array.from({ length: 4 }, (_, query) => $1193f60a44983e43$var$sumTerms($1193f60a44983e43$var$queryInputs.map((input, column) => $1193f60a44983e43$var$floatWeightedTerm((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).summaryQueries[query * 8 + column], input)))))};
    }
`;
var $1193f60a44983e43$var$summaryInputs = [];
for (let query = 0; query < 4; query++) $1193f60a44983e43$var$summaryInputs.push(...$1193f60a44983e43$var$COMPONENTS.map((component) => `runningSummaryLo[${query}].${component}`), ...$1193f60a44983e43$var$COMPONENTS.map((component) => `runningSummaryHi[${query}].${component}`));
var $1193f60a44983e43$var$headScale = $1193f60a44983e43$var$scale("headWeight");
var $1193f60a44983e43$var$headRows = Array.from({ length: 8 }, (_, row) => $1193f60a44983e43$var$quantizedRow((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).headWeights, row, 32, $1193f60a44983e43$var$summaryInputs, $1193f60a44983e43$var$headScale, (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).headBias));
var $1193f60a44983e43$var$headShader = `
    NeuralToken neuralHead(
        vec4 runningSummaryLo[4],
        vec4 runningSummaryHi[4]
    ) {
        return NeuralToken(
            max(${$1193f60a44983e43$var$vec4($1193f60a44983e43$var$headRows.slice(0, 4))}, vec4(0.0)),
            max(${$1193f60a44983e43$var$vec4($1193f60a44983e43$var$headRows.slice(4))}, vec4(0.0))
        );
    }
`;
var $1193f60a44983e43$var$outputShader = `
    float neuralOutput(NeuralToken head) {
        return ${$1193f60a44983e43$var$quantizedRow((/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).outputWeights, 0, 8, $1193f60a44983e43$var$tokenAccessors("head"), $1193f60a44983e43$var$scale("outputWeight"), [(/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).outputBias])};
    }
`;
var $1193f60a44983e43$export$d75ad64dd346ec0e = [
	$1193f60a44983e43$var$tapInputShader,
	$1193f60a44983e43$var$tokenLayer({
		functionName: "tapOutput",
		scaleName: "tapOutputWeight",
		weights: (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapOutputWeights,
		bias: (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).tapOutputBias,
		relu: true
	}),
	$1193f60a44983e43$var$globalInputShader,
	$1193f60a44983e43$var$tokenLayer({
		functionName: "keyProject",
		scaleName: "keyWeight",
		weights: (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).keyProjectionWeights,
		bias: new Array(8).fill(0)
	}),
	$1193f60a44983e43$var$tokenLayer({
		functionName: "valueProject",
		scaleName: "valueWeight",
		weights: (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports)).valueProjectionWeights,
		bias: new Array(8).fill(0)
	}),
	$1193f60a44983e43$var$queryShader,
	$1193f60a44983e43$var$headShader,
	$1193f60a44983e43$var$outputShader
].join("\n");
$1193f60a44983e43$var$MATRIX_LAYOUTS.reduce((sum, [, field]) => sum + (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports))[field].length, 0);
$1193f60a44983e43$var$MATRIX_LAYOUTS.reduce((sum, [, field]) => sum + (/*@__PURE__*/ $parcel$interopDefault($62561e92e160ec9a$exports))[field].filter((value) => value !== 0).length, 0);
`${$1193f60a44983e43$export$d75ad64dd346ec0e}`;
//#endregion
//#region node_modules/@react-three/postprocessing/dist/index.js
var resolveRef = (ref) => typeof ref === "object" && ref != null && "current" in ref ? ref.current : ref;
function useMergeRefs(localRef, outerRef) {
	return (0, import_react.useCallback)((instance) => {
		localRef.current = instance;
		if (typeof outerRef !== "function") {
			if (outerRef) outerRef.current = instance;
			return;
		}
		const cleanup = outerRef(instance);
		if (typeof cleanup !== "function") return;
		return () => {
			localRef.current = null;
			cleanup();
		};
	}, [localRef, outerRef]);
}
function readGroupChildren(group, filter) {
	const groupInstance = group.__r3f;
	return groupInstance ? groupInstance.children.map((child) => child.object).filter(filter) : [];
}
function updateIfChanged(ref, next) {
	const previous = ref.current;
	if (next.length === previous.length && next.every((item, i) => item === previous[i])) return false;
	ref.current = next;
	return true;
}
function readPierced(instance, key) {
	let target = instance;
	for (const part of key.split("-")) {
		if (target == null) return void 0;
		target = target[part];
	}
	return target;
}
function applyPierced(instance, key, value) {
	const parts = key.split("-");
	let target = instance;
	for (let idx = 0; idx < parts.length - 1; idx++) {
		if (target == null) return;
		target = target[parts[idx]];
	}
	if (target == null) return;
	target[parts[parts.length - 1]] = value;
}
function useLiveDefaults(instance, values, keys, get = readPierced, set = applyPierced) {
	const snapshotRef = (0, import_react.useRef)(null);
	const invalidate = useThree((state) => state.invalidate);
	(0, import_react.useLayoutEffect)(() => {
		const resolved = resolveRef(instance);
		if (!resolved) return;
		if (snapshotRef.current?.instance !== resolved) snapshotRef.current = {
			instance: resolved,
			defaults: /* @__PURE__ */ new Map(),
			applied: /* @__PURE__ */ new Map()
		};
		const { defaults, applied } = snapshotRef.current;
		let changed = false;
		for (const key of keys) {
			if (!defaults.has(key)) {
				const current = get(resolved, key);
				defaults.set(key, current);
				applied.set(key, current);
			}
			const next = values[key] !== void 0 ? values[key] : defaults.get(key);
			if (Object.is(applied.get(key), next)) continue;
			set(resolved, key, next);
			applied.set(key, next);
			changed = true;
		}
		if (changed) invalidate();
	});
}
var components$1 = /* @__PURE__ */ new WeakMap();
var i$1 = 0;
var BLEND_KEYS = ["blendMode-blendFunction", "blendMode-opacity-value"];
/**
* Registers `effect` as a JSX intrinsic once per class and returns a
* component that renders it. Everything else - construction from `args`,
* live prop application (with the same Color/Vector coercion and reset-
* to-default on removal any r3f element gets), disposal - is r3f's own
* reconciler, same rules as `<mesh>`/`<meshStandardMaterial>`. Only fits
* effects whose constructor works with zero arguments (`new Effect()`) -
* r3f's own reset-on-removal falls back to `0` otherwise, which is wrong
* for anything non-numeric. Effects that require e.g. scene/camera stay
* hand-rolled (see Outline.tsx, SelectiveBloom.tsx, ShockWave.tsx).
*
* `blendFunction`/`opacity` are pierced through to `blendMode-*` - every
* `Effect` has them on a nested `blendMode`, not on the effect itself, so a
* plain top-level prop would silently land on a stray, unread property.
* Applied via useLiveDefaults, not as plain JSX props: BlendMode's own
* constructor requires `blendFunction` (no default), so its constructor
* length isn't 0 either, and r3f's native reset-on-removal falls back to
* `changedProps[prop] = 0` - which is 9, not a merely
* "wrong" blend function but one that hides the effect entirely.
*/
function createEffectComponent(effect) {
	return function EffectComponent({ blendFunction, opacity, ref, ...props }) {
		let Component = components$1.get(effect);
		if (!Component) {
			const key = `@react-three/postprocessing/${effect.name}-${i$1++}`;
			extend({ [key]: effect });
			components$1.set(effect, Component = key);
		}
		const camera = useThree((state) => state.camera);
		const localRef = (0, import_react.useRef)(null);
		const setRef = useMergeRefs(localRef, ref);
		useLiveDefaults(localRef, {
			"blendMode-blendFunction": blendFunction,
			"blendMode-opacity-value": opacity
		}, BLEND_KEYS);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, {
			ref: setRef,
			camera,
			...props
		});
	};
}
var EffectComposerContext = /* @__PURE__ */ (0, import_react.createContext)(null);
var isConvolution = (effect) => (effect.getAttributes() & 2) === 2;
var hasMainUv = (effect) => /mainUv/.test(effect.getFragmentShader() ?? "");
function createRendererPropertyGuard(property) {
	const refs = /* @__PURE__ */ new WeakMap();
	return {
		acquire(gl, forcedValue) {
			const existing = refs.get(gl);
			if (existing) {
				existing.count++;
				existing.forcedValue = forcedValue;
			} else refs.set(gl, {
				count: 1,
				original: gl[property],
				forcedValue
			});
		},
		release(gl) {
			const entry = refs.get(gl);
			if (!entry) return;
			if (--entry.count <= 0) {
				if (gl[property] === entry.forcedValue) gl[property] = entry.original;
				refs.delete(gl);
			}
		}
	};
}
var autoClearGuard = /* @__PURE__ */ createRendererPropertyGuard("autoClear");
var toneMappingGuard = /* @__PURE__ */ createRendererPropertyGuard("toneMapping");
var glSize = /* @__PURE__ */ new Vector2();
var defaultRenderPass = (scene, camera) => new RenderPass(scene, camera);
var generatedPasses = /* @__PURE__ */ new WeakSet();
var groupPasses = /* @__PURE__ */ new WeakSet();
function disposePassWithoutEffects(pass) {
	if (pass instanceof EffectPass) pass.setEffects([]);
	Pass.prototype.dispose.call(pass);
}
function disposeGeneratedPass(pass) {
	if (!generatedPasses.has(pass)) return;
	disposePassWithoutEffects(pass);
}
function buildPasses(nodes, camera, mergeMode) {
	const passes = [];
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		if (node instanceof Effect) {
			const effects = [node];
			let hasConvolution = isConvolution(node);
			let hasMainUvEffect = hasMainUv(node);
			if (mergeMode !== "none") {
				let next;
				while ((next = nodes[i + 1]) instanceof Effect) {
					const nextIsConvolution = isConvolution(next);
					const nextHasMainUv = hasMainUv(next);
					if (mergeMode === "auto" && (hasConvolution && nextIsConvolution || hasConvolution && nextHasMainUv || hasMainUvEffect && nextIsConvolution)) break;
					effects.push(next);
					hasConvolution ||= nextIsConvolution;
					hasMainUvEffect ||= nextHasMainUv;
					i++;
				}
			}
			const pass = new EffectPass(camera, ...effects);
			generatedPasses.add(pass);
			passes.push(pass);
		} else if (node instanceof Pass) passes.push(node);
	}
	return passes;
}
var EffectComposer = /* @__PURE__ */ (0, import_react.memo)(function EffectComposer({ children, camera: _camera, scene: _scene, resolutionScale, enabled = true, renderPriority = 1, autoClear = true, autoRenderToScreen = true, depthBuffer, enableNormalPass, stencilBuffer, multisampling = 8, frameBufferType = HalfFloatType, renderPass = defaultRenderPass, mergeMode = "auto", ref }) {
	const { gl, scene: defaultScene, camera: defaultCamera } = useThree();
	const scene = _scene || defaultScene;
	const camera = _camera || defaultCamera;
	gl.getSize(glSize);
	const [composerState, setComposerState] = (0, import_react.useState)(null);
	const [, requestRebuild] = (0, import_react.useReducer)((c) => c + 1, 0);
	(0, import_react.useEffect)(() => {
		autoClearGuard.acquire(gl, false);
		const effectComposer = new EffectComposer$1(gl, {
			depthBuffer,
			stencilBuffer,
			multisampling,
			frameBufferType
		});
		effectComposer.autoRenderToScreen = autoRenderToScreen;
		effectComposer.addPass(renderPass(scene, camera));
		let normalPass = null;
		let downSamplingPass = null;
		if (enableNormalPass) {
			normalPass = new NormalPass(scene, camera);
			normalPass.enabled = false;
			effectComposer.addPass(normalPass);
			if (resolutionScale !== void 0) {
				downSamplingPass = new DepthDownsamplingPass({
					normalBuffer: normalPass.texture,
					resolutionScale
				});
				downSamplingPass.enabled = false;
				effectComposer.addPass(downSamplingPass);
			}
		}
		effectComposer.setSize(glSize.width, glSize.height);
		setComposerState({
			composer: effectComposer,
			normalPass,
			downSamplingPass
		});
		return () => {
			for (const pass of effectComposer.passes) disposeGeneratedPass(pass);
			effectComposer.dispose();
			autoClearGuard.release(gl);
		};
	}, [
		camera,
		gl,
		depthBuffer,
		stencilBuffer,
		multisampling,
		frameBufferType,
		autoRenderToScreen,
		renderPass,
		scene,
		enableNormalPass,
		resolutionScale
	]);
	const appliedSizeRef = (0, import_react.useRef)({
		width: -1,
		height: -1,
		pixelRatio: -1
	});
	useFrame((_, delta) => {
		if (!enabled || !composerState) return;
		const { composer } = composerState;
		gl.getSize(glSize);
		const pixelRatio = gl.getPixelRatio();
		const applied = appliedSizeRef.current;
		if (glSize.width !== applied.width || glSize.height !== applied.height || pixelRatio !== applied.pixelRatio) {
			composer.setSize(glSize.width, glSize.height);
			applied.width = glSize.width;
			applied.height = glSize.height;
			applied.pixelRatio = pixelRatio;
		}
		const currentAutoClear = gl.autoClear;
		gl.autoClear = autoClear;
		if (stencilBuffer && !autoClear) gl.clearStencil();
		composer.render(delta);
		gl.autoClear = currentAutoClear;
	}, enabled ? renderPriority : 0);
	const group = (0, import_react.useRef)(null);
	const nodesRef = (0, import_react.useRef)([]);
	const [nodesVersion, setNodesVersion] = (0, import_react.useState)(0);
	(0, import_react.useLayoutEffect)(() => {
		if (!composerState) return;
		const nodes = readGroupChildren(group.current, (object) => object instanceof Effect || object instanceof Pass);
		if (updateIfChanged(nodesRef, nodes)) setNodesVersion((v) => v + 1);
	});
	(0, import_react.useLayoutEffect)(() => {
		if (!composerState) return;
		const { composer, normalPass, downSamplingPass } = composerState;
		const passes = buildPasses(nodesRef.current, camera, mergeMode);
		if (passes.some((pass) => groupPasses.has(pass))) {
			const trailingCopyPass = new CopyPass();
			generatedPasses.add(trailingCopyPass);
			passes.push(trailingCopyPass);
		}
		for (const pass of passes) composer.addPass(pass);
		if (passes.length) {
			if (normalPass) normalPass.enabled = true;
			if (downSamplingPass) downSamplingPass.enabled = true;
		}
		return () => {
			for (const pass of passes) {
				composer.removePass(pass);
				disposeGeneratedPass(pass);
			}
			if (normalPass) normalPass.enabled = false;
			if (downSamplingPass) downSamplingPass.enabled = false;
		};
	}, [
		composerState,
		nodesVersion,
		camera,
		mergeMode
	]);
	(0, import_react.useEffect)(() => {
		toneMappingGuard.acquire(gl, 0);
		gl.toneMapping = 0;
		return () => {
			toneMappingGuard.release(gl);
		};
	}, [gl]);
	const state = (0, import_react.useMemo)(() => composerState ? {
		composer: composerState.composer,
		normalPass: composerState.normalPass,
		downSamplingPass: composerState.downSamplingPass,
		resolutionScale,
		camera,
		scene,
		requestRebuild,
		autoClear
	} : null, [
		composerState,
		resolutionScale,
		camera,
		scene,
		requestRebuild,
		autoClear
	]);
	(0, import_react.useImperativeHandle)(ref, () => composerState?.composer, [composerState]);
	if (!state) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectComposerContext.Provider, {
		value: state,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
			ref: group,
			children
		})
	});
});
var BloomImpl = /* @__PURE__ */ createEffectComponent(BloomEffect);
function Bloom({ blendFunction = 0, luminanceThreshold, luminanceSmoothing, mipmapBlur, radius, levels, resolutionScale, resolutionX, resolutionY, ...liveProps }) {
	const args = (0, import_react.useMemo)(() => [{
		luminanceThreshold,
		luminanceSmoothing,
		mipmapBlur,
		radius,
		levels,
		resolutionScale,
		resolutionX,
		resolutionY
	}], [
		luminanceThreshold,
		luminanceSmoothing,
		mipmapBlur,
		radius,
		levels,
		resolutionScale,
		resolutionX,
		resolutionY
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BloomImpl, {
		blendFunction,
		args,
		...liveProps
	});
}
//#endregion
export { EffectComposer as n, Bloom as t };
