import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useSeo } from '../../hooks/useSeo';

export default function LoginPage() {
  const { t } = useTranslation();
  useSeo({ title: t('auth.loginTitle'), noindex: true });
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.account.accountLoginCreate({ email, password });
      setAuth(res.data);
      navigate('/');
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="shadow-sm mx-auto my-4" style={{ maxWidth: 400 }}>
      <Card.Body>
        <Card.Title className="h4 mb-3">{t('auth.loginTitle')}</Card.Title>
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
            <Form.Label>{t('auth.password')}</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button variant="primary" type="submit" disabled={busy} className="w-100">
            {t('auth.loginButton')}
          </Button>
        </Form>
        <p className="text-body-secondary mt-3 mb-0">
          <Link to="/register">{t('auth.needAccount')}</Link>
        </p>
      </Card.Body>
    </Card>
  );
}
