'use client';

import { useState } from 'react';
import { Storage } from 'aws-amplify';
import Container from '@cloudscape-design/components/container';
import FileUpload from '@cloudscape-design/components/file-upload';
import Form from '@cloudscape-design/components/form';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Alert, { AlertProps } from '@cloudscape-design/components/alert';
import ContentLayout from '@cloudscape-design/components/content-layout';

export default function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  const [alert, setAlert] = useState<{ type: AlertProps.Type; msg: string }>();

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <Header variant="h1">Upload</Header>

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
          <Header
            variant="h2"
            description="you can our example data in sample-data/instacart.jsonl"
          >
            Upload your data catalog
          </Header>
        }
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const [file] = files;
            try {
              await Storage.put(file.name, file);
              setAlert({ type: 'success', msg: 'File uploaded successfully.' });
            } catch (error) {
              setAlert({ type: 'error', msg: 'File upload failed.' });
            }
            setFiles([]);
          }}
        >
          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="primary" disabled={!files.length}>
                  Submit
                </Button>
              </SpaceBetween>
            }
          >
            <FileUpload
              onChange={({ detail }) => setFiles(detail.value)}
              value={files}
              i18nStrings={{
                uploadButtonText: () => 'Choose file',
                dropzoneText: () => 'Drop file to upload',
                removeFileAriaLabel: () => 'Remove file',
                limitShowFewer: 'Show fewer files',
                limitShowMore: 'Show more files',
                errorIconAriaLabel: 'Error',
              }}
              showFileLastModified
              showFileSize
              showFileThumbnail
              tokenLimit={3}
            />
          </Form>
        </form>
      </Container>
    </ContentLayout>
  );
}
