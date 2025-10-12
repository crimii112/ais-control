import { useEffect, useState } from 'react';
import moment from 'moment';

import useInterval from '@/hooks/useInterval';

const Timer = ({ defaultSeconds, clickedTime }) => {
  const [time, setTime] = useState(null);
  const [closedTime, setClosedTime] = useState();

  useEffect(() => {
    if (defaultSeconds === 300) {
      const temp = clickedTime.set({
        minute:
          clickedTime.minute() % 5 === 0
            ? clickedTime.minute() + 5
            : Math.ceil(clickedTime.minute() / 5) * 5,
        second: 0,
        millisecond: 0,
      });
      // console.log(moment(temp));
      setClosedTime(moment(temp));
    } else if (defaultSeconds === 600) {
      const temp = clickedTime.set({
        minute:
          clickedTime.minute() % 10 === 0
            ? clickedTime.minute() + 10
            : Math.ceil(clickedTime.minute() / 10) * 10,
        second: 0,
        millisecond: 0,
      });
      // console.log(moment(temp));
      setClosedTime(moment(temp));
    } else if (defaultSeconds === 3600) {
      const temp = clickedTime
        .add(1, 'hours')
        .set({ minute: 0, second: 0, millisecond: 0 });
      // console.log(moment(temp));
      setClosedTime(moment(temp));
    }
  }, [defaultSeconds, clickedTime]);

  useInterval(() => {
    if (time <= 0) setTime(null);
    const currentTime = moment();
    const diff = moment.duration(closedTime.diff(currentTime)).asSeconds();

    setTime(Math.floor(diff));
  }, 1000);

  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (time % 60 === 0 ? '00' : time % 60)
    .toString()
    .padStart(2, '0');
  const formattedTime = minutes + ':' + seconds;
  
  return (<span>{formattedTime}</span>);
};

export default Timer;
