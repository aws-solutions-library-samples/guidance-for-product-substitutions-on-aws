'use client';

import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

export default function Home() {
  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header variant="h1">Substitutions</Header>
        </SpaceBetween>
      }
    >
      <Container header={<Header variant="h1">Guidance for Product Substitutions on AWS</Header>}>
        This Substitutions demo is an example of how one can use OpenSearch&#39;s kNN feature in
        combination with Natural Language Processing to produce recommendations for replacing out of
        stock grocery store products.
      </Container>
    </ContentLayout>
  );
}
