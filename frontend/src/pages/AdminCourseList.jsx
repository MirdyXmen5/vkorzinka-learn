import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const AdminCourseList = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('courses/');
                setCourses(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleDelete = async (courseId) => {
        if (!window.confirm(t('admin.courses.deleteConfirm'))) return;
        try {
            await api.delete(`courses/${courseId}/`);
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (err) {
            console.error("Failed to delete course:", err);
            alert(t('common.error'));
        }
    };

    if (loading) return <div className="text-center py-10">{t('common.loading')}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">{t('admin.courses.title')}</h2>
                <Link
                    to="/admin/courses/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5cad2d] hover:bg-[#4a8c24]"
                >
                    + {t('admin.courses.create')}
                </Link>
            </div>

            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">{t('admin.courses.table.title')}</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('admin.courses.table.enrollments')}</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('admin.courses.table.createdAt')}</th>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">{t('common.actions')}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                    {course.title}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    -
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {new Date(course.created_at).toLocaleDateString()}
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <Link to={`/admin/courses/edit/${course.id}`} className="text-blue-600 hover:text-blue-900 mr-4">{t('common.edit')}</Link>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        {t('common.delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCourseList;
