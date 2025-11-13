import {
  DropdownMenuContentProps as KobalteDropdownMenuContentProps,
  DropdownMenuSubContentProps as KobalteDropdownMenuSubContentProps,
  DropdownMenuPortalProps as KobalteDropdownMenuPortalProps,
  DropdownMenu as KobalteDropdownMenu,
  DropdownMenuRootProps as KobalteDropdownMenuRootProps,
  DropdownMenuTriggerProps as KobalteDropdownMenuTriggerProps,
  DropdownMenuItemProps as KobalteDropdownMenuItemProps,
  DropdownMenuSubTriggerProps as KobalteDropdownMenuSubTriggerProps,
  DropdownMenuCheckboxItemProps as KobalteDropdownMenuCheckboxItemProps,
  DropdownMenuGroupLabelProps as KobalteDropdownMenuGroupLabelProps,
  DropdownMenuRadioItemProps as KobalteDropdownMenuRadioItemProps,
} from '@kobalte/core/dropdown-menu';
import {
  Accessor,
  Component,
  ComponentProps,
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  onCleanup,
  onMount,
  ParentProps,
  splitProps,
  useContext,
  ValidComponent,
} from 'solid-js';
import ChevronDownIcon from 'lucide-solid/icons/chevron-down';
import ChevronRightIcon from 'lucide-solid/icons/chevron-right';
import CheckIcon from 'lucide-solid/icons/check';
import DotIcon from 'lucide-solid/icons/dot';
import { UIComponentProps } from '~/utils/ui-component';
import { Button } from './button';
import { cn } from '~/utils/cn';
import { createLink } from '@tanstack/solid-router';
import { Dynamic } from 'solid-js/web';

const itemClass = (options: { hasGutter?: boolean }) =>
  cn(
    'group',
    'flex gap-1 relative items-center py-2 px-3 cursor-pointer',
    options.hasGutter && 'pl-6',
    'hover:bg-gray-100 focus-within:bg-gray-100',
    'disabled:opacity-50 aria-disabled:opacity-50',
    'disabled:pointer-events-none aria-disabled:pointer-events-none'
  );

const DropdownMenuItemsContext = createContext<{
  hasGutter: Accessor<boolean | undefined>;
  registerGutterComponent: (id: string) => () => void;
}>();

const DropdownMenuItemsProvider = (props: ParentProps) => {
  /**
   * If a radio or checkbox item is registered, we add gutter space to all items in the menu, so that they all remain inline
   */
  const [radioOrCheckboxComponents, setRadioOrCheckboxComponents] =
    createSignal<string[]>([]);

  const registerRadioOrCheckboxComponent = (id: string) => {
    setRadioOrCheckboxComponents((components) => [...components, id]);

    return () => {
      setRadioOrCheckboxComponents((components) =>
        components.filter((componentId) => componentId !== id)
      );
    };
  };

  const hasRadioOrCheckbox = createMemo(() => {
    return radioOrCheckboxComponents().length > 0;
  });

  return (
    <DropdownMenuItemsContext.Provider
      value={{
        hasGutter: hasRadioOrCheckbox,
        registerGutterComponent: registerRadioOrCheckboxComponent,
      }}
    >
      {props.children}
    </DropdownMenuItemsContext.Provider>
  );
};

const useDropdownMenuItemsContext = () => {
  const ctx = useContext(DropdownMenuItemsContext);
  if (!ctx) {
    throw new Error(
      'DropdownMenu components must be used within a DropdownMenu'
    );
  }

  return ctx;
};

