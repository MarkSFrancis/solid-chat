import { createLink } from '@tanstack/solid-router';
import { splitProps, ValidComponent } from 'solid-js';
import { cn } from '~/utils/cn';
import ChevronRightIcon from 'lucide-solid/icons/chevron-right';
import { A, AProps } from './a';

export const ViewMoreLink = createLink(
  <T extends ValidComponent>(props: AProps<T>) => {
    const [options, aProps] = splitProps(props as AProps, [
      'class',
      'children',
    ]);

    return (
      <A {...aProps} class={cn('flex items-center', options.class)}>
        {options.children}
        <ChevronRightIcon class="w-4 h-4 inline-block ml-1 stroke-[1.5px]" />
      </A>
    );
  }
);
