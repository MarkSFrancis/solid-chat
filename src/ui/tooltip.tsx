import {
  Tooltip as KobalteTooltip,
  TooltipRootProps as KobalteTooltipRootProps,
  TooltipPortalProps as KobalteTooltipPortalProps,
  TooltipContentProps as KobalteTooltipContentProps,
} from '@kobalte/core/tooltip';
import { createLink } from '@tanstack/solid-router';
import {
  ComponentProps,
  ParentProps,
  splitProps,
  ValidComponent,
} from 'solid-js';
import { cn } from '~/utils/cn';
import { UIComponentProps } from '~/utils/ui-component';

export function Tooltip(props: KobalteTooltipRootProps) {
  return (
    <KobalteTooltip placement="top" openDelay={0} closeDelay={0} {...props} />
  );
}

export const TooltipTrigger = KobalteTooltip.Trigger;
export const TooltipTriggerLink = createLink(
  (props: Omit<ComponentProps<typeof TooltipTrigger<'a'>>, 'as'>) => {
    return <TooltipTrigger as="a" {...props} />;
  }
);

type TooltipContentOptions = ParentProps<{
  class?: string;
}>;

type TooltipContentProps<T extends ValidComponent = 'div'> = UIComponentProps<
  T,
  KobalteTooltipPortalProps & KobalteTooltipContentProps<T>,
  TooltipContentOptions
>;

export function TooltipContent<T extends ValidComponent = 'div'>(
  props: TooltipContentProps<T>
) {
  const [options, kobalteProps] = splitProps(props, ['class', 'children']);

  const [portalProps, contentProps] = splitProps(kobalteProps, [
    'mount',
    'useShadow',
    'isSVG',
  ]);

  return (
    <KobalteTooltip.Portal {...portalProps}>
      <KobalteTooltip.Content
        {...(contentProps as KobalteTooltipContentProps)}
        class={cn('bg-black text-white p-3 rounded-lg text-sm', options.class)}
      >
        <KobalteTooltip.Arrow />
        {options.children}
      </KobalteTooltip.Content>
    </KobalteTooltip.Portal>
  );
}
