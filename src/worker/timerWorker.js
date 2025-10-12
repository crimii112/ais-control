import moment from 'moment';

onmessage = event => {
  // console.log(event.data);
  //const start = moment();

  // setInterval(() => {
  //   const now = moment();
  //   const diff = moment.duration(now.diff(start)).asMilliseconds();
  //   if (event.data - diff <= 1000) postMessage(event.data + '초지남');
  // }, 1000);

  setInterval(() => {
    const now = moment();
    let hit;
    if (event.data === 300000)
      hit = now.minute() % 5 === 0 && now.seconds() === 0;
    else if (event.data === 600000)
      hit = now.minute() % 10 === 0 && now.seconds() === 0;
    else if (event.data === 3600000)
      hit = now.minute() === 0 && now.seconds() === 0;

    if (hit) postMessage(moment().format('YY-MM-DD HH:mm:ss'));
  }, 1000);
};
