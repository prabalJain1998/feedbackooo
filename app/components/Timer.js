import { useState, useEffect } from 'react';

function Timer({ remainingTime, onComplete }) {
  const [seconds, setSeconds] = useState(Math.floor((remainingTime - Date.now()) / 1000));
 
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (seconds > 0) {
        setSeconds(prevSeconds => prevSeconds - 1);
      } else {
        clearInterval(intervalId);
        onComplete(); // Callback function to execute when timer completes
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [seconds, onComplete]);

  return (
    <div>
      <p>Time Remaining: {seconds} seconds</p>
    </div>
  );
}

export default Timer;
