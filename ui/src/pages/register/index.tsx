import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useSeo } from '../../hooks/useSeo';

export default function RegisterPage() {
  const { t } = useTranslation();
  useSeo({ title: t('auth.registerTitle'), noindex: true });
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setBusy(true);
    try {
      const res = await api.account.accountRegisterCreate({ email, password, displayName });
      setAuth(res.data);
      navigate('/');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('common.error');
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="shadow-sm mx-auto my-4" style={{ maxWidth: 400 }}>
      <Card.Body>
        <Card.Title className="h4 mb-3">{t('auth.registerTitle')}</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{t('auth.email')}</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('auth.displayName')}</Form.Label>
            <Form.Control value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('auth.password')}</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('auth.confirmPassword')}</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              isInvalid={confirmPassword.length > 0 && confirmPassword !== password}
            />
            <Form.Control.Feedback type="invalid">
              {t('auth.passwordMismatch')}
            </Form.Control.Feedback>
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button variant="primary" type="submit" disabled={busy} className="w-100">
            {t('auth.registerButton')}
          </Button>
        </Form>
        <p className="text-body-secondary mt-3 mb-0">
          <Link to="/login">{t('auth.haveAccount')}</Link>
        </p>
      </Card.Body>
    </Card>
  );
}
