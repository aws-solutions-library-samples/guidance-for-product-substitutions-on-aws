'use client';

import Container from '@cloudscape-design/components/container';
import Box from '@cloudscape-design/components/box';

export default function Home() {
  return (
    <Box margin="xxxl" padding="xxxl">
      <Container
        header={
          <Box fontSize="display-l" fontWeight="bold">
            Guidance for Product Substitutions on AWS
          </Box>
        }
      >
        <Box margin={{ vertical: 'xxl' }} padding={{ vertical: 'xxl' }} fontSize="heading-l">
          This Substitutions demo is an example of how one can use OpenSearch&#39;s kNN feature in
          combination with Natural Language Processing to produce recommendations for replacing out
          of stock grocery store products.
        </Box>
      </Container>
    </Box>
  );
}
