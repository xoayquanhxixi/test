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

// Take photo
function takeSnapshot() {
  if (video.videoWidth === 0) {
    alert("Camera not ready yet");
    return;
  }

  const ctx = canvas.getContext("2d");

  const border = 25;
  const bottomBorder = 100;
  
canvas.width = video.videoHeight + border * 2;
  canvas.height = video.videoWidth + border + bottomBorder;

  // White Polaroid background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

 ctx.save();

  // Move origin to center of photo area
  ctx.translate(canvas.width / 2, (canvas.height - bottomBorder) / 2);

  // Rotate for portrait mobile camera
  ctx.rotate(Math.PI / 2);

  // Mirror ONLY front camera
  if (usingFrontCamera) {
    ctx.scale(-1, 1);
  }

  // Draw video centered
  ctx.drawImage(
    video,
    -video.videoHeight / 2,
    -video.videoWidth / 2,
    video.videoHeight,
    video.videoWidth
  );

  ctx.restore();

  // Date
  ctx.fillStyle = "black";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Taken on: " + new Date().toLocaleString(),
    canvas.width / 2,
    canvas.height - 55
  );

  // Logo
  ctx.font = "20px Arial";
  ctx.fillText("@CHEMISTRY30S", canvas.width / 2, canvas.height - 25);

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
