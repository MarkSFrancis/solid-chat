import { splitProps, ValidComponent } from 'solid-js';
import { Button, ButtonProps } from './button';
import RotateCwIcon from 'lucide-solid/icons/rotate-cw';
import { UIComponentProps } from '~/utils/ui-component';

type RetryButtonOptions = {
  onClick: () => unknown;
};

export type RetryButtonProps<T extends ValidComponent = 'button'> =
  UIComponentProps<'button', ButtonProps<T>, RetryButtonOptions>;

export function RetryButton(props: RetryButtonProps) {
  const [options, buttonProps] = splitProps(props, [
    'onClick',
    'icon',
    'children',
  ]);

  return (
    <Button
      onClick={() => void options.onClick()}
      icon={options.icon ?? RotateCwIcon}
      {...(buttonProps as ButtonProps)}
    >
      {options.children ?? 'Try again'}
    </Button>
  );
}
