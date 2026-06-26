import { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { UserDto } from '../../api/generated/Api';
import { useAuthStore } from '../../store/authStore';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const currentUserId = useAuthStore((s) => s.userId);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.user.usersList();
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setEnabled = async (user: UserDto, enabled: boolean) => {
    if (enabled) {
      await api.user.usersActivateCreate(user.id!);
    } else {
      await api.user.usersDeactivateCreate(user.id!);
    }
    load();
  };

  const remove = async (user: UserDto) => {
    if (!window.confirm(t('admin.confirmDeleteUser'))) return;
    await api.user.usersDelete(user.id!);
    load();
  };

  if (loading) {
    return (
      <div className="text-center text-body-secondary py-5">
        <Spinner animation="border" size="sm" className="me-2" />
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div>
      <h1 className="h3 mb-3">{t('admin.manageUsers')}</h1>
      <Table responsive hover className="align-middle">
        <thead>
          <tr>
            <th>{t('admin.email')}</th>
            <th>{t('admin.name')}</th>
            <th>{t('admin.roles')}</th>
            <th>{t('admin.status')}</th>
            <th className="text-end">{t('admin.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id}>
                <td>
                  {user.email}
                  {isSelf && (
                    <Badge bg="info" className="ms-2">
                      {t('admin.you')}
                    </Badge>
                  )}
                </td>
                <td>{user.displayName}</td>
                <td>
                  {user.roles?.map((role) => (
                    <Badge key={role} bg="secondary" className="me-1">
                      {role}
                    </Badge>
                  ))}
                </td>
                <td>
                  {user.enabled ? (
                    <Badge bg="success">{t('admin.active')}</Badge>
                  ) : (
                    <Badge bg="secondary">{t('admin.inactive')}</Badge>
                  )}
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    {user.enabled ? (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => setEnabled(user, false)}
                      >
                        {t('admin.deactivate')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => setEnabled(user, true)}
                      >
                        {t('admin.activate')}
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isSelf}
                      onClick={() => remove(user)}
                    >
                      {t('admin.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
