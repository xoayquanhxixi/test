const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const takePhotoButton = document.getElementById("takePhoto");
const downloadButton = document.getElementById("downloadPhoto");
const countdownEl = document.getElementById("countdown");
const gallery = document.getElementById("gallery");

let latestImage = null;
let cameraStarted = false;

// Start webcam video
async function startCamera()
{
  try 
  {
    const stream = await navigator.mediaDevices.getUserMedia(
  {
    video: {facingMode: "user"
          }
  });
video.srcObject = stream;

  return new Promise((resolve) => 
{
      video.onloadedmetadata = () => 
{
        video.play();
        resolve(true);
      };
    });

  }

  catch(err)
  {
    alert("Error accessing camera: " + err);
return false;

  }
}

// Countdown settings
const COUNT_TIME = 3;

takePhotoButton.addEventListener("click", async () => 
  {
  if (!cameraStarted)
  {
    const cameraReady = await startCamera();
    if (!cameraReady) return;
    cameraStarted = true;
}
    startCountdown(COUNT_TIME);
  });

function startCountdown(time) 
{
  countdownEl.textContent = time;
  
  let interval = setInterval(() =>
    {
    time--;
    if (time > 0) 
    {
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
  
  const ctx = canvas.getContext("2d");

canvas.width = video.videoWidth;
canvas.height = video.videoHeight + 100;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the camera image
  ctx.drawImage(video, 0, 0, canvas.width, video.videoHeight);

  // Draw white Polaroid frame
  ctx.fillStyle = "white";
  ctx.fillRect(0, video.videoHeight, canvas.width, 100);

  // Draw logo text
  ctx.font = "20px Arial";
  ctx.fillText("@CHEMISTRY30S", canvas.width / 2, video.videoHeight + 75);

  // Save final image with frame + date + logo
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
 downloadButton.addEventListener("click", () => 
   {
  if (!latestImage) return;

  const link = document.createElement("a");
  link.href = latestImage;
  link.download = `polaroid_${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 });

