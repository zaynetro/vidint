;(function () {

  Parse.initialize("CM0kieoQyGZwRayG9jUT7RLYwaUujPVa9B9GrsyH", "y6wWLtz54RA2ALBxYH61fOo2wsph9HcwvqH6tdmk");

  var companyName = document.querySelector('#companyName');
  var question = document.querySelector('#question');
  var startBtn = document.querySelector('#startBtn');
  var stopBtn = document.querySelector('#stopBtn');
  var video = document.querySelector('#video');
  var uploadBtn = document.querySelector('#uploadBtn');
  var username = document.querySelector('#username');

  var hash = location.hash;

  if(!hash.length) return console.log('Wrong address');

  // Remove hash mark
  hash = hash.slice(1);

  var params = hash.split('&');
  var interviewId;

  params.forEach(function (param) {
    var keys = param.split('=');
    if(keys[0] == 'to') {
      interviewId = keys[1];
    }
  });

  if(!interviewId) return console.log('Wrong address');

  var Interview = Parse.Object.extend('Interview');
  var query = new Parse.Query(Interview);
  query.get(interviewId, {
    success : function (interview) {
      companyName.textContent = interview.get('company');
      question.src = interview.get('video')._url;
    },

    error : function (_, error) {
      console.log(error);
    }
  });


  startBtn.onclick = function () {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    uploadBtn.disabled = true;

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
     uploadBtn.disabled = false;

    window.audioVideoRecorder.stopRecording(function (url) {
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

       callback(stream);
     }, function (error) {
       console.error(error);
     });
  }

  uploadBtn.onclick = function () {

    window.audioVideoRecorder.getDataURL(function (dataURL) {

      var file = new Parse.File('video.webm', { base64: dataURL });
      file.save().then(function (saved) {

        var answer = new Parse.Object('Answer');
        answer.set('video', file);
        answer.set('name', username.value);
        answer.set('interview', interviewId);
        answer.save(null, {
          success : function (answer) {
            // finalLink.value = answer.id;
            console.log('Replied');
          },

          error : function (answer, error) {
            console.log(error);
          }
        });

      }, function (error) {
        console.log(error);
      });
    });
  };

})();
