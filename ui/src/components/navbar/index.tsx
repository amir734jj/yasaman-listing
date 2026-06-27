import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore } from '../../store/languageStore';
import { paths } from '../../routes';

export default function AppNavbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const handleLogout = () => {
    logout();
    navigate(paths.root);
  };

  return (
    <Navbar expand="md" bg="body-tertiary" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to={paths.root}>
          {t('appName')}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={paths.root}>
              {t('nav.listings')}
            </Nav.Link>
            <Nav.Link as={Link} to={paths.about}>
              {t('nav.about')}
            </Nav.Link>
            {token && (
              <Nav.Link as={Link} to={paths.create}>
                {t('nav.create')}
              </Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to={paths.adminUsers}>
                {t('admin.users')}
              </Nav.Link>
            )}
          </Nav>
          <div className="d-flex flex-wrap align-items-center gap-2 mt-2 mt-md-0">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm" id="language-selector">
                <FontAwesomeIcon icon={faGlobe} style={{ marginInlineEnd: '0.4rem' }} />
                {language === 'fa' ? t('language.farsi') : t('language.english')}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active={language === 'en'} onClick={() => setLanguage('en')}>
                  {t('language.english')}
                </Dropdown.Item>
                <Dropdown.Item active={language === 'fa'} onClick={() => setLanguage('fa')}>
                  {t('language.farsi')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="outline-secondary" size="sm" onClick={toggleTheme} title="Theme">
              {themeMode === 'dark' ? (
                <>
                  <FontAwesomeIcon icon={faSun} style={{ marginInlineEnd: '0.4rem' }} />
                  {t('theme.light')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMoon} style={{ marginInlineEnd: '0.4rem' }} />
                  {t('theme.dark')}
                </>
              )}
            </Button>
            {token ? (
              <>
                <Link
                  to={paths.profile}
                  className={`btn btn-outline-secondary btn-sm${pathname === paths.profile ? ' active' : ''}`}
                  aria-current={pathname === paths.profile ? 'page' : undefined}
                >
                  {t('nav.profile')}
                </Link>
                <Button variant="outline-primary" size="sm" onClick={handleLogout}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link
                  to={paths.login}
                  className={`btn btn-outline-primary btn-sm${pathname === paths.login ? ' active' : ''}`}
                  aria-current={pathname === paths.login ? 'page' : undefined}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to={paths.register}
                  className={`btn btn-outline-primary btn-sm${pathname === paths.register ? ' active' : ''}`}
                  aria-current={pathname === paths.register ? 'page' : undefined}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
