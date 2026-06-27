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

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSaved(false);

    if (newPassword !== confirmPassword) {
      setPwError(t('profile.passwordMismatch'));
      return;
    }

    setPwBusy(true);
    try {
      await api.account.accountPasswordUpdate({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwSaved(true);
    } catch {
      setPwError(t('profile.passwordError'));
    } finally {
      setPwBusy(false);
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
            required
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

      <hr className="my-4" />

      <h2 className="h5 mb-3">{t('profile.changePassword')}</h2>
      <Form onSubmit={handleChangePassword}>
        <Form.Group className="mb-3">
          <Form.Label>{t('profile.currentPassword')}</Form.Label>
          <Form.Control
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('profile.newPassword')}</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('profile.confirmNewPassword')}</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </Form.Group>

        {pwError && <Alert variant="danger">{pwError}</Alert>}
        {pwSaved && <Alert variant="success">{t('profile.passwordChanged')}</Alert>}

        <Button variant="primary" type="submit" disabled={pwBusy}>
          {pwBusy ? t('profile.saving') : t('profile.changePassword')}
        </Button>
      </Form>
    </div>
  );
}
