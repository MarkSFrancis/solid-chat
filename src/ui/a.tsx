import { createLink } from '@tanstack/solid-router';
import {
  Link as KobalteLink,
  LinkRootProps as KobalteLinkRootProps,
} from '@kobalte/core/link';
import { ParentProps, splitProps, ValidComponent } from 'solid-js';
import { UIComponentProps } from '~/utils/ui-component';
import { cn } from '~/utils/cn';

type AOptions = ParentProps<{ class?: string }>;

export type AProps<T extends ValidComponent = 'a'> = UIComponentProps<
  T,
  KobalteLinkRootProps<T>,
  AOptions
>;

export function A<T extends ValidComponent>(props: AProps<T>) {
  const [options, aProps] = splitProps(props as AProps, ['class']);

  return (
    <KobalteLink
      {...aProps}
      class={cn('text-indigo-500 hover:underline', options.class)}
    />
  );
}

export const Link = createLink(A);
