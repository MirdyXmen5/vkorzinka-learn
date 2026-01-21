import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const AdminCourseForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        thumbnail: null,
        contents: [],
        test: {
            title: '',
            pass_score: 70,
            questions: []
        }
    });

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const fetchCourse = async () => {
                try {
                    const response = await api.get(`courses/${id}/`);
                    // Ensure test exists in state even if it doesn't in DB
                    const data = response.data;
                    if (!data.test) {
                        data.test = { title: '', pass_score: 70, questions: [] };
                    }
                    setCourseData(data);
                    setLoading(false);
                } catch (err) {
                    console.error("Failed to fetch course:", err);
                    setLoading(false);
                }
            };
            fetchCourse();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setCourseData(prev => ({ ...prev, thumbnail: e.target.files[0] }));
    };

    // Content Management
    const addContent = () => {
        setCourseData(prev => ({
            ...prev,
            contents: [...prev.contents, { title: '', content_type: 'TEXT', text_content: '', video_url: '', file_url: '', order: prev.contents.length }]
        }));
    };

    const handleContentChange = (index, field, value) => {
        const newContents = [...courseData.contents];
        newContents[index][field] = value;
        setCourseData(prev => ({ ...prev, contents: newContents }));
    };

    const removeContent = (index) => {
        setCourseData(prev => ({
            ...prev,
            contents: prev.contents.filter((_, i) => i !== index)
        }));
    };

    // Test Management
    const handleDeleteTest = async () => {
        if (!window.confirm(t('common.areYouSure') || 'Are you sure?')) return;

        try {
            // If test exists on server (has ID), delete it via API
            if (courseData.test && courseData.test.id) {
                await api.delete(`courses/${id}/delete_test/`);
            }

            // Clear test data in state
            setCourseData(prev => ({
                ...prev,
                test: { title: '', pass_score: 70, questions: [] }
            }));
        } catch (err) {
            console.error("Failed to delete test:", err);
            alert("Failed to delete test");
        }
    };

    const addQuestion = () => {
        setCourseData(prev => ({
            ...prev,
            test: {
                ...prev.test,
                questions: [...prev.test.questions, { text: '', answers: [{ text: '', is_correct: false }] }]
            }
        }));
    };

    const handleQuestionChange = (qIndex, value) => {
        const newQuestions = [...courseData.test.questions];
        newQuestions[qIndex].text = value;
        setCourseData(prev => ({ ...prev, test: { ...prev.test, questions: newQuestions } }));
    };

    const addAnswer = (qIndex) => {
        const newQuestions = [...courseData.test.questions];
        newQuestions[qIndex].answers.push({ text: '', is_correct: false });
        setCourseData(prev => ({ ...prev, test: { ...prev.test, questions: newQuestions } }));
    };

    const handleAnswerChange = (qIndex, aIndex, field, value) => {
        const newQuestions = [...courseData.test.questions];
        if (field === 'is_correct' && value === true) {
            // Radio-like behavior: only one correct answer per question
            newQuestions[qIndex].answers = newQuestions[qIndex].answers.map((a, i) => ({
                ...a,
                is_correct: i === aIndex
            }));
        } else {
            newQuestions[qIndex].answers[aIndex][field] = value;
        }
        setCourseData(prev => ({ ...prev, test: { ...prev.test, questions: newQuestions } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Clean contents: Convert empty strings to null for URL fields to avoid backend validation errors
            const cleanedContents = courseData.contents.map(content => {
                // Auto-fill title if empty but content exists (to satisfy backend validation)
                let title = content.title.trim();
                if (!title) {
                    if (content.content_type === 'IMAGE') title = 'Image';
                    else if (content.content_type === 'VIDEO') title = 'Video';
                    else if (content.content_type === 'DOCUMENT') title = 'Document';
                    else title = 'Section ' + (content.order + 1);
                }

                return {
                    ...content,
                    title: title,
                    image_url: content.image_url?.trim() ? content.image_url.trim() : null,
                    video_url: content.video_url?.trim() ? content.video_url.trim() : null,
                    file_url: content.file_url?.trim() ? content.file_url.trim() : null,
                    text_content: content.text_content || ''
                };
            });

            const payload = {
                title: courseData.title,
                description: courseData.description,
                contents: cleanedContents,
                test: courseData.test.title ? courseData.test : null
            };

            let response;
            if (isEdit) {
                response = await api.patch(`courses/${id}/`, payload);
            } else {
                response = await api.post('courses/', payload);
            }

            const courseId = isEdit ? id : response.data.id;

            // Handle thumbnail upload separately if it's a file
            if (courseData.thumbnail instanceof File) {
                const thumbData = new FormData();
                thumbData.append('thumbnail', courseData.thumbnail);
                await api.patch(`courses/${courseId}/`, thumbData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate('/admin/courses');
        } catch (err) {
            console.error("Failed to save course:", err);
            let errorMessage = t('common.error');
            if (err.response?.data) {
                // Formatting error object to string for better debugging in alert
                const errorDetails = typeof err.response.data === 'object'
                    ? JSON.stringify(err.response.data, null, 2)
                    : err.response.data;
                errorMessage += ":\n" + errorDetails;
            } else {
                errorMessage += ": " + err.message;
            }
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-10">{t('common.loading')}</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b pb-4">
                <h2 className="text-2xl font-bold">{isEdit ? t('admin.courses.edit') : t('admin.courses.new')}</h2>
            </div>

            {/* Basic Info */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-l-4 border-primary pl-2">{t('admin.courses.form.general')}</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin.courses.table.title')}</label>
                        <input
                            type="text"
                            name="title"
                            value={courseData.title}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border-gray-200 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('courseDetail.description') || 'Description'}</label>
                        <textarea
                            name="description"
                            value={courseData.description}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full border-gray-200 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('admin.courses.form.thumbnail') || 'Thumbnail'}</label>
                        {courseData.thumbnail && typeof courseData.thumbnail === 'string' && (
                            <div className="mt-2 mb-2 relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                                <img src={courseData.thumbnail} alt="Current thumbnail" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold border-l-4 border-primary pl-2">{t('admin.courses.form.contents')}</h3>
                    <button type="button" onClick={addContent} className="text-sm text-primary hover:underline">+ {t('admin.courses.form.addSection')}</button>
                </div>
                {courseData.contents.map((content, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                        <button type="button" onClick={() => removeContent(idx)} className="absolute top-2 right-2 text-red-500 text-xs">{t('common.delete')}</button>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">{t('admin.courses.table.title')}</label>
                                <input
                                    type="text"
                                    value={content.title}
                                    onChange={(e) => handleContentChange(idx, 'title', e.target.value)}
                                    className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">{t('common.type') || 'Type'}</label>
                                <select
                                    value={content.content_type}
                                    onChange={(e) => handleContentChange(idx, 'content_type', e.target.value)}
                                    className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                                >
                                    <option value="TEXT">Text</option>
                                    <option value="IMAGE">Image (URL)</option>
                                    <option value="VIDEO">Video (YouTube/Vimeo)</option>
                                    <option value="DOCUMENT">Document (Download Link)</option>
                                </select>
                            </div>
                        </div>
                        {content.content_type === 'TEXT' && (
                            <textarea
                                value={content.text_content}
                                onChange={(e) => handleContentChange(idx, 'text_content', e.target.value)}
                                placeholder="Markdown/Text content..."
                                rows={4}
                                className="block w-full text-sm border-gray-300 rounded-md"
                            />
                        )}
                        {content.content_type === 'IMAGE' && (
                            <input
                                type="url"
                                value={content.image_url || ''}
                                onChange={(e) => handleContentChange(idx, 'image_url', e.target.value)}
                                placeholder="Image URL (e.g. https://example.com/image.jpg)"
                                className="block w-full text-sm border-gray-200 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                            />
                        )}
                        {content.content_type === 'VIDEO' && (
                            <input
                                type="url"
                                value={content.video_url}
                                onChange={(e) => handleContentChange(idx, 'video_url', e.target.value)}
                                placeholder="YouTube/Vimeo Link"
                                className="block w-full text-sm border-gray-200 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                            />
                        )}
                        {content.content_type === 'DOCUMENT' && (
                            <input
                                type="url"
                                value={content.file_url}
                                onChange={(e) => handleContentChange(idx, 'file_url', e.target.value)}
                                placeholder="Google Drive / Dropbox Link... (PDF, Word, etc.)"
                                className="block w-full text-sm border-gray-200 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                            />
                        )}
                    </div>
                ))}
            </section>

            {/* Test Section */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold border-l-4 border-primary pl-2">{t('admin.courses.form.test')}</h3>
                    {(courseData.test.title || courseData.test.questions.length > 0) && (
                        <button
                            type="button"
                            onClick={handleDeleteTest}
                            className="text-sm text-red-500 hover:text-red-700 hover:underline px-2 py-1 rounded"
                        >
                            {t('common.delete') || 'Delete Test'}
                        </button>
                    )}
                </div>
                <div className="p-6 border rounded-lg bg-blue-50">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('admin.courses.table.title')}</label>
                            <input
                                type="text"
                                value={courseData.test.title}
                                onChange={(e) => setCourseData(prev => ({ ...prev, test: { ...prev.test, title: e.target.value } }))}
                                placeholder="e.g. Final Assessment"
                                className="mt-1 block w-full border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('test.passScoreLabel').replace(': {{score}}%', '') || 'Pass Score (%)'}</label>
                            <input
                                type="number"
                                value={courseData.test.pass_score}
                                onChange={(e) => setCourseData(prev => ({ ...prev, test: { ...prev.test, pass_score: e.target.value } }))}
                                className="mt-1 block w-full border-gray-200 rounded-md focus:ring-primary focus:border-primary shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {courseData.test.questions.map((q, qIdx) => (
                            <div key={qIdx} className="bg-white p-4 rounded shadow-sm border border-blue-100">
                                <input
                                    type="text"
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                                    placeholder={`${t('admin.courses.form.question') || 'Question'} ${qIdx + 1}`}
                                    className="w-full font-medium border-b border-gray-200 focus:border-primary outline-none mb-4 p-1"
                                />
                                <div className="space-y-2">
                                    {q.answers.map((a, aIdx) => (
                                        <div key={aIdx} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name={`correct-${qIdx}`}
                                                checked={a.is_correct}
                                                onChange={() => handleAnswerChange(qIdx, aIdx, 'is_correct', true)}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <input
                                                type="text"
                                                value={a.text}
                                                onChange={(e) => handleAnswerChange(qIdx, aIdx, 'text', e.target.value)}
                                                placeholder="Answer option..."
                                                className="flex-1 text-sm border-none bg-gray-50 focus:bg-white rounded p-1 transition-colors"
                                            />
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addAnswer(qIdx)} className="text-xs text-blue-600 hover:underline">+ {t('admin.courses.form.addOption')}</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addQuestion} className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-500 rounded hover:bg-blue-100 transition-colors">
                            + {t('admin.courses.form.addQuestion')}
                        </button>
                    </div>
                </div>
            </section>

            <div className="flex justify-end space-x-4 pt-6">
                <button
                    type="button"
                    onClick={() => navigate('/admin/courses')}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                    {submitting ? t('courseDetail.processing') : t('common.save')}
                </button>
            </div>
        </form>
    );
};

export default AdminCourseForm;
