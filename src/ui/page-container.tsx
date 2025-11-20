import { ComponentProps, splitProps } from 'solid-js';
import { cn } from '~/utils/cn';

export function PageContainer(props: ComponentProps<'div'>) {
  const [options, divProps] = splitProps(props, ['class']);

  return (
    <div class={cn('max-w-[968px] mx-auto', options.class)} {...divProps} />
  );
}
