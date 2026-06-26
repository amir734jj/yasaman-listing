import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from '../navbar';

export default function Layout() {
  return (
    <>
      <AppNavbar />
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}
