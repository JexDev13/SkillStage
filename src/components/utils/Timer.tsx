import React from 'react';

interface TimerProps {
  onTick?: (seconds: number) => void;
}

const Timer: React.FC<TimerProps> = ({ onTick }) => {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        const updated = prev + 1;
        if (onTick) onTick(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="font-mono text-lg tracking-widest">
      {formatTime(seconds)}
    </div>
  );
};

export default Timer;
