import { useEffect, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useSeo } from '../../hooks/useSeo';

export default function ProfilePage() {
  const { t } = useTranslation();
  useSeo({ title: t('profile.title'), noindex: true });
  const setDisplayName = useAuthStore((s) => s.setDisplayName);

  const [email, setEmail] = useState('');
  const [displayName, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.account.accountProfileList().then((res) => {
      setEmail(res.data.email ?? '');
      setName(res.data.displayName ?? '');
      setDescription(res.data.description ?? '');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      const res = await api.account.accountProfileUpdate({ displayName, description });
      setName(res.data.displayName ?? '');
      setDescription(res.data.description ?? '');
      setDisplayName(res.data.displayName ?? null);
      setSaved(true);
    } catch {
      setError(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-3">{t('profile.title')}</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t('profile.email')}</Form.Label>
          <Form.Control value={email} disabled readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('profile.displayName')}</Form.Label>
          <Form.Control
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('profile.displayNamePlaceholder')}
            maxLength={256}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('profile.description')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('profile.descriptionPlaceholder')}
            maxLength={2000}
          />
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}
        {saved && <Alert variant="success">{t('profile.saved')}</Alert>}

        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? t('profile.saving') : t('profile.save')}
        </Button>
      </Form>
    </div>
  );
}
