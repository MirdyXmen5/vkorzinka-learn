import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const TestView = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionId: answerId }
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recipientName, setRecipientName] = useState("");
    const [certificateIssued, setCertificateIssued] = useState(false);
    const [submittingName, setSubmittingName] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await api.get(`courses/${id}/`);
                setCourse(response.data);
                if (!response.data.test) {
                    setError(t('test.noTest'));
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch course data:", err);
                setError(t('test.error'));
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id, t]);

    const handleAnswerSelect = (questionId, answerId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const handleSubmit = async () => {
        // Validation: Ensure all questions are answered
        if (course.test.questions.length > Object.keys(answers).length) {
            alert(t('test.validationAns'));
            return;
        }

        try {
            const response = await api.post(`courses/${id}/submit_test/`, {
                answers: answers
            });
            setResult(response.data);
        } catch (err) {
            console.error("Failed to submit test:", err);
            alert("Failed to submit test. Please try again.");
        }
    };

    const handleIssueCertificate = async () => {
        if (!recipientName.trim()) {
            alert(t('test.validationName'));
            return;
        }
        setSubmittingName(true);
        try {
            await api.post(`courses/${id}/issue_certificate/`, { recipient_name: recipientName });
            setCertificateIssued(true);
        } catch (err) {
            console.error("Failed to issue certificate:", err);
            alert("Failed to generate certificate. Please try again.");
        } finally {
            setSubmittingName(false);
        }
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto mt-8">
                <strong className="font-bold">{t('common.error')}</strong> {error}
                <button onClick={() => navigate(`/courses/${id}`)} className="block mt-2 underline">{t('courseDetail.backToCourses')}</button>
            </div>
        );
    }

    if (result) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className={`bg-white shadow rounded-lg p-8 text-center border-t-4 ${result.passed ? 'border-green-500' : 'border-red-500'}`}>
                    <h2 className={`text-3xl font-bold mb-4 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {result.passed ? t('test.congratulations') : t('test.failed')}
                    </h2>

                    <div className="text-6xl font-extrabold text-gray-800 mb-6">
                        {Math.round(result.score)}%
                    </div>

                    <p className="text-gray-600 mb-8 text-lg">
                        {t('test.scoreResult', { correct: result.correct_count, total: result.total_questions })}
                        <br />
                        {t('test.passScoreRequired', { score: result.pass_score })}
                    </p>

                    {result.passed ? (
                        <div className="space-y-6">
                            {!certificateIssued ? (
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                    <h3 className="text-xl font-bold text-green-800 mb-4">{t('test.fullPassMessage')}</h3>
                                    <p className="text-gray-700 mb-4">
                                        {t('test.enteringName')}
                                    </p>
                                    <div className="max-w-md mx-auto space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                id="recipientName"
                                                className="shadow-sm focus:ring-[#5cad2d] focus:border-[#5cad2d] block w-full sm:text-sm border-gray-300 rounded-md p-3"
                                                placeholder={t('test.fullNamePlaceholder')}
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={handleIssueCertificate}
                                            disabled={submittingName || !recipientName.trim()}
                                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${submittingName || !recipientName.trim()
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-[#5cad2d] hover:bg-[#4a8c24]'
                                                }`}
                                        >
                                            {submittingName ? t('test.generatingBtn') : t('test.generateBtn')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-100 p-4 rounded-md text-green-800 font-semibold">
                                        <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t('test.successCert')}
                                    </div>
                                    <p className="text-gray-600">{t('test.successCertDesc')}</p>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        {t('test.goToProfile')}
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="ml-4 inline-block px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        {t('test.returnDashboard')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                        >
                            {t('test.retake')}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">{course.test.title}</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {t('test.passScoreLabel', { score: course.test.pass_score })} | {t('test.totalQuestionsLabel', { count: course.test.questions.length })}
                    </p>
                </div>

                <div className="p-6 space-y-8">
                    {course.test.questions.map((question, index) => (
                        <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {index + 1}. {question.text}
                            </h3>
                            <div className="space-y-3 pl-4">
                                {question.answers.map((answer) => (
                                    <label key={answer.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={answer.id}
                                            checked={answers[question.id] === answer.id}
                                            onChange={() => handleAnswerSelect(question.id, answer.id)}
                                            className="h-4 w-4 text-[#5cad2d] focus:ring-[#5cad2d] border-gray-300"
                                        />
                                        <span className="text-gray-700">{answer.text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={course.test.questions.length > Object.keys(answers).length}
                        className={`px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors
                            ${course.test.questions.length > Object.keys(answers).length
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#5cad2d] hover:bg-[#4a8c24] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5cad2d]'
                            }`}
                    >
                        {t('test.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestView;
