import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BookOpen, CheckCircle, Play, FileText, Award,
  ChevronRight, ChevronLeft, Target
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InteractiveLearningModule({ module, userEmail, onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const queryClient = useQueryClient();

  const sections = module.content_sections || [];
  const currentSectionData = sections[currentSection];
  const progress = (completedSections.length / sections.length) * 100;

  const saveProgressMutation = useMutation({
    mutationFn: async (data) => {
      const existing = await base44.entities.TrainingProgress.filter({
        user_email: userEmail,
        module_id: module.module_id
      });

      if (existing.length > 0) {
        return await base44.entities.TrainingProgress.update(existing[0].id, data);
      } else {
        return await base44.entities.TrainingProgress.create({
          user_email: userEmail,
          module_id: module.module_id,
          ...data
        });
      }
    }
  });

  const handleMarkComplete = () => {
    if (!completedSections.includes(currentSection)) {
      const updated = [...completedSections, currentSection];
      setCompletedSections(updated);
      
      saveProgressMutation.mutate({
        completed_sections: updated,
        progress_percentage: Math.round((updated.length / sections.length) * 100),
        status: updated.length === sections.length ? 'completed' : 'in_progress'
      });
    }
  };

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      handleMarkComplete();
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleQuizSubmit = () => {
    const quiz = module.quiz;
    let correct = 0;
    
    quiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_answer) {
        correct++;
      }
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    setQuizScore(score);

    if (score >= quiz.passing_score) {
      toast.success(`Quiz passed! Score: ${score}%`);
      if (onComplete) onComplete();
    } else {
      toast.error(`Quiz failed. Score: ${score}%. Passing: ${quiz.passing_score}%`);
    }

    saveProgressMutation.mutate({
      quiz_scores: [{
        attempt_date: new Date().toISOString(),
        score: correct,
        total_questions: quiz.questions.length
      }]
    });
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'quiz': return <Target className="h-4 w-4" />;
      case 'interactive': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-2">{module.module_name}</h2>
          <p className="text-blue-100 mb-4">{module.description}</p>
          <div className="flex gap-3">
            <Badge className="bg-white/20 text-white">
              {module.duration}
            </Badge>
            <Badge className="bg-white/20 text-white">
              {module.difficulty}
            </Badge>
            <Badge className="bg-white/20 text-white">
              {sections.length} Sections
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Your Progress</span>
            <span className="text-sm font-bold text-slate-900">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-slate-600 mt-1">
            {completedSections.length} of {sections.length} sections completed
          </div>
        </CardContent>
      </Card>

      {/* Current Section */}
      {currentSectionData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getSectionIcon(currentSectionData.content_type)}
                {currentSectionData.section_title}
              </CardTitle>
              <Badge variant="outline">
                Section {currentSection + 1} of {sections.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-slate max-w-none">
              <p>{currentSectionData.content}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Badge variant="outline">{currentSectionData.estimated_time}</Badge>
              {completedSections.includes(currentSection) && (
                <Badge className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            {/* Hands-on Exercises */}
            {module.hands_on_exercises?.[currentSection] && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Hands-On Exercise: {module.hands_on_exercises[currentSection].exercise_title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-700">
                    {module.hands_on_exercises[currentSection].description}
                  </p>
                  <div className="space-y-1">
                    {module.hands_on_exercises[currentSection].steps?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevSection}
                disabled={currentSection === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={handleMarkComplete}
                disabled={completedSections.includes(currentSection)}
                variant="outline"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
              <Button
                onClick={handleNextSection}
                disabled={currentSection === sections.length - 1}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Section */}
      {module.quiz && completedSections.length === sections.length && (
        <Card className="border-purple-300 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              {module.quiz.quiz_title}
            </CardTitle>
            <p className="text-sm text-slate-600">
              Passing score: {module.quiz.passing_score}%
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {module.quiz.questions.map((q, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <p className="font-medium text-slate-900 mb-3">
                    {idx + 1}. {q.question}
                  </p>
                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <Checkbox
                            checked={quizAnswers[idx] === option}
                            onCheckedChange={() => setQuizAnswers({ ...quizAnswers, [idx]: option })}
                          />
                          <label className="text-sm">{option}</label>
                        </div>
                      ))}
                    </div>
                  )}
                  {quizScore !== null && (
                    <div className={`mt-2 p-2 rounded text-sm ${
                      quizAnswers[idx] === q.correct_answer 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {quizAnswers[idx] === q.correct_answer ? '✓ Correct' : '✗ Incorrect'}
                      <p className="text-xs mt-1">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < module.quiz.questions.length || quizScore !== null}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Award className="h-4 w-4 mr-2" />
              Submit Quiz
            </Button>

            {quizScore !== null && (
              <Card className={quizScore >= module.quiz.passing_score ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}>
                <CardContent className="pt-4 text-center">
                  <p className="text-lg font-bold mb-1">
                    Your Score: {quizScore}%
                  </p>
                  <p className="text-sm text-slate-600">
                    {quizScore >= module.quiz.passing_score 
                      ? '🎉 Congratulations! You passed the quiz.'
                      : 'Please review the material and try again.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}