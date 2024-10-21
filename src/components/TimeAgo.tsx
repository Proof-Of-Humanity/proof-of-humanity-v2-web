import cn from 'classnames';
import { useMemo } from 'react';
import { timeAgo } from 'utils/time';

interface TimeAgoProps {
  className?: string;
  time: number;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ className, time }) => (
  <span
    className={cn('w-fit cursor-help', className)}
    title={useMemo(() => new Date(time * 1000).toLocaleString(), [time])}
  >
    {timeAgo(time)}
  </span>
);

export default TimeAgo;
