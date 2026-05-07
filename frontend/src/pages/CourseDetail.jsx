import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
// Removed ReactPlayer import
import VideoPlayer from '../components/VideoPlayer';

// Helper component for managing video play state
const VideoSection = ({ videoUrl, title }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobilePlayer, setShowMobilePlayer] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getVideoSource = (url) => {
        // YouTube
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (ytMatch) {
            return {
                type: 'video',
                sources: [
                    {
                        src: ytMatch[1],
                        provider: 'youtube',
                    },
                ],
            };
        }

        // Vimeo
        const vimeoMatch = url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
        if (vimeoMatch) {
            return {
                type: 'video',
                sources: [
                    {
                        src: vimeoMatch[1],
                        provider: 'vimeo',
                    },
                ],
            };
        }

        // Native File
        return {
            type: 'video',
            sources: [
                {
                    src: url,
                    type: 'video/mp4', // Assuming mp4 for simplicity, plyr handles most
                },
            ],
        };
    };

    const source = getVideoSource(videoUrl);

    if (isMobile && !showMobilePlayer) {
        return (
            <button
                onClick={() => setShowMobilePlayer(true)}
                className="w-full aspect-video rounded-2xl bg-gray-900 text-white flex flex-col items-center justify-center gap-3 hover:bg-black transition-colors shadow-lg group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl z-10 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <span className="font-bold text-lg z-10">{t('courseDetail.watchVideo') || "Watch Video"}</span>
            </button>
        );
    }

    if (showMobilePlayer) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4 animate-fade-in">
                <button
                    onClick={() => setShowMobilePlayer(false)}
                    className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 z-50"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="w-full max-w-4xl max-h-screen aspect-video">
                    <VideoPlayer source={source} title={title} options={{ autoplay: true }} />
                </div>
            </div>
        );
    }

    return (
        <VideoPlayer source={source} title={title} />
    );
};


const CourseDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completing, setCompleting] = useState(false);

    const handleStartCourse = async () => {
        setCompleting(true);
        try {
            await api.post(`courses/${id}/enroll/`);
            const updatedCourse = await api.get(`courses/${id}/`);
            setCourse(updatedCourse.data);
        } catch (err) {
            console.error("Failed to enroll:", err);
            alert("Failed to start course.");
        } finally {
            setCompleting(false);
        }
    };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`courses/${id}/`);
                setCourse(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch course details:", err);
                setError(t('courseDetail.error'));
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id, t]);

    const handleMarkComplete = async () => {
        const name = prompt(t('test.enteringName'));
        if (name === null) return; // Cancelled
        if (!name.trim()) {
            alert(t('test.validationName'));
            return;
        }

        setCompleting(true);
        try {
            const response = await api.post(`courses/${id}/complete/`, { recipient_name: name });
            if (response.data.status === 'completed' || response.data.status === 'already completed') {
                alert(t('courseDetail.successComplete'));
                // Refresh course data to update UI
                const updatedCourse = await api.get(`courses/${id}/`);
                setCourse(updatedCourse.data);
            }
        } catch (err) {
            console.error("Failed to complete course:", err);
            alert(err.response?.data?.error || "Failed to complete course.");
        } finally {
            setCompleting(false);
        }
    };

    const handleRetake = async () => {
        // Explicitly use window.confirm to avoid any scope ambiguity
        if (!window.confirm(t('courseDetail.retakeConfirm'))) return;

        setCompleting(true);
        try {
            await api.post(`courses/${id}/retake/`);
            const updatedCourse = await api.get(`courses/${id}/`);
            setCourse(updatedCourse.data);
            // alert(t('courseDetail.starting')); // Optional: removing alert to make it smoother, state update is immediate
        } catch (err) {
            console.error("Failed to retake course:", err);
            alert("Failed to reset course.");
        } finally {
            setCompleting(false);
        }
    };

    const openPreview = (url) => {
        setPreviewImage(url);
        // Disable body scroll when modal is open
        document.body.style.overflow = 'hidden';
    };

    const closePreview = () => {
        setPreviewImage(null);
        // Re-enable body scroll
        document.body.style.overflow = 'unset';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5cad2d]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">{t('common.error')}</strong>
                <span className="block sm:inline"> {error}</span>
                <div className="mt-4">
                    <Link to="/" className="text-blue-600 underline">{t('courseDetail.backToCourses')}</Link>
                </div>
            </div>
        );
    }

    if (!course) return <div>{t('courseDetail.notFound')}</div>;

    return (
        <div className="min-h-screen">
            {/* Course Header - Cinematic approach */}
            <div className="relative h-[450px] bg-primary overflow-hidden">
                {course.thumbnail && (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-20 scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="space-y-4">
                        {course.is_completed && (
                            <span className="inline-block bg-white text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-fade-in">
                                {t('courseDetail.completedBadge')}
                            </span>
                        )}
                        <h1 className="text-5xl font-black text-black tracking-tight sm:text-6xl">
                            {course.title}
                        </h1>
                        <p className="text-xl text-black/90 max-w-3xl leading-relaxed font-medium">
                            {course.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center">
                                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </span>
                                {t('courseDetail.contentTitle')}
                            </h2>

                            <div className="space-y-10">
                                {course.contents && course.contents.length > 0 ? (
                                    course.contents.map((content) => (
                                        <article key={content.id} className="group glass-card hover:shadow-2xl border-gray-100">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="text-xs font-black text-primary/40 uppercase tracking-[0.2em]">Section {content.order}</span>
                                                <h3 className="text-2xl font-bold text-gray-900 text-right">{content.title}</h3>
                                            </div>

                                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-medium">
                                                {content.text_content && (
                                                    <div className="mb-8 whitespace-pre-wrap">{content.text_content}</div>
                                                )}

                                                {(content.image_file || content.image_url) && (
                                                    <div
                                                        className="my-8 overflow-hidden rounded-2xl shadow-lg border border-gray-100 cursor-zoom-in relative group/image"
                                                        onClick={() => openPreview(content.image_file || content.image_url)}
                                                    >
                                                        <img
                                                            src={content.image_file || content.image_url}
                                                            alt={content.title}
                                                            className="w-full h-auto object-cover group-hover/image:scale-[1.03] transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                                                            <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover/image:opacity-100 transition-opacity transform translate-y-4 group-hover/image:translate-y-0 duration-300">
                                                                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {content.video_url && (
                                                    <div className="my-8">
                                                        <VideoSection
                                                            videoUrl={content.video_url}
                                                            title={content.title}
                                                        />
                                                    </div>
                                                )}

                                                {content.content_type === 'DOCUMENT' && (
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white rounded-2xl border-2 border-dashed border-gray-200 mt-8 group-hover:border-primary/30 transition-colors gap-4 sm:gap-0">
                                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mr-5 flex-shrink-0">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-900 truncate">{content.title}</p>
                                                            <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{t('courseDetail.documentFile')}</p>
                                                        </div>
                                                        <a
                                                            href={content.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full sm:w-auto text-center inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-primary transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                                        >
                                                            {t('courseDetail.download')}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="text-center py-12 glass rounded-3xl text-gray-400 italic">
                                        {t('courseDetail.noContent')}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <div className="glass p-8 rounded-3xl shadow-xl border-gray-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{t('courseDetail.yourProgress')}</h3>
                                <p className="text-gray-500 font-medium mb-8">
                                    {course.is_completed ? t('courseDetail.congratulations') : t('courseDetail.readyNextStep')}
                                </p>

                                {!course.is_enrolled && (
                                    <button
                                        onClick={handleStartCourse}
                                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:translate-y-0 ${completing ? 'opacity-75 cursor-wait' : ''}`}
                                        disabled={completing}
                                    >
                                        {completing ? t('courseDetail.starting') : t('courseDetail.startCourse')}
                                    </button>
                                )}

                                {course.is_enrolled && !course.is_completed && (
                                    <div className="w-full space-y-4">
                                        {course.test ? (
                                            <button
                                                className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-white bg-primary hover:bg-primary-dark shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1"
                                                onClick={() => navigate(`/courses/${id}/test`)}
                                            >
                                                {t('courseDetail.takeTest')}
                                            </button>
                                        ) : (
                                            <button
                                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-white bg-primary hover:bg-primary-dark shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 flex items-center justify-center ${completing ? 'opacity-75 cursor-wait' : ''}`}
                                                onClick={handleMarkComplete}
                                                disabled={completing}
                                            >
                                                {completing ? (
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : t('courseDetail.markComplete')}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {course.is_completed && (
                                    <div className="w-full flex flex-col items-center">
                                        <div className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm mb-4">
                                            {t('courseDetail.completedBadge')}
                                        </div>
                                        <Link to="/profile" className="text-gray-400 hover:text-primary transition-colors font-bold text-sm">
                                            {t('courseDetail.viewCertificate')}
                                        </Link>
                                        <button
                                            onClick={handleRetake}
                                            className="mt-6 text-xs text-primary font-black uppercase tracking-widest hover:underline cursor-pointer py-2 px-4"
                                            type="button"
                                        >
                                            ↺ {t('courseDetail.retakeCourse')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/"
                                className="w-full flex items-center justify-center py-4 text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {t('courseDetail.backToList')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal (Lightbox) */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
                    onClick={closePreview}
                >
                    <button
                        onClick={closePreview}
                        className="absolute top-4 right-4 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50 transform hover:rotate-90 duration-300"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
                    />
                </div>
            )}
        </div>
    );
};


export default CourseDetail;
