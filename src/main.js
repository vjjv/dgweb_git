

//FLIP CAMERA EXAMPLE
import {
    bootstrapCameraKit,
    CameraKitSession,
    createMediaStreamSource,
    Transform2D,
} from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas');
const captureRenderTarget = document.getElementById('capture-canvas');
const flipCamera = document.getElementById('flip');
const intro = document.getElementById('intro-bg');
var firstTime = true;
console.log('splashScren : ' + window.splashScreen);
if (window.splashScreen) {
    document.body.addEventListener('click', () => {
        if (firstTime) {
            firstTime = false;
            if (DeviceMotionEvent) if (typeof DeviceMotionEvent.requestPermission === 'function') DeviceMotionEvent.requestPermission();
            intro.style.display = 'none';
            init();
        }
    }, true);

} else {
    intro.style.display = 'none';
    init();
}

let isBackFacing = !window.modeStartFaceCamera;
let mediaStream;

async function init() {
    const cameraKit = await bootstrapCameraKit({
        // apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjk4MDU3NzAyLCJzdWIiOiI0MDUyY2RlNC02YzMzLTRkM2UtYTJjNC0yNzllYzc1M2VmOWR-U1RBR0lOR341MTY4YzVmNC1kYWVkLTQ1N2ItOGJmYy01Y2JhODkwOWU4OTgifQ.b0Z-TegYa2Sg-lZy_8XoPw7f_iz7eEC5BtzYooyL5K4',
        apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzM4MjM2Njg5LCJzdWIiOiJmYWMzYWZjOS0zOTEyLTRlNTUtYTdiZS03MjJlOGRmYWY4ZjV-UFJPRFVDVElPTn5lOGQ0OTM1NS00YmNlLTRiYWEtODkzNC1lMWNlNmU0ZDM5M2IifQ.6sZB_6aFPL8OW-UO3Y37P7Rev7mzjS9IhNRFk7NelBI',
    });

    //V1 Live only, no Capture Render Target
    // const session = await cameraKit.createSession({ liveRenderTarget });

    //V2 Live and Capture available : Let Camera Kit create a new canvas, then append it to the DOM
    const canvasContainer = document.getElementById('canvas-part');
    const session = await cameraKit.createSession();
    session.output.live.setAttribute('id', 'live-canvas');
    session.output.capture.setAttribute('id', 'canvas');
    canvasContainer.appendChild(session.output.capture);
    canvasContainer.appendChild(session.output.live);
    // liveRenderTarget.replaceWith(session.output.capture);
    // captureRenderTarget.replaceWith(session.output.capture);



    //Load via Lens Group
    // const { lenses } = await cameraKit.lensRepository.loadLensGroups([
    // 'f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b',
    // ]);
    // session.applyLens(lenses[0]);


    const lens = await cameraKit.lensRepository.loadLens(
        window.lensID, //Lens ID
        window.groupID //Group ID
    );
    await session.applyLens(lens);

    bindFlipCamera(session);
}

function bindFlipCamera(session) {
    flipCamera.style.cursor = 'pointer';

    flipCamera.addEventListener('click', () => {
        updateCamera(session);
    });

    updateCamera(session);
}

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
console.log('isMobile : ' + isMobileDevice());

