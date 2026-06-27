import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { api } from '../../api/client';
import FileDropzone from '../../components/file-dropzone';
import TagsInput from '../../components/tags-input';
import MediaView from '../../components/media-view';
import CitySelect from '../../components/city-select';
import CityMap from '../../components/city-map';
import { findCity } from '../../data/iranCities';
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

  const locationCity = findCity(location);

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

  const moveExisting = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (!id || target < 0 || target >= existingMedia.length) return;

    const previous = existingMedia;
    const next = [...existingMedia];
    [next[index], next[target]] = [next[target], next[index]];
    setExistingMedia(next);

    try {
      await api.listing.listingsMediaOrderUpdate(id, { mediaIds: next });
    } catch {
      setExistingMedia(previous);
      setError(t('common.error'));
    }
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
          <CitySelect value={location} onChange={setLocation} />
          {locationCity && (
            <div className="mt-2">
              <CityMap lat={locationCity.lat} lon={locationCity.lon} name={location} />
            </div>
          )}
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
          <Form.Group className="mb-3">
            <Form.Label className="mb-1 d-block">{t('create.currentMedia')}</Form.Label>
            <Form.Text className="d-block text-body-secondary mb-2">{t('create.reorderHint')}</Form.Text>
            <Row className="g-2">
              {existingMedia.map((fileId, index) => (
                <Col xs={6} md={4} key={fileId}>
                  <div className="position-relative">
                    <MediaView fileId={fileId} className="media-thumb" controls thumb />
                    {index === 0 && (
                      <Badge bg="primary" className="position-absolute top-0 start-0 m-1">
                        {t('create.cover')}
                      </Badge>
                    )}
                  </div>
                  <div className="d-flex gap-1 mt-1">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveExisting(index, -1)}
                      title={t('create.moveEarlier')}
                      aria-label={t('create.moveEarlier')}
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      disabled={index === existingMedia.length - 1}
                      onClick={() => moveExisting(index, 1)}
                      title={t('create.moveLater')}
                      aria-label={t('create.moveLater')}
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      className="ms-auto"
                      onClick={() => removeExisting(fileId)}
                    >
                      {t('detail.delete')}
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </Form.Group>
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