/**
 * Create a dropdown menu, where each button may perform an action or navigate to a link. Useful for actions grouped under a common trigger (e.g. "Edit" -> "Copy" / "Paste").
 *
 * For form inputs, you should consider simpler alternatives like `Select` instead, as these work better with the browser's autofill.
 * @example
 * ```tsx
 * function MyMenu() {
 *   const [showGitLog, setShowGitLog] = createSignal(true);
 *   const [showHistory, setShowHistory] = createSignal(false);
 *   const [branch, setBranch] = createSignal('main');
 *
 *   return (
 *     <DropdownMenu>
 *       <DropdownMenuTrigger variant="secondary" class="self-start">
 *         Git Settings
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent>
 *         <DropdownMenuItem>
 *           Commit <div>⌘+K</div>
 *         </DropdownMenuItem>
 *         <DropdownMenuItem>
 *           Push <div>⇧+⌘+K</div>
 *         </DropdownMenuItem>
 *         <DropdownMenuItem disabled>
 *           Update Project <div>⌘+T</div>
 *         </DropdownMenuItem>
 *         <DropdownMenuSub>
 *           <DropdownMenuSubTrigger>GitHub</DropdownMenuSubTrigger>
 *           <DropdownMenuSubContent>
 *             <DropdownMenuItem>Create Pull Request…</DropdownMenuItem>
 *             <DropdownMenuItem>View Pull Requests</DropdownMenuItem>
 *             <DropdownMenuItem>Sync Fork</DropdownMenuItem>
 *             <DropdownMenuSeparator />
 *             <DropdownMenuItem>Open on GitHub</DropdownMenuItem>
 *           </DropdownMenuSubContent>
 *         </DropdownMenuSub>
 *         <DropdownMenuSeparator />
 *         <DropdownMenuCheckboxItem
 *           checked={showGitLog()}
 *           onChange={setShowGitLog}
 *         >
 *           Show Git Log
 *         </DropdownMenuCheckboxItem>
 *         <DropdownMenuCheckboxItem
 *           checked={showHistory()}
 *           onChange={setShowHistory}
 *         >
 *           Show History
 *         </DropdownMenuCheckboxItem>
 *         <DropdownMenuSeparator />
 *         <DropdownMenuGroup>
 *           <DropdownMenuGroupLabel>Branches</DropdownMenuGroupLabel>
 *           <DropdownMenuRadioGroup value={branch()} onChange={setBranch}>
 *             <DropdownMenuRadioItem value="main">main</DropdownMenuRadioItem>
 *             <DropdownMenuRadioItem value="develop">
 *               develop
 *             </DropdownMenuRadioItem>
 *           </DropdownMenuRadioGroup>
 *         </DropdownMenuGroup>
 *         <DropdownMenuSeparator />
 *         <DropdownMenuItemLink to="/repo/$id/settings" params={{ id: 'example-repo' }}>
 *           Project settings
 *         </DropdownMenuItemLink>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   );
 * }
 * ```
 */
export const DropdownMenu =
  KobalteDropdownMenu as Component<KobalteDropdownMenuRootProps>;

type DropdownMenuTriggerOptions = ParentProps<{
  class?: string;
  hideChevron?: boolean;
}>;
type DropdownMenuTriggerProps<T extends ValidComponent = typeof Button> =
  UIComponentProps<
    T,
    KobalteDropdownMenuTriggerProps<T>,
    DropdownMenuTriggerOptions
  >;

export function DropdownMenuTrigger<T extends ValidComponent = typeof Button>(
  props: DropdownMenuTriggerProps<T>
) {
  const [options, definedTriggerProps] = splitProps(
    props as DropdownMenuTriggerProps,
    ['class', 'children', 'hideChevron']
  );

  const triggerProps = mergeProps(
    {
      as: Button,
    } satisfies Partial<DropdownMenuTriggerProps>,
    definedTriggerProps
  );

  return (
    <KobalteDropdownMenu.Trigger<typeof Button>
      {...triggerProps}
      class={cn('flex items-center', options.class)}
    >
      {options.children}
      {props.hideChevron ? null : (
        <KobalteDropdownMenu.Icon class="transition-transform duration-200 data-expanded:rotate-180">
          <ChevronDownIcon class="h-4 w-4" />
        </KobalteDropdownMenu.Icon>
      )}
    </KobalteDropdownMenu.Trigger>
  );
}

type DropdownMenuContentOptions = ParentProps<{
  class?: string;
  hideArrow?: boolean;
}>;

type DropdownMenuContentProps<T extends ValidComponent = 'div'> =
  UIComponentProps<
    T,
    KobalteDropdownMenuPortalProps & KobalteDropdownMenuContentProps<T>,
    DropdownMenuContentOptions
  >;

