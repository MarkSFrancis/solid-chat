import { ComponentProps } from 'solid-js';
import { cn } from '~/utils/cn';

export function Card(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      class={cn('border shadow-sm rounded-2xl border-gray-100', props.class)}
    />
  );
}

export function CardContent(props: ComponentProps<'div'>) {
  return <div {...props} class={cn('px-6', props.class)} />;
}
