'use client';

import Container from '@cloudscape-design/components/container';
import Box from '@cloudscape-design/components/box';

export default function Upload() {
  return (
    <Box margin="xxxl" padding="xxxl">
      <Container
        header={
          <Box fontSize="display-l" fontWeight="bold">
            Upload
          </Box>
        }
      ></Container>
    </Box>
  );
}
