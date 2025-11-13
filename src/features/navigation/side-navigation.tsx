import HouseIcon from 'lucide-solid/icons/house';
import { SideNavLink } from './side-nav-link';

export function SideNavigation() {
  return (
    <nav class="h-screen self-stretch border-r w-54">
      <div class="p-4">
        <select>
          <option>Company select</option>
        </select>
      </div>
      <hr />
      <div class="p-4 flex flex-col gap-4">
        <SideNavLink icon={HouseIcon} to="/">
          Home
        </SideNavLink>
      </div>
    </nav>
  );
}
