import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Button, Alert, ListGroup } from 'react-bootstrap';
import './index.css';

const MAX_FILES = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export default function FileDropzone({ files, onFilesChange }: FileDropzoneProps) {
  const { t } = useTranslation();
  const [error, setError] = useState('');

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      const messages: string[] = [];

      if (rejections.some((r) => r.errors.some((e) => e.code === 'file-invalid-type'))) {
        messages.push(t('create.invalidType'));
      }
      if (rejections.some((r) => r.errors.some((e) => e.code === 'file-too-large'))) {
        messages.push(
          t('create.fileTooLarge', {
            image: MAX_IMAGE_BYTES / (1024 * 1024),
            video: MAX_VIDEO_BYTES / (1024 * 1024),
          }),
        );
      }

      const remaining = MAX_FILES - files.length;
      let toAdd = accepted;
      if (accepted.length > remaining) {
        toAdd = accepted.slice(0, Math.max(0, remaining));
        messages.push(t('create.tooManyFiles', { max: MAX_FILES }));
      }

      setError(messages.join(' '));
      if (toAdd.length > 0) {
        onFilesChange([...files, ...toAdd]);
      }
    },
    [files, onFilesChange, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
    },
    validator: (file) => {
      const limit = file.type.startsWith('video') ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (file.size > limit) {
        return { code: 'file-too-large', message: 'File too large' };
      }
      return null;
    },
  });

  const removeAt = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div {...getRootProps()} className={`dropzone${isDragActive ? ' dropzone-active' : ''}`}>
        <input {...getInputProps()} />
        <p className="text-body-secondary mb-0">
          {isDragActive ? t('create.dropzoneActive') : t('create.dropzoneHint')}
        </p>
      </div>

      <p className="text-body-secondary small mt-1 mb-0">
        {t('create.uploadLimits', {
          max: MAX_FILES,
          image: MAX_IMAGE_BYTES / (1024 * 1024),
          video: MAX_VIDEO_BYTES / (1024 * 1024),
        })}
      </p>

      {error && (
        <Alert variant="warning" className="mt-2 mb-0 py-2" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <ListGroup className="mt-2">
          {files.map((file, index) => (
            <ListGroup.Item
              key={`${file.name}-${index}`}
              className="d-flex justify-content-between align-items-center gap-2"
            >
              <span className="text-truncate">
                {file.name}{' '}
                <span className="text-body-secondary small">
                  ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
              </span>
              <Button
                type="button"
                variant="outline-danger"
                size="sm"
                className="flex-shrink-0"
                onClick={() => removeAt(index)}
              >
                {t('create.removeFile')}
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
