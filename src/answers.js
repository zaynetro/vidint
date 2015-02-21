/**
 * Answers page
 */

var Parse = require('parse').Parse;

Parse.initialize("CM0kieoQyGZwRayG9jUT7RLYwaUujPVa9B9GrsyH", "y6wWLtz54RA2ALBxYH61fOo2wsph9HcwvqH6tdmk");

var companyName = document.querySelector('#companyName');
var question = document.querySelector('#question');
var answersNode = document.querySelector('#answers');

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

var Answer = Parse.Object.extend('Answer');
var ansQuery = new Parse.Query(Answer);
ansQuery.equalTo('interview', interviewId);
ansQuery.descending('createdAt');
ansQuery.find({
  success : function (answers) {
    console.log('Fetched', answers.length);
    answers.forEach(function (answer) {
      var li = document.createElement('li');

      var name = document.createElement('span');
      name.textContent = answer.get('name');

      var video = document.createElement('video');
      video.src = answer.get('video')._url;
      video.controls = true;

      var div = document.createElement('div');
      div.className = 'video-wrap';

      div.appendChild(video);

      li.appendChild(name);
      li.appendChild(div);

      answersNode.appendChild(li);
    });
  },

  error : function (error) {
    console.log(error);
  }
});
