require('babel-core/register');
const TimerService = require('./TimerService');

// TimerService.startTimer('abc123', 2000)
// .then((eventId) => {
//   console.log('Event id recieved from start timer: ' + eventId);
// });

TimerService.startTimer('abc1234', 1000)
.then((eventId) => {
  console.log('Timer start timer event id: ' + eventId);

  // TimerService.stopTimer('abc1234', eventId)
  // .then((stopResult) => {
  //   console.log('Timer stop timer successful: ' + stopResult);
  // });
});

// TimerService.stopTimer('abc123');
