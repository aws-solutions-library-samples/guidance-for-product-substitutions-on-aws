import '@cloudscape-design/global-styles/index.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';

export const SideNav = () => {
  const router = useRouter();
  const [activeHref, setActiveHref] = useState('/');
  return (
    <SideNavigation
      activeHref={activeHref}
      header={{ href: '/', text: 'Substitutions' }}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          router.push(event.detail.href);
          setActiveHref(event.detail.href);
        }
      }}
      items={[
        { type: 'link', text: 'Products', href: '/products' },
        { type: 'link', text: 'Substitute', href: '/substitute' },
        { type: 'link', text: 'Upload', href: '/upload' },
      ]}
    />
  );
};
