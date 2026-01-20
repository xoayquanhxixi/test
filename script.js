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

  // Final image size (3:4)
  canvas.width = 960;
  canvas.height = 1280;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Reserve space for bottom frame (text area)
  const bottomFrameHeight = 120;
  const photoHeight = canvas.height - bottomFrameHeight;

  // Scale video to FIT (not cover) the photo area
  const scale = Math.max(
    canvas.width / vw,
    photoHeight / vh
  );

  const drawWidth = vw * scale;
  const drawHeight = vh * scale;

  const x = (canvas.width - drawWidth) / 2;
  const y = (photoHeight - drawHeight) / 2;

  // Un-mirror front camera feed for final image
  if (usingFrontCamera) {
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, x, y, drawWidth, drawHeight);

  if (usingFrontCamera) {
    ctx.restore();
  }

  // POLAROID TEXT
ctx.fillStyle = "black";
ctx.textAlign = "center";

// Font sizes tuned for 960×1280 Polaroid
const dateFontSize = 32;
const logoFontSize = 40;

// Position text relative to bottom frame
const frameTop = photoHeight;
const frameCenter = frameTop + bottomFrameHeight / 2;

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
