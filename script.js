const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const takePhotoButton = document.getElementById("takePhoto");
const countdownEl = document.getElementById("countdown");
const gallery = document.getElementById("gallery");

// Start webcam video
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => (video.srcObject = stream))
  .catch((err) => alert("Error accessing camera: " + err));

// Countdown settings
const COUNT_TIME = 3;

takePhotoButton.addEventListener("click", () => {
  startCountdown(COUNT_TIME);
});

function startCountdown(time) {
  countdownEl.textContent = time;
  let interval = setInterval(() => {
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
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  // Build Polaroid frame
  const dataURL = canvas.toDataURL("image/png");
  addToGallery(dataURL);
}

function addToGallery(dataURL) {
  const frame = document.createElement("div");
  frame.className = "photo-frame";

  const img = document.createElement("img");
  img.src = dataURL;

  const dateTag = document.createElement("div");
  dateTag.className = "photo-date";
  dateTag.textContent = "Taken on: " + new Date().toLocaleString();

  frame.appendChild(img);
  frame.appendChild(dateTag);
  gallery.appendChild(frame);

  // Trigger download
  downloadImage(dataURL);
}

function downloadImage(dataURL) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "polaroid_" + Date.now() + ".png";
  link.click();
}
