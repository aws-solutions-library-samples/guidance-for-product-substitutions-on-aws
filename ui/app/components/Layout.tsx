'use client';

import { PropsWithChildren } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import { SideNav } from './SideNav';

export const Layout = (props: PropsWithChildren) => {
  const { children } = props;
  return <AppLayout navigation={<SideNav />} content={children} />;
};
