import { createLink } from '@tanstack/solid-router';
import { Component, ComponentProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

interface SideNavLinkProps extends ComponentProps<'a'> {
  icon: Component<{ class?: string }>;
}

export const SideNavLink = createLink((props: SideNavLinkProps) => {
  return (
    <a {...props}>
      <div class="p-2 flex gap-2 rounded-md bg-gray-100">
        <Dynamic component={props.icon} class="stroke-1" />
        <span class="align-middle">{props.children}</span>
      </div>
    </a>
  );
});
