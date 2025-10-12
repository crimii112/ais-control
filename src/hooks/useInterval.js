import { useEffect, useRef } from 'react';

const useInterval = (callback, delay) => {
  const savedCallback = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  });
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
};

export default useInterval;
