import { createMemo } from 'solid-js';
import { cn } from '~/utils/cn';

export function Avatar(props: { class?: string; username: string }) {
  const acronym = createMemo(() => {
    return props.username
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  });

  return (
    <svg
      class={cn('w-7 h-7 stroke-[1.5px]', props.class)}
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="45" fill="oklch(0.906898 0.0313221 236.915)" />
      <text
        x="50%"
        y="65%"
        text-anchor="middle"
        font-size="36"
        fill="rgb(54, 54, 68)"
      >
        <tspan>{acronym()}</tspan>
      </text>
    </svg>
  );
}
