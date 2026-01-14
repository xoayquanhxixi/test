const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const takePhotoButton = document.getElementById("takePhoto");
const downloadButton = document.getElementById("downloadPhoto");
const countdownEl = document.getElementById("countdown");
const gallery = document.getElementById("gallery");

let latestImage = null;

// Start webcam video
async function startCamera()
{
  try 
  {
    const stream = await
navigator.mediaDevices.getUserMedia(
  {
    video: {facingMode: "user"
          }
  });
video.srcObject = stream;

video.onloadedmetadata = () =>
  {
video.play();
  };
  }
  catch(err)
  {
    alert("Error accessing camera: " + err)
  }
}

// Countdown settings
const COUNT_TIME = 3;

takePhotoButton.addEventListener("click", () => {
  startCamera();
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
if (video.videoWidth===0)
{
  alert("Camera not ready yet");
  return;
}

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  // Build Polaroid frame
  const dataURL = canvas.toDataURL("image/png");
latestImage = dataURL;
addToGallery(dataURL);
}

function addToGallery(dataURL) {
downloadButton.disabled = false;

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
}

// Trigger download
 downloadButton.addEventListener("click", () => {
  if (!latestImage) return;

  const link = document.createElement("a");
  link.href = latestImage;
  link.download = `polaroid_${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 });

