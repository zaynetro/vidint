/**
 * Main page
 */

var startBtn = document.querySelector('#startBtn');
var stopBtn = document.querySelector('#stopBtn');
var video = document.querySelector('#video');

startBtn.onclick = function () {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  captureUserMedia(function (stream) {
    window.audioVideoRecorder = window.RecordRTC(stream, {
      type : 'video' // don't forget this; otherwise you'll get video/webm instead of audio/ogg
    });
    window.audioVideoRecorder.startRecording();
  });
};

stopBtn.onclick = function () {
   stopBtn.disabled = true;
   startBtn.disabled = false;

  window.audioVideoRecorder.stopRecording(function (url) {
    //  downloadURL.innerHTML = '<a href="' + url + '" download="RecordRTC.webm" target="_blank">Save RecordRTC.webm to Disk!</a>';
    video.src = url;
    video.muted = false;
    video.play();

    video.onended = function() {
      video.pause();

      // dirty workaround for: "firefox seems unable to playback"
      // video.src = URL.createObjectURL(audioVideoRecorder.getBlob());
    };

    var recordedBlob = window.audioVideoRecorder.getBlob();
    window.audioVideoRecorder.getDataURL(function(dataURL) {
      console.log(dataURL);
    });
    console.log(recordedBlob);
  });
};

function captureUserMedia(callback) {
   navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
   navigator.getUserMedia({
     audio : true,
     video : true
   }, function(stream) {
     video.src = URL.createObjectURL(stream);
     video.muted = true;
     video.controls = true;
    //  videoElement.play();

     callback(stream);
   }, function (error) {
     console.error(error);
   });
}
