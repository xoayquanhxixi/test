const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const takePhotoButton = document.getElementById("takePhoto");
const downloadButton = document.getElementById("downloadPhoto");
const countdownEl = document.getElementById("countdown");
const gallery = document.getElementById("gallery");

let latestImage = null;
let cameraStarted = false;
let currentStream = null;

// Start camera
async function startCamera() {
  try {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    currentStream = stream;
    video.srcObject = stream;

    await video.play();
    video.classList.add("mirror");
    cameraStarted = true;
  } catch (err) {
    alert("Camera error: " + err);
  }
}

// Countdown
const COUNT_TIME = 3;

takePhotoButton.addEventListener("click", () => {
  if (!cameraStarted) return;
  startCountdown(COUNT_TIME);
});

function startCountdown(time) {
  countdownEl.textContent = time;

  const interval = setInterval(() => {
    time--;
    if (time > 0) {
      countdownEl.textContent = time;
    } else {
      clearInterval(interval);
      countdownEl.textContent = "";
      takeSnapshot();
    }
  }, 1000);
}

function takeSnapshot() {
  const ctx = canvas.getContext("2d");

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (!vw || !vh) return;

  // Polaroid size
  canvas.width = 960;
  canvas.height = 1280;

  const bottomFrameHeight = Math.round(canvas.height * 0.18);
  const photoHeight = canvas.height - bottomFrameHeight;

  // Crop to match photo area
  const targetAspect = canvas.width / photoHeight;
  const videoAspect = vw / vh;

  let sx, sy, sw, sh;

  if (videoAspect > targetAspect) {
    sh = vh;
    sw = vh * targetAspect;
    sx = (vw - sw) / 2;
    sy = 0;
  } else {
    sw = vw;
    sh = vw / targetAspect;
    sx = 0;
    sy = (vh - sh) / 2;
  }

  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(
    video,
    sx, sy, sw, sh,
    0, 0, canvas.width, photoHeight
  );

  ctx.restore();

  // Bottom frame
  ctx.fillStyle = "white";
  ctx.fillRect(0, photoHeight, canvas.width, bottomFrameHeight);

  // Text
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  ctx.font = "32px Arial";
  ctx.fillText(
    new Date().toLocaleDateString(),
    canvas.width / 2,
    photoHeight + bottomFrameHeight / 2 - 8
  );

  ctx.font = "40px Arial";
  ctx.fillText(
    "@CHEMISTRY30S",
    canvas.width / 2,
    photoHeight + bottomFrameHeight / 2 + 36
  );

  latestImage = canvas.toDataURL("image/png");
  addToGallery(latestImage);
}

// Gallery
function addToGallery(dataURL) {
  downloadButton.disabled = false;

  const img = document.createElement("img");
  img.src = dataURL;
  img.style.width = "140px";
  img.style.margin = "8px";

  gallery.appendChild(img);
}

// Download
downloadButton.addEventListener("click", () => {
  if (!latestImage) return;

  const link = document.createElement("a");
  link.href = latestImage;
  link.download = `polaroid_${Date.now()}.png`;
  link.click();
});

// Auto-start camera
window.addEventListener("load", startCamera);
