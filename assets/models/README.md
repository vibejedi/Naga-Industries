# 3D models

Drop production GLB files here:

| Product  | File                      |
|----------|---------------------------|
| SIPAG I  | `assets/models/sipag-i.glb`  |
| LAKAN II | `assets/models/lakan-ii.glb` (the Tripo3D export) |
| DIWA     | `assets/models/diwa.glb`     |

Until a file exists, pages render a procedural stand-in from `assets/js/scene.js`
(three.js). Once you have the GLB, swap the pinned scene on that product page for
`<model-viewer>`, which is already vendored at `assets/vendor/model-viewer.min.js`:

```html
<!-- replace the <section class="scene" data-scene="laptop" …> block with: -->
<section class="scene" data-scene="laptop" data-glb="assets/models/lakan-ii.glb" data-scene-pin aria-label="LAKAN II in 3D">
  <model-viewer src="assets/models/lakan-ii.glb" alt="LAKAN II" camera-controls auto-rotate
    shadow-intensity="1" exposure="1" environment-image="neutral" interaction-prompt="none"
    camera-orbit="30deg 75deg 105%" disable-zoom></model-viewer>
  <div class="caption">…</div>
</section>
<!-- and add, once per page, before naga.js: -->
<script type="module" src="assets/vendor/model-viewer.min.js"></script>
```

`data-glb` tells `scene.js` to leave that container alone. `model-viewer` gives
drag-to-orbit, auto-rotate, and AR on phones out of the box. To keep the
scroll-driven lid animation with a real model, export the lid as a separate
animation clip and drive `modelViewer.currentTime` from the `naga:progress` event
that `naga.js` dispatches on the section.

Keep files under 5 MB (Draco or meshopt compression) so the page stays fast on mobile data.
