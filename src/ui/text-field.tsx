import {
  TextFieldLabelProps as KobalteTextFieldLabelProps,
  TextFieldInputProps as KobalteTextFieldInputProps,
  TextField as KobalteTextField,
  TextFieldRootProps as KobalteTextFieldRootProps,
  TextFieldTextAreaProps as KobalteTextFieldTextAreaProps,
  TextFieldDescriptionProps as KobalteTextFieldDescriptionProps,
  TextFieldErrorMessageProps as KobalteTextFieldErrorMessageProps,
} from '@kobalte/core/text-field';
import {
  Component,
  mergeProps,
  ParentProps,
  splitProps,
  ValidComponent,
} from 'solid-js';
import { UIComponentProps } from '~/utils/ui-component';
import { cn } from '~/utils/cn';

/**
 * A text input that allows users to input custom text entries with a keyboard.
 *
 * @example
 * ```tsx
 * <TextField>
 *   <TextField.Label />
 *   <TextField.Input /> (or <TextField.TextArea />)
 *   <TextField.Description />
 *   <TextField.ErrorMessage />
 * </TextField>
 * ```
 */
export function TextField<T extends ValidComponent = 'div'>(
  props: UIComponentProps<
    T,
    KobalteTextFieldRootProps<T>,
    ParentProps<{ class?: string }>
  >
) {
  const [options, rootProps] = splitProps(props, ['class', 'children']);

  return (
    <KobalteTextField
      {...(rootProps as KobalteTextFieldRootProps)}
      class={cn('flex flex-col gap-1', options.class)}
    >
      {options.children}
    </KobalteTextField>
  );
}

type TextFieldInputOptions = ParentProps<{
  class?: string;
}>;

type TextFieldInputProps<T extends ValidComponent = 'input'> = UIComponentProps<
  T,
  KobalteTextFieldInputProps<T>,
  TextFieldInputOptions
>;

export function TextFieldInput<T extends ValidComponent = 'input'>(
  props: TextFieldInputProps<T>
) {
  const [options, inputProps] = splitProps(props, ['class', 'children']);

  return (
    <KobalteTextField.Input
      {...(inputProps as KobalteTextFieldInputProps)}
      class={cn(
        'border p-1 rounded px-2',
        'data-invalid:text-destructive data-invalid:border-destructive',
        options.class
      )}
    >
      {options.children}
    </KobalteTextField.Input>
  );
}

type TextFieldTextAreaOptions = ParentProps<{ class?: string }>;
type TextFieldTextAreaProps<T extends ValidComponent = 'textarea'> =
  UIComponentProps<
    T,
    KobalteTextFieldTextAreaProps<T>,
    TextFieldTextAreaOptions
  >;

export function TextFieldTextArea<T extends ValidComponent = 'textarea'>(
  props: TextFieldTextAreaProps<T>
) {
  const [options, configuredProps] = splitProps(
    props as TextFieldTextAreaProps,
    ['class', 'children']
  );

  const textAreaProps = mergeProps<TextFieldTextAreaProps[]>(
    {
      autoResize: true,
    },
    configuredProps
  );

  return (
    <KobalteTextField.TextArea
      {...textAreaProps}
      class={cn(
        'border p-1 rounded px-2',
        'data-invalid:text-destructive data-invalid:border-destructive',
        options.class
      )}
    >
      {options.children}
    </KobalteTextField.TextArea>
  );
}

export function TextFieldLabel<T extends ValidComponent = 'label'>(
  props: KobalteTextFieldLabelProps<T>
) {
  return <KobalteTextField.Label {...(props as KobalteTextFieldLabelProps)} />;
}

type TextFieldDescriptionProps<T extends ValidComponent = 'div'> =
  UIComponentProps<
    T,
    KobalteTextFieldDescriptionProps<T>,
    ParentProps<{
      class?: string;
    }>
  >;

export function TextFieldDescription<T extends ValidComponent = 'div'>(
  props: TextFieldDescriptionProps<T>
) {
  const [options, itemProps] = splitProps(props, ['class', 'children']);

  return (
    <KobalteTextField.Description
      {...(itemProps as TextFieldDescriptionProps)}
      class={cn('text-primary/70 text-sm', options.class)}
    >
      {options.children}
    </KobalteTextField.Description>
  );
}

type TextFieldErrorMessageProps<T extends ValidComponent = 'div'> =
  UIComponentProps<
    T,
    KobalteTextFieldErrorMessageProps<T>,
    ParentProps<{
      class?: string;
    }>
  >;

export function TextFieldErrorMessage<T extends ValidComponent = 'div'>(
  props: TextFieldErrorMessageProps<T>
) {
  const [options, labelProps] = splitProps(
    props as TextFieldErrorMessageProps,
    ['class', 'children']
  );

  return (
    <KobalteTextField.ErrorMessage
      {...labelProps}
      class={cn('text-sm text-destructive', options.class)}
    >
      {options.children}
    </KobalteTextField.ErrorMessage>
  );
}
