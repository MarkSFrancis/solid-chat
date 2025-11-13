import { OverrideProps, PolymorphicProps } from '@kobalte/core/polymorphic';
import { ValidComponent } from 'solid-js';

/**
 * Create a UI component that wraps a base component with additional options.
 *
 * Useful when wrapping `Kobalte` components to add custom styling or functionality.
 * @template T - The base component type (e.g. `button`)
 * @template TProps - The base component type (e.g. `ButtonRootProps`)
 * @template TOptions - Your custom options - these should be any extra props you want to add to the base component which you use to configure / add extra functionality to the component. (e.g. `variant`, `isLoading`, etc.)
 */
export type UIComponentProps<
  T extends ValidComponent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TProps extends Partial<Record<any, any>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TOptions extends Partial<Record<any, any>>,
> = PolymorphicProps<T, OverrideProps<TProps, TOptions>>;
