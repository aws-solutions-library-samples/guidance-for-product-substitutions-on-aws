'use client';

import Container from '@cloudscape-design/components/container';
import Box from '@cloudscape-design/components/box';

export default function Substitute() {
  return (
    <Box margin="xxxl" padding="xxxl">
      <Container
        header={
          <Box fontSize="display-l" fontWeight="bold">
            Substitute
          </Box>
        }
      ></Container>
    </Box>
  );
}
