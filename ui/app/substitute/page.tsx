'use client';

import { useState } from 'react';
import { API } from 'aws-amplify';
import Container from '@cloudscape-design/components/container';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Form from '@cloudscape-design/components/form';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import { Product } from '../../types';

const columnDefinitions = [
  {
    id: 'id',
    header: 'Id',
    cell: (item: Product) => item.id,
    isRowHeader: true,
  },
  {
    id: 'title',
    header: 'Title',
    cell: (item: Product) => item.title,
  },
  {
    id: 'categories',
    header: 'Categories',
    cell: (item: Product) => item.categories.join(', '),
  },
];

export default function Substitute() {
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [product, ...subs] = products;

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header variant="h1">Substitute</Header>
        </SpaceBetween>
      }
    >
      <Container
        header={
          <Header variant="h2" description="Go to Products page to browse">
            Get a list of substutions for your product
          </Header>
        }
      >
        <SpaceBetween size="xxl">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const result = await API.get('subs', '/substitutions?id=' + productId, {});
                setProducts(result);
              } catch (error) {
                console.error(error);
              }
            }}
          >
            <Form actions={<Button variant="primary">Submit</Button>}>
              <FormField label="Product">
                <Input value={productId} onChange={({ detail }) => setProductId(detail.value)} />
              </FormField>
            </Form>
          </form>
          {product ? (
            <Table
              columnDefinitions={columnDefinitions}
              items={[product]}
              sortingDisabled
              header={<Header> Missing Product </Header>}
            />
          ) : null}
          <Table
            columnDefinitions={columnDefinitions}
            items={subs}
            loadingText="Getting Substitutions"
            sortingDisabled
            empty={
              <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
                No Substitutions Found
              </Box>
            }
            header={<Header> Recommended Substitutions </Header>}
          />
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}
