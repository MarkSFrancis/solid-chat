import {
  Collapsible as KobalteCollapsible,
  CollapsibleTriggerProps as KobalteCollapsibleTriggerProps,
  CollapsibleContentProps as KobalteCollapsibleContentProps,
} from '@kobalte/core/Collapsible';
import { ParentProps, splitProps, ValidComponent } from 'solid-js';
import { cn } from '~/utils/cn';
import { UIComponentProps } from '~/utils/ui-component';
import ChevronDownIcon from 'lucide-solid/icons/chevron-down';

export const Collapsible = KobalteCollapsible;

export type CollapsibleTriggerProps<T extends ValidComponent = 'li'> =
  UIComponentProps<
    T,
    KobalteCollapsibleTriggerProps<T>,
    ParentProps<{
      class?: string;
    }>
  >;

export function CollapsibleTrigger<T extends ValidComponent = 'div'>(
  props: CollapsibleTriggerProps<T>
) {
  const [options, kobalteProps] = splitProps(props, ['class', 'children']);

  return (
    <KobalteCollapsible.Trigger
      {...(kobalteProps as KobalteCollapsibleTriggerProps)}
      class={cn('group', options.class)}
    >
      {options.children}
      <ChevronDownIcon class="inline-block self-center h-4 w-4 motion-safe:transition-transform motion-safe:group-data-expanded:rotate-180" />
    </KobalteCollapsible.Trigger>
  );
}

type CollapsibleContentOptions = ParentProps<{
  class?: string;
}>;

type CollapsibleContentProps<T extends ValidComponent = 'div'> =
  UIComponentProps<
    T,
    KobalteCollapsibleContentProps<T>,
    CollapsibleContentOptions
  >;

export function CollapsibleContent<T extends ValidComponent = 'div'>(
  props: CollapsibleContentProps<T>
) {
  const [options, kobalteProps] = splitProps(props, ['class', 'children']);

  return (
    <KobalteCollapsible.Content
      {...(kobalteProps as KobalteCollapsibleContentProps)}
      class={cn(
        'border rounded overflow-hidden animate-[collapsible-up_100ms_ease-out] data-expanded:animate-[collapsible-down_100ms_ease-out]',
        options.class
      )}
    >
      {options.children}
    </KobalteCollapsible.Content>
  );
}
