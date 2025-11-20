import {
  Component,
  ComponentProps,
  mergeProps,
  ParentProps,
  Show,
  splitProps,
  ValidComponent,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import {
  Button as KobalteButton,
  ButtonRootProps as KobalteButtonProps,
} from '@kobalte/core/button';
import { cn } from '~/utils/cn';
import { UIComponentProps } from '~/utils/ui-component';
import { Loading } from './loading-spinner';
import { createLink } from '@tanstack/solid-router';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type ButtonOptions = ParentProps<
  {
    /** @default 'primary' */
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
    isLoading?: boolean;
    class?: string;
  } & (
    | {
        /** @default 'with-text' */
        variantStyle?: 'with-text';
        icon?: Component<ComponentProps<'svg'>>;
      }
    | {
        variantStyle: 'icon-only';
        icon: Component<ComponentProps<'svg'>>;
        'aria-label': string;
      }
  )
>;

export type ButtonProps<T extends ValidComponent = 'button'> = UIComponentProps<
  'button',
  KobalteButtonProps<T>,
  ButtonOptions
>;

export function Button<T extends ValidComponent = 'button'>(
  props: ButtonProps<T>
) {
  const [optionProps, buttonProps] = splitProps(props as ButtonProps, [
    'aria-label',
    'disabled',
    'isLoading',
    'icon',
    'variant',
    'children',
    'class',
    'variantStyle',
  ]);

  const options = mergeProps(
    {
      variant: 'primary',
      variantStyle: 'with-text',
    } satisfies Partial<ButtonOptions>,
    optionProps
  );

  return (
    <Show
      when={options.variantStyle === 'icon-only' && options['aria-label']}
      fallback={
        <KobalteButton
          {...buttonProps}
          disabled={options.disabled || options.isLoading}
          class={cn(
            'flex items-center justify-center gap-1.5 rounded-full text-sm disabled:opacity-50 group',
            'cursor-pointer disabled:cursor-not-allowed',
            options.variantStyle === 'icon-only' ? 'p-2' : 'px-3 py-2',
            options.variant === 'primary' &&
              'bg-indigo-500 text-white enabled:hover:bg-indigo-600',
            options.variant === 'secondary' &&
              'bg-gray-100 enabled:hover:bg-gray-200 text-primary/90',
            options.variant === 'ghost' &&
              'enabled:hover:bg-gray-100 text-primary/90',
            options.class
          )}
        >
          {options.isLoading ? (
            <Loading class="h-4 w-4" />
          ) : (
            options.icon && (
              <Dynamic
                component={options.icon}
                class={cn(
                  'h-4 w-4',
                  options.variant === 'secondary' &&
                    'group-hover:stroke-indigo-500',
                  options.variant === 'ghost' && 'group-hover:stroke-indigo-500'
                )}
              />
            )
          )}
          {options.children}
        </KobalteButton>
      }
    >
      <Tooltip>
        <TooltipTrigger
          {...buttonProps}
          aria-label={options['aria-label']}
          disabled={options.disabled || options.isLoading}
          class={cn(
            'flex items-center gap-1.5 rounded-full text-sm disabled:opacity-50 group',
            'cursor-pointer disabled:cursor-not-allowed',
            options.variantStyle === 'icon-only' ? 'p-2' : 'px-3 py-2',
            options.variant === 'primary' &&
              'bg-indigo-500 text-white enabled:hover:bg-indigo-600',
            options.variant === 'secondary' &&
              'bg-gray-100 enabled:hover:bg-gray-200 text-primary/90',
            options.variant === 'ghost' &&
              'enabled:hover:bg-gray-100 text-primary/90',
            options.class
          )}
        >
          {options.isLoading ? (
            <Loading />
          ) : (
            options.icon && (
              <Dynamic
                component={options.icon}
                class={cn(
                  'h-4 w-4',
                  options.variant === 'secondary' &&
                    'group-hover:stroke-indigo-500',
                  options.variant === 'ghost' && 'group-hover:stroke-indigo-500'
                )}
              />
            )
          )}
          {options.children}
        </TooltipTrigger>
        <TooltipContent>{options['aria-label']}</TooltipContent>
      </Tooltip>
    </Show>
  );
}

const ButtonLinkInner = (props: ButtonProps<'a'>) => {
  return <Button as="a" {...props} />;
};

export const ButtonLink = createLink(ButtonLinkInner);
