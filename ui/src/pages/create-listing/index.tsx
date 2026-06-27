import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import FileDropzone from '../../components/file-dropzone';
import TagsInput from '../../components/tags-input';
import MediaView from '../../components/media-view';
import { useSeo } from '../../hooks/useSeo';

export default function CreateListingPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { t } = useTranslation();
  useSeo({ title: isEdit ? t('create.editTitle') : t('create.title'), noindex: true });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !id) return;
    api.listing.listingsDetail(id).then((res) => {
      const l = res.data;
      setName(l.name ?? '');
      setDescription(l.description ?? '');
      setLocation(l.location ?? '');
      setPrice(String(l.price ?? ''));
      setTags(l.tags ?? []);
      setExistingMedia(l.media ?? []);
    });
  }, [id, isEdit]);

  const uploadFiles = async (listingId: string) => {
    for (const file of files) {
      await api.listing.listingsMediaCreate(listingId, { file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (existingMedia.length + files.length === 0) {
      setError(t('create.mediaRequired'));
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name,
        description,
        location,
        price,
        tags,
      };

      if (isEdit && id) {
        await api.listing.listingsUpdate(id, payload);
        await uploadFiles(id);
        navigate(`/listings/${id}`);
      } else {
        const res = await api.listing.listingsCreate(payload);
        const newId = res.data.id!;
        await uploadFiles(newId);
        navigate(`/listings/${newId}`);
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const removeExisting = async (fileId: string) => {
    if (!id) return;
    if (existingMedia.length <= 1 && files.length === 0) {
      setError(t('create.mediaRequired'));
      return;
    }
    await api.listing.listingsMediaDelete(id, fileId);
    setExistingMedia((prev) => prev.filter((m) => m !== fileId));
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-3">{isEdit ? t('create.editTitle') : t('create.title')}</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t('create.name')}</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('create.namePlaceholder')}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('create.description')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('create.descriptionPlaceholder')}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('create.location')}</Form.Label>
          <Form.Control
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('create.locationPlaceholder')}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('create.price')}</Form.Label>
          <Form.Control
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('create.tags')}</Form.Label>
          <TagsInput tags={tags} onTagsChange={setTags} />
          <Form.Text className="text-body-secondary">{t('create.tagsHint')}</Form.Text>
        </Form.Group>

        {isEdit && existingMedia.length > 0 && (
          <Row className="g-2 mb-3">
            {existingMedia.map((fileId) => (
              <Col xs={6} md={4} key={fileId}>
                <MediaView fileId={fileId} className="media-thumb" controls />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="w-100 mt-1"
                  onClick={() => removeExisting(fileId)}
                >
                  {t('detail.delete')}
                </Button>
              </Col>
            ))}
          </Row>
        )}

        <Form.Group className="mb-3">
          <Form.Label>{t('create.media')}</Form.Label>
          <FileDropzone files={files} onFilesChange={setFiles} />
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}

        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? t('create.uploading') : isEdit ? t('create.save') : t('create.submit')}
        </Button>
      </Form>
    </div>
  );
}
