from rest_framework import serializers
from .models import Course, CourseContent, Test, Question, Answer, Enrollment

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'answers']

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Test
        fields = ['id', 'title', 'pass_score', 'questions']

class CourseContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseContent
        fields = ['id', 'content_type', 'title', 'text_content', 'image_file', 'image_url', 'video_url', 'file_url', 'order']

class CourseSerializer(serializers.ModelSerializer):
    contents = CourseContentSerializer(many=True, required=False)
    test = TestSerializer(required=False, allow_null=True)
    is_enrolled = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'created_at', 'contents', 'test', 'is_enrolled', 'is_completed']

    def get_is_enrolled(self, obj):
        user = self.context['request'].user
        if user and user.is_authenticated:
            return Enrollment.objects.filter(user=user, course=obj).exists()
        return False

    def get_is_completed(self, obj):
        user = self.context['request'].user
        if user and user.is_authenticated:
            return Enrollment.objects.filter(user=user, course=obj, is_completed=True).exists()
        return False

    def create(self, validated_data):
        contents_data = validated_data.pop('contents', [])
        test_data = validated_data.pop('test', None)
        course = Course.objects.create(**validated_data)
        
        for content_data in contents_data:
            CourseContent.objects.create(course=course, **content_data)
            
        if test_data:
            questions_data = test_data.pop('questions', [])
            test = Test.objects.create(course=course, **test_data)
            for question_data in questions_data:
                answers_data = question_data.pop('answers', [])
                question = Question.objects.create(test=test, **question_data)
                for answer_data in answers_data:
                    Answer.objects.create(question=question, **answer_data)
        
        return course

    def update(self, instance, validated_data):
        contents_data = validated_data.pop('contents', None)
        test_data = validated_data.pop('test', None)
        
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.thumbnail = validated_data.get('thumbnail', instance.thumbnail)
        instance.save()
        
        if contents_data is not None:
            instance.contents.all().delete()
            for content_data in contents_data:
                CourseContent.objects.create(course=instance, **content_data)
        
        if test_data is not None:
            if hasattr(instance, 'test'):
                instance.test.delete()
            
            questions_data = test_data.pop('questions', [])
            test = Test.objects.create(course=instance, **test_data)
            for question_data in questions_data:
                answers_data = question_data.pop('answers', [])
                question = Question.objects.create(test=test, **question_data)
                for answer_data in answers_data:
                    Answer.objects.create(question=question, **answer_data)
        
        return instance

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_thumbnail = serializers.ImageField(source='course.thumbnail', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_title', 'course_thumbnail', 'enrolled_at', 'is_completed', 'completed_at']
