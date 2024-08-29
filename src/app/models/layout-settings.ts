import { ActiveArea } from '../enums/active-areas';
import { SidebarState } from '../enums/sidebar-state';

export interface ILayoutSettings {
    activeArea?: ActiveArea;
    sidebarState?: SidebarState;
}
