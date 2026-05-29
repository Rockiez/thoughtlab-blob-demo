# ThoughtLab Glass Refraction Bubble Background Effect

A high-performance, 1:1 replica of the **ThoughtLab** fluid raymarching glass bubble background. Build with pure HTML, CSS, Three.js, and GLSL.

It has been packaged into a reusable **ES Module** (`blob-background.js`) which can be imported and initialized in any vanilla HTML, React, Vue, Next.js, or Nuxt project.

---

## 🚀 Quick Start

### 1. Structure (HTML)

Place a container element that will host the canvas. It should cover the viewport and be fixed behind your content.

```html
<!-- Background Canvas Container -->
<div id="gl"></div>

<!-- Your Page Content -->
<main>
  <h1 data-gl-text>Hello ThoughtLab</h1>
  
  <!-- Interactive Hover Card -->
  <div class="card" data-gl-snap data-gl-hover-img="./path/to/showcase.jpg">
    Hover Me to snap & draw image inside bubble
  </div>
</main>
```

### 2. Styling (CSS)

Ensure the canvas host is set up as a fixed full-screen overlay behind all elements:

```css
#gl {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    pointer-events: none; /* Let pointer events pass to interactive DOM cards */
}

main {
    position: relative;
    z-index: 1; /* Content sits on top of background */
}
```

### 3. Usage (JS)

Import the `BlobBackground` class and initialize it on your canvas container:

```javascript
import { BlobBackground } from './blob-background.js';

const bg = new BlobBackground({
  container: '#gl',
});
```

---

## 🛠️ Configuration & API Options

You can customize the selectors, assets, and GLSL shader values by passing options to the constructor:

```javascript
const bg = new BlobBackground({
  container: '#gl',                     // Target element or selector query
  textSelector: '[data-gl-text]',       // Elements whose text will be scanned and refracted
  snapSelector: '[data-gl-snap]',       // Elements that mouse snaps to on hover
  sizeSelector: '[data-gl-size]',       // Scrolling section elements changing bubble size
  
  config: {
    uSizeDefault: 0.14,                 // Default bubble radius in WebGL space (0.0 to 1.0)
    BlobSizeHover: 0.89,                // Scale multiplier when snapping to hover cards
    uRefraction: 0.03,                  // Glass index of refraction index
    uRefractionColorShift: 0.75,        // RGB chromatic aberration offset factor
    uDistortionFrequency: 2.174,        // Wave frequency of the bubble wobble
    uDistortionStrength: 1.63,          // Wave strength of the bubble wobble
    uDisplacementSpeed: 0.315,          // Wobble animation speed multiplier
    cubemapPath: './static/cubemaps/01/' // Path to cubemap assets folder containing [px,nx,py,ny,pz,nz] images
  }
});
```

### 🧹 Resource Disposal (React / Vue Lifecycle)

To prevent WebGL memory leaks when switching pages in SPA frameworks, invoke the `.destroy()` method in your cleanup lifecycle hooks:

```javascript
// React useEffect clean-up example:
useEffect(() => {
  const bg = new BlobBackground({ container: '#gl' });
  return () => bg.destroy();
}, []);
```

---

## 🎨 Interactive DOM Triggers

The background scans your DOM layout automatically and binds interactivity based on selectors:

1. **`data-gl-text`**: Put this attribute on any text element (`h1`, `p`, etc.). The text will be scanned and rendered onto a dynamic offscreen refraction canvas texture, giving the glass bubble realistic distortion when it sweeps across the text.
2. **`data-gl-snap`** and **`data-gl-hover-img="image.jpg"`**: Apply to hover elements. The bubble will snap to the center of the element, shrink slightly, and transition a cropped, centered version of the showcase image inside it with transparent glass borders.
3. **`data-gl-size="X"`** and **`data-gl-scroll-snap="#element"`**: Apply to page scroll sections.
   - When the section enters the middle viewport band, the bubble target radius changes to `X / 10`.
   - If `data-gl-scroll-snap` is provided (e.g. pointing to a circle target visualizer), the bubble will auto-snap to that target's viewport position on scroll and display the image linked by `data-gl-target-img` inside it.

---

## 📦 Assets Required

To render reflections, the engine needs 6 cubemap reflection files.
Place the images `px.png`, `nx.png`, `py.png`, `ny.png`, `pz.png`, `nz.png` in your asset directory and point `cubemapPath` config option to it.
*If the cubemap textures are missing or fail to load, the engine automatically falls back to a high-fidelity procedural reflection map so the bubble still looks beautiful.*
