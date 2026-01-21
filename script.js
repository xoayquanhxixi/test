const video = document.getElementById("video");
const canvas = document.getElementById("canvas") || document.createElement("canvas");
const takePhotoButton = document.getElementById("takePhoto");
const downloadButton = document.getElementById("downloadPhoto");
const countdownEl = document.getElementById("countdown");
const gallery = document.getElementById("gallery");
const polaroidPreview = document.getElementById("polaroidPreview");
const polaroidImage = document.getElementById("polaroidImage");

let latestImage = null;
let stream = null;

// START CAMERA
async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
  });
  video.srcObject = stream;
  await video.play();
  video.classList.add("mirror");
}

window.addEventListener("load", startCamera);

// COUNTDOWN
const COUNT_TIME = 3;

takePhotoButton.addEventListener("click", () => {
  startCountdown(COUNT_TIME);
});

function startCountdown(time) {
  countdownEl.textContent = time;
  const timer = setInterval(() => {
    time--;
    if (time > 0) {
      countdownEl.textContent = time;
    } else {
      clearInterval(timer);
      countdownEl.textContent = "";
      takeSnapshot();
    }
  }, 1000);
}

// TAKE PHOTO
function takeSnapshot() {
  const ctx = canvas.getContext("2d");

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  canvas.width = 960;
  canvas.height = 1280;

  const bottomFrame = Math.round(canvas.height * 0.18);
  const photoHeight = canvas.height - bottomFrame;

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


const sideMargin = 40;
const topMargin = 40;

// White Polaroid base
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Mirror video
ctx.save();
ctx.translate(canvas.width, 0);
ctx.scale(-1, 1);

// Draw photo INSIDE frame
ctx.drawImage(
  video,
  sx, sy, sw, sh,
  sideMargin,
  topMargin,
  canvas.width - sideMargin * 2,
  photoHeight - topMargin
);

ctx.restore();
  
  // Bottom frame
  ctx.fillStyle = "white";
  ctx.fillRect(0, photoHeight, canvas.width, bottomFrame);

  ctx.fillStyle = "#000";
  ctx.textAlign = "center";

  ctx.font = "32px Arial";
  ctx.fillText(
    new Date().toLocaleDateString(),
    canvas.width / 2,
    photoHeight + bottomFrame / 2 - 6
  );

  ctx.font = "40px Arial";
  ctx.fillText(
    "@CHEMISTRY30S",
    canvas.width / 2,
    photoHeight + bottomFrame / 2 + 36
  );

  latestImage = canvas.toDataURL("image/png");

  polaroidImage.src = latestImage;
polaroidPreview.classList.remove("hidden");
  
  downloadButton.disabled = false;
}

// GALLERY
function addToGallery(src) {
  gallery.innerHTML = "";
  
  const frame = document.createElement("div");
  frame.className = "polaroid small";

  const img = document.createElement("img");
  img.src = src;

  frame.appendChild(img);
  gallery.appendChild(frame);
}

// DOWNLOAD
downloadButton.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = latestImage;
  a.download = `polaroid_${Date.now()}.png`;
  a.click();
});
