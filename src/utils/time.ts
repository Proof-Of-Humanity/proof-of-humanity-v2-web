import { format } from 'timeago.js';

export const timeAgo = (s: number) => format(s * 1000);
