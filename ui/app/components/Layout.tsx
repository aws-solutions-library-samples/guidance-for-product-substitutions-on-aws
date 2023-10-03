'use client';

import { useEffect, useState, PropsWithChildren } from 'react';
import { SideNav } from './SideNav';
import '@cloudscape-design/global-styles/index.css';
import { Amplify } from 'aws-amplify';
import AppLayout from '@cloudscape-design/components/app-layout';
import Spinner from '@cloudscape-design/components/spinner';

export const Layout = (props: PropsWithChildren) => {
  const { children } = props;
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch('/config.json')
      .then((res) => res.json())
      .then((config) => {
        Amplify.configure(config);
        setIsLoading(false);
      });
  }, []);
  return isLoading ? (
    <Spinner size="large" />
  ) : (
    <AppLayout navigation={<SideNav />} content={children} toolsHide={true} />
  );
};
