'use client';

import { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Header from '@cloudscape-design/components/header';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Pagination from '@cloudscape-design/components/pagination';
import TextFilter from '@cloudscape-design/components/text-filter';
import { Product } from '../../types';

const size = 10;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [search, setSearch] = useState('');
  const [count, setCount] = useState(0);
  const [triggerSearch, setTriggerSearch] = useState(0);

  useEffect(() => {
    const pageFrom = (pageIndex - 1) * size;
    const path = `/products?size=${size}&pageFrom=${pageFrom}&search=${search}`;
    API.get('subs', path, {})
      .then(({ items, count }) => {
        setCount(count);
        setProducts(items);
      })
      .catch((err) => console.error(err));
  }, [pageIndex, triggerSearch]);

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
          filter={
            <TextFilter
              filteringPlaceholder="Search Products"
              filteringText={search}
              countText={`${count} matches`}
              onDelayedChange={() => setTriggerSearch(triggerSearch + 1)}
              onChange={({ detail }) => setSearch(detail.filteringText)}
            />
          }
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
          pagination={
            <Pagination
              currentPageIndex={pageIndex}
              pagesCount={count}
              openEnd={true}
              onChange={({ detail }) => setPageIndex(detail.currentPageIndex)}
            />
          }
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