async function updateCamera(session) {

    // flipCamera.innerText = isBackFacing
    // ? 'Switch to Front Camera'
    // : 'Switch to Back Camera';

    if (mediaStream) {
        session.pause();
        mediaStream.getVideoTracks()[0].stop();
    }

    // if (isMobileDevice()) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: isBackFacing ? 'environment' : 'user',
            }
        });
    // }
    // if (!isMobileDevice()) {
    //     mediaStream = await navigator.mediaDevices.getUserMedia({
    //         video: {
    //             width: { ideal: 4096 },
    //             height: { ideal: 2160 },
    //             // width: { ideal: 1280 },
    //             // height: { ideal: 720 },
    //             facingMode: isBackFacing ? 'environment' : 'user',
    //         },
    //     });
    // }

    const source = createMediaStreamSource(mediaStream, {
        // NOTE: This is important for world facing experiences
        cameraType: isBackFacing ? 'back' : 'front',
    });

    await session.setSource(source);


    //DEBUG PIXELATE
    const resolutionMultiplier = window.devicePixelRatio;
    // const width = window.innerWidth * resolutionMultiplier;
    // const height = window.innerHeight * resolutionMultiplier;
    const width = document.getElementById('container-9-16').clientWidth * resolutionMultiplier;
    const height = document.getElementById('container-9-16').clientHeight * resolutionMultiplier;
    source.setRenderSize(width, height);
    console.log('Pixelate Debug')
    console.log('window.devicePixelRatio : ' + window.devicePixelRatio)
    console.log('window.innerWidth : ' + window.innerWidth)
    console.log('window.innerHeight : ' + window.innerHeight)
    console.log('source.setRenderSize(width, height) : ' + window.innerWidth * resolutionMultiplier + ', ' + window.innerHeight * resolutionMultiplier)
    //END DEBUG

    if (!isBackFacing) {
        source.setTransform(Transform2D.MirrorX);
    }

    isBackFacing = !isBackFacing;




    session.play('live'); // Start live output on "live-canvas"
    session.pause('capture'); // Pause capture output on "canvas"

    document.getElementById('captureButton').addEventListener('click', function () {
        session.play('capture');
        session.pause('live');
        setTimeout(e => {
            document.getElementById('canvas').style.display = 'block';
            document.getElementById('live-canvas').style.display = 'none';
            this.style.display = 'none';
        }, 100)

        const countdownEl = document.getElementById('countdown');
        const countdownNumber = document.querySelector('.countdown-number');
        const circle = document.querySelector('.countdown-circle circle');
        countdownEl.style.display = 'block';
        countdownNumber.textContent = '3';

        // Start circle animation
        circle.style.animation = 'none';
        void circle.offsetWidth; // Force reflow
        circle.style.animation = 'countdown 3s linear forwards';

        let count = 3;
        const intervalId = setInterval(function () {
            count--;
            countdownNumber.textContent = count;
            if (count <= 0) {
                clearInterval(intervalId);
                countdownEl.style.display = 'none';


                triggerFlash();

                replaceCanvasWithScreenshot();
            }
        }, 1000);


        function replaceCanvasWithScreenshot() {
            // Get data URL from canvas
            const canvas = document.getElementById('canvas');
            const dataURL = canvas.toDataURL('image/png');
            // Create image element
            const img = document.createElement('img');
            img.src = dataURL;
            img.style.height = '100%';
            // img.style.maxHeight = '100%';
            // img.style.maxWidth = '100%';
            // Replace canvas with image
            canvas.parentElement.insertBefore(img, canvas);
            canvas.style.display = 'none';

            // Show action buttons
            document.getElementById('btn-back').style.display = 'block';
            document.getElementById('btn-download').style.display = 'block';

            // Set up download button
            document.getElementById('btn-download').addEventListener('click', function () {
                // Check if Web Share API is supported
                if (isMobileDevice()) {

                    if (navigator.share) {
                        // Convert dataURL to a Blob
                        fetch(dataURL)
                            .then(res => res.blob())
                            .then(blob => {
                                const file = new File([blob], 'Dolce&Gabbana-VTO.png', { type: 'image/png' });
                                navigator.share({
                                    files: [file],
                                    title: 'Dolce & Gabbana VTO',
                                    text: 'Check out my Dolce & Gabbana virtual try-on!'
                                }).catch(err => {
                                    console.error('Error sharing:', err);
                                    // Fallback to download
                                    downloadImage(dataURL);
                                });
                            });
                    } else {
                        // Fallback to download
                        const a = document.createElement('a');
                        a.href = dataURL;
                        a.download = 'Dolce&Gabbana-VTO.png';
                        a.click();
                    }
                } else {
                    const a = document.createElement('a');
                    a.href = dataURL;
                    a.download = 'Dolce&Gabbana-VTO.png';
                    a.click();
                }
            });
            // document.getElementById('btn-download').addEventListener('click', function () {
            //     const a = document.createElement('a');
            //     a.href = dataURL;
            //     a.download = 'Dolce&Gabbana-VTO.png';
            //     a.click();
            // });

            // Set up back button: revert to first state
            document.getElementById('btn-back').addEventListener('click', function () {
                // Remove the screenshot image if present
                if (img.parentElement) img.parentElement.removeChild(img);
                // Show live canvas, hide capture canvas
                document.getElementById('live-canvas').style.display = 'block';
                document.getElementById('canvas').style.display = 'none';
                // Show capture button, hide action buttons
                document.getElementById('captureButton').style.display = 'block';
                document.getElementById('btn-back').style.display = 'none';
                document.getElementById('btn-download').style.display = 'none';
                // Resume live output, pause capture output
                session.play('live');
                session.pause('capture');
            });
        }
    });

    function triggerFlash() {
        const flash = document.getElementById('flash-overlay');
        // Reset to 0 opacity and clear any animation/transition
        flash.style.opacity = '0';
        flash.style.transition = 'none';

        // Force reflow
        void flash.offsetWidth;

        // First: fade in (0 to 1 in 0.3s linear)
        flash.style.transition = 'opacity 0.3s linear';
        flash.style.opacity = '1';

        // After 0.3s, start fade out (1 to 0 in 3s ease-out)
        setTimeout(() => {
            flash.style.transition = 'opacity 3s ease-out';
            flash.style.opacity = '0';
            // Optional: reset transition after animation
            setTimeout(() => {
                flash.style.transition = 'none';
            }, 3000);
        }, 300);
    }




}

// init();