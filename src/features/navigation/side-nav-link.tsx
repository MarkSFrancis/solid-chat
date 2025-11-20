import { Component, ParentProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { cn } from '~/utils/cn';

interface SideNavLinkProps extends ParentProps {
  isActive: boolean;
  icon?: Component<{ class?: string }>;
}

export const SideNavLinkContent = (props: SideNavLinkProps) => {
  return (
    <div
      class={cn(
        'p-2 flex gap-2 rounded-md',
        props.isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      )}
    >
      {props.icon ? <Dynamic component={props.icon} class="stroke-1" /> : null}
      <span class="align-middle">{props.children}</span>
    </div>
  );
};
