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
import Alert, { AlertProps } from '@cloudscape-design/components/alert';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import { Product } from '../../types';

export default function Substitute() {
  const [alert, setAlert] = useState<{ type: AlertProps.Type; msg: string }>();
  const [productId, setProductId] = useState('');
  const [subs, setSubs] = useState<Product[]>([]);

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header variant="h1">Substitute</Header>

          {alert ? (
            <Alert dismissible type={alert.type} onDismiss={() => setAlert(undefined)}>
              {alert.msg}
            </Alert>
          ) : null}
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
                const { substitutions } = await API.get(
                  'subs',
                  '/substitutions?id=' + productId,
                  {}
                );
                setSubs(substitutions);
              } catch (error) {
                setAlert({ type: 'error', msg: 'Request Failed' });
              }
            }}
          >
            <Form actions={<Button variant="primary">Submit</Button>}>
              <FormField label="Product">
                <Input value={productId} onChange={({ detail }) => setProductId(detail.value)} />
              </FormField>
            </Form>
          </form>
          <Table
            columnDefinitions={[
              {
                id: 'id',
                header: 'Id',
                cell: (item) => item.id,
                sortingField: 'id',
                isRowHeader: true,
              },
              {
                id: 'title',
                header: 'Title',
                cell: (item) => item.title,
                sortingField: 'alt',
              },
              {
                id: 'categories',
                header: 'Categories',
                cell: (item) => item.categories,
              },
            ]}
            items={subs}
            loadingText="Getting Substitutions"
            sortingDisabled
            empty={
              <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
                No Substitutions
              </Box>
            }
            header={<Header> Recommended Substitutions </Header>}
          />
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}
