export type MenuItem = {
  path?: string;
  labelKey: string;
  icon: string;
  action?: 'logout';
};

export const sidebarMenu: MenuItem[] = [
  { path: '/', labelKey: 'pages.home', icon: 'house' },
  { path: '/grades', labelKey: 'menu.grades', icon: 'clipboard-check' },
  { path: '/assignments', labelKey: 'menu.assignments', icon: 'book' },
  { path: '/attendance', labelKey: 'menu.attendance', icon: 'calendar-check' },
  { path: '/notifications', labelKey: 'menu.notifications', icon: 'bell' },
  { path: '/report', labelKey: 'menu.report', icon: 'exclamation-circle' },
  { path: '/assistant', labelKey: 'menu.assistant', icon: 'robot' },
];

export const bottomMenu: MenuItem[] = [
  { path: '/settings', labelKey: 'menu.settings', icon: 'gear' },
  { labelKey: 'auth.logout', icon: 'box-arrow-right', action: 'logout' },
];