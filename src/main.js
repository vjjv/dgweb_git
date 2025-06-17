

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
    const canvasContainer = document.getElementById('canvas-container');
    const session = await cameraKit.createSession();
    // canvasContainer.appendChild(session.output.live);
    liveRenderTarget.replaceWith(session.output.capture);
    captureRenderTarget.replaceWith(session.output.capture);



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

async function updateCamera(session) {

    // flipCamera.innerText = isBackFacing
    // ? 'Switch to Front Camera'
    // : 'Switch to Back Camera';

    if (mediaStream) {
        session.pause();
        mediaStream.getVideoTracks()[0].stop();
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 4096 },
            height: { ideal: 2160 },
            // width: { ideal: 1280 },
            // height: { ideal: 720 },
            facingMode: isBackFacing ? 'environment' : 'user',
        },
    });

    const source = createMediaStreamSource(mediaStream, {
        // NOTE: This is important for world facing experiences
        cameraType: isBackFacing ? 'back' : 'front',
    });

    await session.setSource(source);


    //DEBUG PIXELATE
    const resolutionMultiplier = window.devicePixelRatio;
    const width = window.innerWidth * resolutionMultiplier;
    const height = window.innerHeight * resolutionMultiplier;
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

    session.play();
    isBackFacing = !isBackFacing;
}

// init();