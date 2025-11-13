import { cn } from '~/utils/cn';
import LoaderIcon from 'lucide-solid/icons/loader-2';
import { splitProps } from 'solid-js';
import { LucideProps } from 'lucide-solid';

export function Loading(props: LucideProps) {
  const [options, svgProps] = splitProps(props, ['class']);

  return (
    <>
      <LoaderIcon
        {...svgProps}
        class={cn(
          'motion-reduce:hidden fade-in h-6 w-6 animate-spin text-indigo-400',
          options.class
        )}
      />
      <span class="hidden motion-reduce:block">Loading...</span>
    </>
  );
}
