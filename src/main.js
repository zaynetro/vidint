/**
 * Main page
 */

var Parse = require('parse').Parse;

Parse.initialize("CM0kieoQyGZwRayG9jUT7RLYwaUujPVa9B9GrsyH", "y6wWLtz54RA2ALBxYH61fOo2wsph9HcwvqH6tdmk");

var startBtn = document.querySelector('#startBtn');
var stopBtn = document.querySelector('#stopBtn');
var video = document.querySelector('#video');
var uploadBtn = document.querySelector('#uploadBtn');
var replyLink = document.querySelector('#replyLink');
var answersLink = document.querySelector('#answersLink');
var companyName = document.querySelector('#companyName');

var recorder;

startBtn.onclick = function () {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  uploadBtn.disabled = true;

  captureUserMedia(function (stream) {
    recorder = RecordRTC(stream, {
      type : 'video' // don't forget this; otherwise you'll get video/webm instead of audio/ogg
    });
    recorder.startRecording();
  });
};

stopBtn.onclick = function () {
   stopBtn.disabled = true;
   startBtn.disabled = false;
   uploadBtn.disabled = false;

  recorder.stopRecording(function (url) {
    video.src = url;
    video.muted = false;
    video.play();

    video.onended = function() {
      video.pause();

      // dirty workaround for: "firefox seems unable to playback"
      // video.src = URL.createObjectURL(audioVideoRecorder.getBlob());
    };
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

uploadBtn.onclick = function () {
  // var blob = window.audioVideoRecorder.getBlob();
  //
  // var reader = new window.FileReader();
  // reader.readAsDataURL(blob);
  // reader.onloadend = function() {
  //   base64data = reader.result;
  //   console.log(base64data);
  //   video.src = base64data;
  // };

  stopBtn.disabled = true;
  startBtn.disabled = true;
  uploadBtn.disabled = true;

  recorder.getDataURL(function (dataURL) {

    var file = new Parse.File('video.webm', { base64: dataURL });
    file.save().then(function (saved) {

      var interview = new Parse.Object('Interview');
      interview.set('video', file);
      interview.set('company', companyName.value);
      interview.save(null, {
        success : function (interview) {
          replyLink.value = pageUrl() + 'reply.html#to=' + interview.id;
          answersLink.value = pageUrl() + 'answers.html#to=' + interview.id;
          alert('Successfully saved, copy links below');
        },

        error : function (interview, error) {
          console.log(error);
          alert('Interview question is not associated with the video, see console for more details');
        }
      });

    }, function (error) {
      console.log(error);
      alert('File is not saved, see console for more details');
    });
  });

  function pageUrl() {
    return location.protocol + '//' + location.host + '/';
  }
};