export function DropdownMenuContent<T extends ValidComponent = 'div'>(
  props: DropdownMenuContentProps<T>
) {
  const [options, kobalteProps] = splitProps(props, [
    'class',
    'children',
    'hideArrow',
  ]);

  const [portalProps, contentProps] = splitProps(kobalteProps, [
    'mount',
    'useShadow',
    'isSVG',
  ]);

  return (
    <KobalteDropdownMenu.Portal {...portalProps}>
      <DropdownMenuItemsProvider>
        <KobalteDropdownMenu.Content
          {...(contentProps as KobalteDropdownMenuContentProps)}
          class={cn(
            'bg-white z-10 shadow-lg border p-1 rounded-md',
            options.class
          )}
        >
          {props.hideArrow ? null : <KobalteDropdownMenu.Arrow />}
          {options.children}
        </KobalteDropdownMenu.Content>
      </DropdownMenuItemsProvider>
    </KobalteDropdownMenu.Portal>
  );
}

export const DropdownMenuSeparator = KobalteDropdownMenu.Separator;
export const DropdownMenuSub = KobalteDropdownMenu.Sub;

type DropdownMenuSubTriggerOptions = ParentProps<{ class?: string }>;
type DropdownMenuSubTriggerProps<T extends ValidComponent = 'button'> =
  UIComponentProps<
    T,
    KobalteDropdownMenuSubTriggerProps<T>,
    DropdownMenuSubTriggerOptions
  >;

export function DropdownMenuSubTrigger<T extends ValidComponent = 'button'>(
  props: DropdownMenuSubTriggerProps<T>
) {
  const [options, triggerProps] = splitProps(
    props as DropdownMenuSubTriggerProps,
    ['class', 'children']
  );

  const context = useDropdownMenuItemsContext();

  return (
    <KobalteDropdownMenu.SubTrigger
      {...triggerProps}
      class={cn(itemClass({ hasGutter: context.hasGutter() }), options.class)}
    >
      {options.children}
      <KobalteDropdownMenu.Icon>
        <ChevronRightIcon class="h-4 w-4" />
      </KobalteDropdownMenu.Icon>
    </KobalteDropdownMenu.SubTrigger>
  );
}

type DropdownMenuSubContentOptions = ParentProps<{
  class?: string;
}>;

type DropdownMenuSubContentProps<T extends ValidComponent = 'div'> =
  UIComponentProps<
    T,
    KobalteDropdownMenuPortalProps & KobalteDropdownMenuSubContentProps<T>,
    DropdownMenuSubContentOptions
  >;

export function DropdownMenuSubContent<T extends ValidComponent = 'div'>(
  props: DropdownMenuSubContentProps<T>
) {
  const [options, kobalteProps] = splitProps(props, ['class', 'children']);

  const [portalProps, contentProps] = splitProps(kobalteProps, [
    'mount',
    'useShadow',
    'isSVG',
  ]);

  return (
    <KobalteDropdownMenu.Portal {...portalProps}>
      <DropdownMenuItemsProvider>
        <KobalteDropdownMenu.SubContent
          {...(contentProps as KobalteDropdownMenuContentProps)}
          class={cn(
            'bg-white z-10 shadow-lg border p-1 rounded-md',
            options.class
          )}
        >
          {options.children}
        </KobalteDropdownMenu.SubContent>
      </DropdownMenuItemsProvider>
    </KobalteDropdownMenu.Portal>
  );
}

type DropdownMenuItemProps<T extends ValidComponent = 'li'> = UIComponentProps<
  T,
  KobalteDropdownMenuItemProps<T>,
  {
    class?: string;
    icon?: Component<ComponentProps<'svg'>>;
  }
>;

