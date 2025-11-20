import { ParentProps } from 'solid-js';
import { SideNavigation } from '~/features/navigation/side-navigation';

export function DashboardLayout(props: ParentProps) {
  return (
    <div class="min-h-screen flex gap-4">
      <SideNavigation />
      <div class="flex-1 overflow-auto max-h-screen">{props.children}</div>
    </div>
  );
}
