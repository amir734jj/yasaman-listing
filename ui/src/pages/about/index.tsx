import { Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSeo } from '../../hooks/useSeo';

export default function AboutPage() {
  const { t } = useTranslation();
  useSeo({ title: t('about.title'), description: t('about.tagline') });

  const features = [
    { title: t('about.feesTitle'), body: t('about.fees') },
    { title: t('about.localTitle'), body: t('about.local') },
    { title: t('about.simpleTitle'), body: t('about.simple') },
  ];

  return (
    <div>
      <h1 className="h3 mb-2">{t('about.title')}</h1>
      <p className="lead text-secondary">{t('about.tagline')}</p>
      <p>{t('about.body1')}</p>
      <p>{t('about.body2')}</p>

      <Row className="g-3 mt-2">
        {features.map((f) => (
          <Col key={f.title} md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="h6">{f.title}</Card.Title>
                <Card.Text className="text-secondary mb-0">{f.body}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
