import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Circle, Clock, BookOpen, Target, ArrowRight, ArrowLeft, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function InteractiveTrainingViewer({ module, progress, onProgressUpdate }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  const sections = module.content?.sections || [];
  const quiz = module.content?.assessment_quiz || [];
  const totalSections = sections.length;

  useEffect(() => {
    // Track time spent
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 60000);
      if (onProgressUpdate && timeSpent > 0) {
        onProgressUpdate({
          time_spent_minutes: (progress?.time_spent_minutes || 0) + timeSpent
        });
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  const handleSectionComplete = () => {
    const updatedSections = [...(progress?.completed_sections || [])];
    if (!updatedSections.includes(currentSection.toString())) {
      updatedSections.push(currentSection.toString());
    }

    const newProgress = Math.floor((updatedSections.length / totalSections) * 100);

    if (onProgressUpdate) {
      onProgressUpdate({
        completed_sections: updatedSections,
        progress_percentage: newProgress,
        status: newProgress === 100 ? 'completed' : 'in_progress'
      });
    }

    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }

    toast.success('Section completed!');
  };

  const handleQuizSubmit = () => {
    const score = quiz.reduce((acc, q, idx) => {
      return acc + (quizAnswers[idx] === q.correct_answer ? 1 : 0);
    }, 0);

    const quizResult = {
      attempt_date: new Date().toISOString(),
      score: score,
      total_questions: quiz.length
    };

    if (onProgressUpdate) {
      onProgressUpdate({
        quiz_scores: [...(progress?.quiz_scores || []), quizResult],
        status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      });
    }

    setQuizSubmitted(true);
    toast.success(`Quiz completed! Score: ${score}/${quiz.length}`);
  };

  const currentSectionData = sections[currentSection];
  const isSectionComplete = progress?.completed_sections?.includes(currentSection.toString());

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Overall Progress</span>
              <span className="font-semibold text-slate-900">{progress?.progress_percentage || 0}%</span>
            </div>
            <Progress value={progress?.progress_percentage || 0} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {progress?.time_spent_minutes || 0} min
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {progress?.completed_sections?.length || 0}/{totalSections} sections
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!showQuiz ? (
        <>
          {/* Section Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sections.map((section, idx) => {
              const isComplete = progress?.completed_sections?.includes(idx.toString());
              const isCurrent = idx === currentSection;
              
              return (
                <Button
                  key={idx}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSection(idx)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  Section {idx + 1}
                </Button>
              );
            })}
          </div>

          {/* Current Section Content */}
          {currentSectionData && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentSectionData.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        Section {currentSection + 1} of {totalSections}
                      </Badge>
                      {isSectionComplete && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Content */}
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{currentSectionData.content}</ReactMarkdown>
                </div>

                {/* Examples */}
                {currentSectionData.examples?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Examples
                    </h4>
                    <div className="space-y-2">
                      {currentSectionData.examples.map((example, idx) => (
                        <div key={idx} className="text-sm text-blue-800">
                          • {example}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Exercises */}
                {currentSectionData.exercises?.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-3">Practice Exercises</h4>
                    <div className="space-y-4">
                      {currentSectionData.exercises.map((exercise, idx) => (
                        <div key={idx} className="bg-white rounded p-4">
                          <p className="font-medium text-slate-900 mb-2">{exercise.question}</p>
                          {exercise.type === 'multiple_choice' && (
                            <RadioGroup
                              value={exerciseAnswers[`${currentSection}-${idx}`]}
                              onValueChange={(val) => setExerciseAnswers({
                                ...exerciseAnswers,
                                [`${currentSection}-${idx}`]: val
                              })}
                            >
                              {exercise.options?.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} id={`ex-${idx}-${optIdx}`} />
                                  <Label htmlFor={`ex-${idx}-${optIdx}`}>{option}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}
                          {exercise.type === 'short_answer' && (
                            <Textarea
                              value={exerciseAnswers[`${currentSection}-${idx}`] || ''}
                              onChange={(e) => setExerciseAnswers({
                                ...exerciseAnswers,
                                [`${currentSection}-${idx}`]: e.target.value
                              })}
                              placeholder="Your answer..."
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleSectionComplete}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {currentSection === totalSections - 1 ? 'Start Final Quiz' : 'Complete & Next'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Final Assessment Quiz */
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Award className="h-6 w-6 text-purple-600" />
              Final Assessment Quiz
            </CardTitle>
            <p className="text-sm text-slate-600">
              Test your understanding of the material covered in this training module
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {quiz.map((question, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-slate-900 mb-3">
                  {idx + 1}. {question.question}
                </p>
                <RadioGroup
                  value={quizAnswers[idx]}
                  onValueChange={(val) => setQuizAnswers({ ...quizAnswers, [idx]: val })}
                  disabled={quizSubmitted}
                >
                  {question.options?.map((option, optIdx) => {
                    const isCorrect = option === question.correct_answer;
                    const isSelected = quizAnswers[idx] === option;
                    
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center space-x-2 p-2 rounded ${
                          quizSubmitted && isSelected
                            ? isCorrect
                              ? 'bg-green-100 border border-green-300'
                              : 'bg-red-100 border border-red-300'
                            : ''
                        }`}
                      >
                        <RadioGroupItem value={option} id={`q-${idx}-${optIdx}`} />
                        <Label htmlFor={`q-${idx}-${optIdx}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                        {quizSubmitted && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
                {quizSubmitted && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-900">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}

            {!quizSubmitted ? (
              <Button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < quiz.length}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Submit Quiz
              </Button>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Training Module Completed!
                  </h3>
                  <p className="text-green-800">
                    Score: {progress?.quiz_scores?.[progress.quiz_scores.length - 1]?.score}/{quiz.length}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}