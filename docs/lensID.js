// window.lensID = 'b8e614e9-bd59-429b-94a8-05ae9385210a'; //Third Sky Lens;
// window.groupID = 'f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b'; //LIVE_PROD Group;
// window.modePhoto = true;
// window.modeVideo = true;
// window.modeBothCamera = true;
// window.modeStartFaceCamera = false;


const params = new URLSearchParams(window.location.search);

function getURLorFallback(key, defaultValue) {
  if (params.has(key)) {
    // For booleans, interpret 'true'/'false' strings
    if (defaultValue === true || defaultValue === false) {
      return params.get(key) === 'true';
    }
    // For strings, just return the value
    return params.get(key);
  }
  return defaultValue;
}

window.lensID = getURLorFallback('lensID', '9c498c2e-cf44-4c29-ad37-0000871ad226'); // DG-web
// window.lensID = getURLorFallback('lensID', '24948c05-b609-48d7-bd5f-20f9ff471b51'); // DG-ARMIRROR-API
window.groupID = getURLorFallback('groupID', 'f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b'); // LIVE_PROD Group
window.modePhoto = getURLorFallback('modePhoto', true);
window.modeVideo = getURLorFallback('modeVideo', false);
window.modeBothCamera = getURLorFallback('modeBothCamera', false);
window.modeStartFaceCamera = getURLorFallback('modeStartFaceCamera', true);
window.isArMirror = getURLorFallback('isArMirror', false); //change to undefined to skip intro or '0' for d&g project
window.splashScreen = getURLorFallback('splashScreen', '0'); //change to undefined to skip intro or '0' for d&g project


console.log('lensID : ' + window.lensID);
console.log('groupID : ' + window.groupID);
console.log('modePhoto : ' + window.modePhoto);
console.log('modeVideo : ' + window.modeVideo);
console.log('modeBothCamera : ' + window.modeBothCamera);
console.log('modeStartFaceCamera : ' + window.modeStartFaceCamera);
console.log('isArMirror : ' + window.isArMirror);

document.getElementById('captureButton').style.display = !window.modePhoto && !window.modeVideo ? "none" : "flex";

console.log('splashScreen : ' + window.splashScreen);
// if (window.splashScreen != '0') document.getElementById('splash-img').src = window.splashScreen;