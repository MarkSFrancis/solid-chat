import {
  SegmentedControl as KobalteSegmentedControl,
  SegmentedControlRootProps as KobalteSegmentedControlProps,
  SegmentedControlItemProps as KobalteSegmentedControlItemProps,
} from '@kobalte/core/segmented-control';
import { splitProps, ValidComponent } from 'solid-js';
import { cn } from '~/utils/cn';
import { UIComponentProps } from '~/utils/ui-component';

type ToggleIconButtonOptions = {
  'aria-label': string;
  class?: string;
};

export type ToggleIconButtonProps<T extends ValidComponent = 'div'> =
  UIComponentProps<
    T,
    KobalteSegmentedControlItemProps<T>,
    ToggleIconButtonOptions
  >;

export function ToggleIconButton<T extends ValidComponent = 'div'>(
  props: ToggleIconButtonProps<T>
) {
  const [options, itemProps] = splitProps(props as ToggleIconButtonProps, [
    'class',
    'aria-label',
  ]);

  return (
    <KobalteSegmentedControl.Item {...itemProps} class="group">
      <KobalteSegmentedControl.ItemInput />
      <KobalteSegmentedControl.ItemControl
        class={cn(
          'rounded-sm p-2',
          'text-gray-600 data-checked:text-indigo-500',
          'border border-transparent -m-px hover:border-border data-checked:border-border',
          'hover:bg-gray-50 data-checked:bg-white',
          'group-focus-within:ring',
          'group-focus-within:shadow-md',
          options.class
        )}
      >
        {itemProps.children}
      </KobalteSegmentedControl.ItemControl>
    </KobalteSegmentedControl.Item>
  );
}

type ToggleButtonsOptions = {
  class?: string;
};

export type ToggleButtonsProps<T extends ValidComponent = 'div'> =
  UIComponentProps<T, KobalteSegmentedControlProps, ToggleButtonsOptions>;

/**
 * A set of two-state buttons that can be toggled on (selected) or off (not selected).
 *
 * **Note:** This component is not intended for use as a form `input`. If you need radio buttons for forms, consider using `SegmentedControl` instead.
 *
 * @example
 * ```tsx
 * <ToggleButtons defaultValue="bold">
 *   <ToggleIconButton value="bold" aria-label="Bold">
 *     <BoldIcon/>
 *   </ToggleIconButton>
 *   <ToggleIconButton value="italic" aria-label="Italic">
 *     <ItalicIcon/>
 *   </ToggleIconButton>
 *   <ToggleIconButton value="underline" aria-label="Underline">
 *     <UnderlineIcon/>
 *   </ToggleIconButton>
 * </ToggleButtons>
 * ```
 * @see https://kobalte.dev/docs/core/components/toggle-group
 */
export function ToggleButtons<T extends ValidComponent = 'div'>(
  props: ToggleButtonsProps<T>
) {
  const [options, groupProps] = splitProps(props as ToggleButtonsProps, [
    'class',
  ]);

  return (
    <KobalteSegmentedControl
      {...groupProps}
      class={cn(
        'rounded-sm border flex flex-row gap-px bg-gray-100',
        options.class
      )}
    />
  );
}
