'use client';

import { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Header from '@cloudscape-design/components/header';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import { Product } from '../../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [paginationKey, setPaginationKey] = useState();

  useEffect(() => {
    API.get('subs', '/products', {})
      .then(({ items, pagination_key }) => {
        setProducts(items);
        setPaginationKey(paginationKey);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header variant="h1">Products</Header>
        </SpaceBetween>
      }
    >
      <Container
        header={
          <Header variant="h2" description="Go to Upload page to add your products">
            Browse through your products
          </Header>
        }
      >
        <Table
          columnDefinitions={[
            {
              id: 'id',
              header: 'Id',
              cell: (item) => item.id,
              isRowHeader: true,
            },
            {
              id: 'title',
              header: 'Title',
              cell: (item) => item.title,
            },
            {
              id: 'categories',
              header: 'Categories',
              cell: (item) => item.categories.join(', '),
            },
          ]}
          items={products}
          loadingText="Getting Products"
          sortingDisabled
          empty={
            <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
              No Products Found
            </Box>
          }
          header={<Header> All Products </Header>}
        />
      </Container>
    </ContentLayout>
  );
}
