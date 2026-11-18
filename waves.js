// The code for my animation in the hero: essentially two interfering waves, one originating at a fixed point,
// the other originating at where the cursor is. Makes a cool effect. Waves are summed, then intensity is plotted.
// Regarding AI; it came up with the idea and I used it for some formulation of coding; as I am not very familiar with js.
// As a physics student I tried doing as much of the actual physics and math by myself, using AI only to turn it into proper js code.


// Find the <canvas> element in the page by its id.
const canvas = document.getElementById("waves");

// Only run if this page actually has the canvas
if (canvas) {
  const ctx = canvas.getContext("2d");

  // Compute the pattern on a small grid and let browser scale it up (faster)
  const SCALE = 4; // 1 computed pixel = 4 by 4 screen pixels
  const k = 0.32; // wave number 
  const omega = 0.045; // angular frequency 

  // Amber color from CSS as RGB
  const AMBER = [233, 168, 38];
  const NAVY = [20, 35, 59];

  let width, height, image;
  let sources = [];
  let target = null; // where the mouse wants the moving source to be
  let t = 0; 

  // Respect the 'reduce motion' setting some people turn on in their OS, AI suggested this
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Canvas size = hero size, and make the two sources of waves
  function resize() {
    width = Math.ceil(canvas.clientWidth / SCALE);
    height = Math.ceil(canvas.clientHeight / SCALE);
    canvas.width = width;
    canvas.height = height;
    image = ctx.createImageData(width, height);
    sources = [
      { x: width * 0.72, y: height * 0.35 },   // the fixed source
      { x: width * 0.84, y: height * 0.68 },   // the source that follows the mouse
    ];
  }

  // Draw one frame of the pattern
  function draw() {
    const data = image.data;
    const [s1, s2] = sources;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // distance from this pixel to each source
        const r1 = Math.hypot(x - s1.x, y - s1.y);
        const r2 = Math.hypot(x - s2.x, y - s2.y);

        // sum waves, then square for intensity
        const psi = Math.cos(k * r1 - omega * t) + Math.cos(k * r2 - omega * t);
        let intensity = (psi * psi) / 4;

        // intensity slowly fades away with factor 0.9
        const fade = Math.exp(-(r1 + r2) / (width * 0.9));
        intensity *= fade;

        // mix navy and amber depending on intensity
        const i = (y * width + x) * 4;
        data[i]     = NAVY[0] + (AMBER[0] - NAVY[0]) * intensity;
        data[i + 1] = NAVY[1] + (AMBER[1] - NAVY[1]) * intensity;
        data[i + 2] = NAVY[2] + (AMBER[2] - NAVY[2]) * intensity;
        data[i + 3] = 255;    // fully opaque
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  // loop so it becomes animation
  function loop() {
    t += 1;
    if (target) {
      // smooth motion of waves
      sources[1].x += (target.x - sources[1].x) * 0.05;
      sources[1].y += (target.y - sources[1].y) * 0.05;
    }
    draw();
    requestAnimationFrame(loop);  // ask the browser to call loop() again next frame
  }

  // When the mouse moves over the hero, update the target position
  canvas.parentElement.addEventListener("mousemove", (event) => {
    const box = canvas.getBoundingClientRect();
    target = {
      x: (event.clientX - box.left) / SCALE,
      y: (event.clientY - box.top) / SCALE,
    };
  });

  window.addEventListener("resize", () => { resize(); draw(); });

  resize();
  if (reduceMotion) {
    draw(); // just one still frame
  } else {
    loop(); // start the animation
  }
}
