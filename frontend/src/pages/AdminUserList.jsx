import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const AdminUserList = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('admin/users/');
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div className="text-center py-10">{t('common.loading')}</div>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-6 text-gray-800">{t('admin.users.title')}</h2>
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">{t('admin.users.table.name')}</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('admin.users.table.username')}</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('admin.users.table.enrollments')}</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('admin.users.table.completed')}</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('admin.users.table.certificates')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.username}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {user.enrollments.length}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {user.enrollments.filter(e => e.is_completed).length}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {user.certificates.length}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserList;
