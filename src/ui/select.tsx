import {
  Select as KobalteSelect,
  SelectItemProps as KobalteSelectItemProps,
  SelectTriggerProps as KobalteSelectTriggerProps,
  SelectContentProps as KobalteSelectContentProps,
  SelectPortalProps as KobalteSelectPortalProps,
  SelectListboxProps as KobalteSelectListboxProps,
} from '@kobalte/core/select';
import ChevronsUpDownIcon from 'lucide-solid/icons/chevrons-up-down';
import CheckIcon from 'lucide-solid/icons/check';
import { cn } from '~/utils/cn';
import { splitProps, ValidComponent } from 'solid-js';
import { UIComponentProps } from '~/utils/ui-component';

export const Select = KobalteSelect;
export const SelectItemLabel = KobalteSelect.ItemLabel;
export const SelectValue = KobalteSelect.Value;

export type SelectItemProps<T extends ValidComponent = 'li'> = UIComponentProps<
  T,
  KobalteSelectItemProps<T>,
  {
    class?: string;
  }
>;

export function SelectItem<T extends ValidComponent = 'li'>(
  props: SelectItemProps<T>
) {
  const [options, itemProps] = splitProps(props as SelectItemProps, ['class']);

  return (
    <KobalteSelect.Item
      {...itemProps}
      class={cn(
        'flex gap-1 justify-between items-center py-2 px-3',
        'hover:bg-gray-100 focus-within:bg-gray-100',
        options.class
      )}
    >
      {props.children}
      <KobalteSelect.ItemIndicator class="text-indigo-500/80">
        <CheckIcon class="h-4 w-4" />
      </KobalteSelect.ItemIndicator>
    </KobalteSelect.Item>
  );
}

export type SelectTriggerProps<T extends ValidComponent = 'button'> =
  UIComponentProps<
    T,
    KobalteSelectTriggerProps<T>,
    {
      class?: string;
    }
  >;

export function SelectTrigger<T extends ValidComponent = 'button'>(
  props: SelectTriggerProps<T>
) {
  const [options, itemProps] = splitProps(props as SelectTriggerProps, [
    'class',
  ]);

  return (
    <KobalteSelect.Trigger
      {...itemProps}
      class={cn(
        'flex gap-1 p-1.5 px-4 rounded-full hover:bg-gray-100 focus-within:bg-gray-100',
        options.class
      )}
    >
      {props.children}
      <KobalteSelect.Icon class="self-center">
        <ChevronsUpDownIcon class="h-4 w-4" />
      </KobalteSelect.Icon>
    </KobalteSelect.Trigger>
  );
}

export function SelectContent<T extends ValidComponent = 'div'>(
  props: KobalteSelectPortalProps & KobalteSelectContentProps<T>
) {
  const [portalProps, contentProps] = splitProps(props, [
    'mount',
    'useShadow',
    'isSVG',
  ]);

  return (
    <KobalteSelect.Portal {...portalProps}>
      <KobalteSelect.Content {...(contentProps as KobalteSelectContentProps)} />
    </KobalteSelect.Portal>
  );
}

export type SelectListboxProps<
  Option = unknown,
  OptGroup = never,
  T extends ValidComponent = 'ul',
> = UIComponentProps<
  T,
  KobalteSelectListboxProps<Option, OptGroup, T>,
  {
    class?: string;
  }
>;

export function SelectListbox<
  Option = unknown,
  OptGroup = never,
  T extends ValidComponent = 'ul',
>(props: SelectListboxProps<Option, OptGroup, T>) {
  const [options, listboxProps] = splitProps(props as SelectListboxProps, [
    'class',
  ]);

  return (
    <KobalteSelect.Listbox
      {...listboxProps}
      class={cn('bg-white z-10 shadow-lg border p-1 rounded-md', options.class)}
    />
  );
}
