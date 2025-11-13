import { cn } from '~/utils/cn';
import { ComponentProps, splitProps } from 'solid-js';

export function Center(props: ComponentProps<'div'>) {
  const [options, divProps] = splitProps(props, ['class']);

  return (
    <div
      {...divProps}
      class={cn(
        'h-full w-full flex grow items-center justify-center',
        options.class
      )}
    />
  );
}
