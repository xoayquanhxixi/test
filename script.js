const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const takePhotoButton = document.getElementById("takePhoto");
const downloadButton = document.getElementById("downloadPhoto");
const countdownEl = document.getElementById("countdown");
const gallery = document.getElementById("gallery");
const flipCameraButton = document.getElementById("flipCamera");

let latestImage = null;
let cameraStarted = false;
let usingFrontCamera = true;
let currentStream = null;

// Start camera (front or back)
async function startCamera() {
  try {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: usingFrontCamera ? "user" : "environment" }
    });

    currentStream = stream;
    video.srcObject = stream;

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();

        if (usingFrontCamera)
        {
video.classList.add("mirror");
        } else {
video.classList.remove("mirror");
        }


        resolve(true);
      };
    });
  } catch (err) {
    alert("Error accessing camera: " + err);
    return false;
  }
}

// Countdown
const COUNT_TIME = 3;

takePhotoButton.addEventListener("click", async () => {
  if (!cameraStarted) {
    const ready = await startCamera();
    if (!ready) return;
    cameraStarted = true;
  }
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
  if (video.videoWidth === 0) {
    alert("Camera not ready yet");
    return;
  }

  const ctx = canvas.getContext("2d");

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  // Final Polaroid size (3:4)
  canvas.width = 960;
  canvas.height = 1280;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Polaroid bottom frame (18%)
  const bottomFrameHeight = Math.round(canvas.height * 0.18);
  const photoHeight = canvas.height - bottomFrameHeight;

  // Aspect ratios
  const targetAspect = canvas.width / photoHeight;
  const videoAspect = vw / vh;

  let sx, sy, sw, sh;

  if (videoAspect > targetAspect) {
    // Video wider → crop sides
    sh = vh;
    sw = vh * targetAspect;
    sx = (vw - sw) / 2;
    sy = 0;
  } else {
    // Video taller → crop top/bottom
    sw = vw;
    sh = vw / targetAspect;
    sx = 0;
    sy = (vh - sh) / 2;
  }

  // Mirror ONLY for front camera (before drawing)
  ctx.save();
  if (usingFrontCamera) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  // Draw cropped photo
  ctx.drawImage(
    video,
    sx, sy, sw, sh,          // source crop
    0, 0, canvas.width, photoHeight // destination
  );

  ctx.restore();

  // Bottom Polaroid frame
  ctx.fillStyle = "white";
  ctx.fillRect(0, photoHeight, canvas.width, bottomFrameHeight);

  // Text styling
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  const dateFontSize = 32;
  const logoFontSize = 40;

  const frameCenter = photoHeight + bottomFrameHeight / 2;

  ctx.font = `${dateFontSize}px Arial`;
  ctx.fillText(
    new Date().toLocaleDateString(),
    canvas.width / 2,
    frameCenter - 6
  );

  ctx.font = `${logoFontSize}px Arial`;
  ctx.fillText(
    "@CHEMISTRY30S",
    canvas.width / 2,
    frameCenter + 38
  );

  latestImage = canvas.toDataURL("image/png");
  addToGallery(latestImage);
}

// Gallery
function addToGallery(dataURL) {
  downloadButton.disabled = false;

  const frame = document.createElement("div");
  frame.className = "photo-frame";

  const img = document.createElement("img");
  img.src = dataURL;

  frame.appendChild(img);
  gallery.appendChild(frame);
}

// Download
downloadButton.addEventListener("click", () => {
  if (!latestImage) return;

  const link = document.createElement("a");
  link.href = latestImage;
  link.download = `polaroid_${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Flip camera
flipCameraButton.addEventListener("click", async () => {
  usingFrontCamera = !usingFrontCamera;
  cameraStarted = false;
  await startCamera();
  cameraStarted = true;
});

window.addEventListener("load", async () => {
  const ready = await startCamera();
  cameraStarted = ready;
});
