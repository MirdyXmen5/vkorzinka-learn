import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const CourseList = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('courses/');
                setCourses(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                setError(t('courseList.error'));
                setLoading(false);
            }
        };

        fetchCourses();
    }, [t]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-sm">
                    <p className="font-bold text-red-800">{t('common.error')}</p>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 sm:text-5xl">
                        {t('courseList.title')}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
                        {t('courseList.heroSubtitle')}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                    >
                        <div className="relative h-60 overflow-hidden">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Course+Image'; }} // Fallback
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-blue-50 to-primary/5 flex items-center justify-center text-primary/30 font-black text-5xl italic tracking-tighter">
                                    BK
                                </div>
                            )}
                            {course.is_completed && (
                                <div className="absolute top-5 right-5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md">
                                    {t('courseDetail.completedBadge')}
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>

                        <div className="flex-1 p-8 flex flex-col">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                                {course.title}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-8 font-medium leading-relaxed">
                                {course.description}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${course.is_enrolled ? 'text-blue-500' : 'text-gray-400'}`}>
                                    {course.is_enrolled ? 'In Progress' : 'Curriculum'}
                                </span>
                                <Link
                                    to={`/courses/${course.id}`}
                                    className="inline-flex items-center text-sm font-black text-primary group-hover:text-primary-dark transition-all transform group-hover:translate-x-1"
                                >
                                    {course.is_enrolled || course.is_completed ? t('courseList.open') : t('courseList.start')}
                                    <svg className="ml-2 w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {courses.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold uppercase tracking-widest">{t('courseList.noCourses')}</p>
                </div>
            )}
        </div>
    );
};

export default CourseList;