export function DropdownMenuItem<T extends ValidComponent = 'li'>(
  props: DropdownMenuItemProps<T>
) {
  const [options, itemProps] = splitProps(props as DropdownMenuItemProps, [
    'class',
    'children',
    'icon',
  ]);

  const context = useDropdownMenuItemsContext();

  return (
    <KobalteDropdownMenu.Item
      {...itemProps}
      class={cn(itemClass({ hasGutter: context.hasGutter() }), options.class)}
    >
      {options.icon ? (
        <Dynamic
          component={options.icon}
          class="h-3 w-3 mr-1 text-primary/70 group-hover:text-indigo-500"
        />
      ) : null}
      {options.children}
      <KobalteDropdownMenu.ItemIndicator class="left-0 text-indigo-500/80">
        <CheckIcon class="h-4 w-4" />
      </KobalteDropdownMenu.ItemIndicator>
    </KobalteDropdownMenu.Item>
  );
}

export const DropdownMenuItemLink = createLink(
  (props: Omit<ComponentProps<typeof DropdownMenuItem<'a'>>, 'as'>) => {
    return <DropdownMenuItem as="a" {...props} />;
  }
);

type DropdownMenuCheckboxItemProps<T extends ValidComponent = 'li'> =
  UIComponentProps<
    T,
    KobalteDropdownMenuCheckboxItemProps<T>,
    ParentProps<{
      class?: string;
    }>
  >;

export function DropdownMenuCheckboxItem<T extends ValidComponent = 'li'>(
  props: DropdownMenuCheckboxItemProps<T>
) {
  const [options, itemProps] = splitProps(
    props as DropdownMenuCheckboxItemProps,
    ['class', 'children']
  );

  const context = useDropdownMenuItemsContext();
  const id = createUniqueId();

  onMount(() => {
    const unregister = context.registerGutterComponent(id);

    onCleanup(() => {
      unregister();
    });
  });

  return (
    <KobalteDropdownMenu.CheckboxItem
      {...itemProps}
      class={cn(itemClass({ hasGutter: context.hasGutter() }), options.class)}
    >
      <KobalteDropdownMenu.ItemIndicator class="absolute left-1 text-indigo-500/80">
        <CheckIcon class="h-4 w-4" />
      </KobalteDropdownMenu.ItemIndicator>
      {options.children}
    </KobalteDropdownMenu.CheckboxItem>
  );
}

export const DropdownMenuGroup = KobalteDropdownMenu.Group;

type DropdownMenuGroupLabelProps<T extends ValidComponent = 'span'> =
  UIComponentProps<
    T,
    KobalteDropdownMenuGroupLabelProps<T>,
    ParentProps<{
      class?: string;
    }>
  >;

export function DropdownMenuGroupLabel<T extends ValidComponent = 'span'>(
  props: DropdownMenuGroupLabelProps<T>
) {
  const [options, labelProps] = splitProps(
    props as DropdownMenuGroupLabelProps,
    ['class', 'children']
  );

  return (
    <KobalteDropdownMenu.GroupLabel
      {...labelProps}
      class={cn('text-primary/50 pr-3 pl-6 text-sm leading-8', options.class)}
    >
      {options.children}
    </KobalteDropdownMenu.GroupLabel>
  );
}

export const DropdownMenuRadioGroup = KobalteDropdownMenu.RadioGroup;

type DropdownMenuRadioItemProps<T extends ValidComponent = 'li'> =
  UIComponentProps<
    T,
    KobalteDropdownMenuRadioItemProps<T>,
    ParentProps<{
      class?: string;
    }>
  >;

export function DropdownMenuRadioItem<T extends ValidComponent = 'li'>(
  props: DropdownMenuRadioItemProps<T>
) {
  const [options, itemProps] = splitProps(props as DropdownMenuRadioItemProps, [
    'class',
    'children',
  ]);

  const context = useDropdownMenuItemsContext();
  const id = createUniqueId();

  onMount(() => {
    const unregister = context.registerGutterComponent(id);

    onCleanup(() => {
      unregister();
    });
  });

  return (
    <KobalteDropdownMenu.RadioItem
      {...itemProps}
      class={cn(itemClass({ hasGutter: context.hasGutter() }), options.class)}
    >
      <KobalteDropdownMenu.ItemIndicator class="absolute left-1 text-indigo-500/80">
        <DotIcon class="h-4 w-4" />
      </KobalteDropdownMenu.ItemIndicator>
      {options.children}
    </KobalteDropdownMenu.RadioItem>
  );
}
