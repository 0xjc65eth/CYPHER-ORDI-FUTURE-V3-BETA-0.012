'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Play, CheckCircle, Clock, Trophy, Star, 
  Target, TrendingUp, BarChart3, DollarSign, Shield,
  Brain, Zap, Award, Users, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para o sistema de learning
interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // em minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  completed: boolean;
  progress: number; // 0-100
  content: {
    type: 'video' | 'text' | 'interactive' | 'quiz';
    data: string;
  };
  prerequisites?: string[];
  skills: string[];
  points: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalLessons: number;
  completedLessons: number;
  duration: number; // em horas
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  instructor: string;
  rating: number;
  students: number;
  lessons: Lesson[];
  certificate: boolean;
}

interface UserProgress {
  totalPoints: number;
  level: number;
  streak: number;
  completedCourses: number;
  skillBadges: string[];
  achievements: string[];
}

interface LearningHubProps {
  language: string;
}

// Dados de exemplo para cursos
const SAMPLE_COURSES: Course[] = [
  {
    id: 'smc-basics',
    title: 'Smart Money Concepts Fundamentals',
    description: 'Learn the core principles of institutional trading and market structure analysis',
    thumbnail: '📊',
    totalLessons: 8,
    completedLessons: 3,
    duration: 4,
    difficulty: 'beginner',
    category: 'Technical Analysis',
    instructor: 'CYPHER AI',
    rating: 4.9,
    students: 12450,
    certificate: true,
    lessons: [
      {
        id: 'smc-1',
        title: 'Introduction to Market Structure',
        description: 'Understanding how institutional traders move the market',
        duration: 25,
        difficulty: 'beginner',
        category: 'SMC',
        completed: true,
        progress: 100,
        content: { type: 'video', data: 'market-structure-intro' },
        skills: ['Market Structure', 'Trend Analysis'],
        points: 50
      },
      {
        id: 'smc-2', 
        title: 'Liquidity Zones and Order Blocks',
        description: 'Identifying where smart money places their orders',
        duration: 30,
        difficulty: 'beginner',
        category: 'SMC',
        completed: true,
        progress: 100,
        content: { type: 'interactive', data: 'liquidity-zones' },
        skills: ['Liquidity Analysis', 'Order Blocks'],
        points: 75
      },
      {
        id: 'smc-3',
        title: 'Fair Value Gaps (FVG)',
        description: 'Understanding price imbalances and how to trade them',
        duration: 35,
        difficulty: 'intermediate',
        category: 'SMC',
        completed: true,
        progress: 100,
        content: { type: 'video', data: 'fvg-analysis' },
        skills: ['FVG Trading', 'Price Action'],
        points: 100
      },
      {
        id: 'smc-4',
        title: 'Inducement and Manipulation',
        description: 'How institutions trap retail traders',
        duration: 40,
        difficulty: 'intermediate',
        category: 'SMC',
        completed: false,
        progress: 60,
        content: { type: 'interactive', data: 'inducement-patterns' },
        skills: ['Market Psychology', 'Trap Identification'],
        points: 125
      }
    ]
  },
  {
    id: 'risk-management',
    title: 'Professional Risk Management',
    description: 'Master the art of preserving capital and managing trading risk',
    thumbnail: '🛡️',
    totalLessons: 6,
    completedLessons: 0,
    duration: 3,
    difficulty: 'intermediate',
    category: 'Risk Management',
    instructor: 'Risk Expert',
    rating: 4.8,
    students: 8920,
    certificate: true,
    lessons: []
  },
  {
    id: 'trading-psychology',
    title: 'Trading Psychology Mastery',
    description: 'Develop the mental discipline required for successful trading',
    thumbnail: '🧠',
    totalLessons: 10,
    completedLessons: 1,
    duration: 5,
    difficulty: 'advanced',
    category: 'Psychology',
    instructor: 'Mind Coach',
    rating: 4.7,
    students: 6750,
    certificate: true,
    lessons: []
  },
  {
    id: 'crypto-fundamentals',
    title: 'Cryptocurrency Fundamentals',
    description: 'Complete guide to understanding Bitcoin, Ethereum and DeFi',
    thumbnail: '₿',
    totalLessons: 12,
    completedLessons: 5,
    duration: 6,
    difficulty: 'beginner',
    category: 'Cryptocurrency',
    instructor: 'Crypto Expert',
    rating: 4.9,
    students: 15600,
    certificate: true,
    lessons: []
  }
];

// Componente de estatísticas do usuário
const UserStats: React.FC<{ progress: UserProgress }> = ({ progress }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-600">Level</p>
            <p className="text-xl font-bold">{progress.level}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-purple-500" />
          <div>
            <p className="text-sm text-gray-600">Points</p>
            <p className="text-xl font-bold">{progress.totalPoints.toLocaleString()}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm text-gray-600">Streak</p>
            <p className="text-xl font-bold">{progress.streak} days</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-xl font-bold">{progress.completedCourses}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Componente de card de curso
const CourseCard: React.FC<{ 
  course: Course; 
  onClick: () => void;
}> = ({ course, onClick }) => {
  const progressPercentage = (course.completedLessons / course.totalLessons) * 100;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{course.thumbnail}</div>
            <div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
            </div>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getDifficultyColor(course.difficulty)
          )}>
            {course.difficulty}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration}h
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {course.rating}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.students.toLocaleString()}
              </span>
            </div>
            
            {course.certificate && (
              <span className="flex items-center gap-1 text-blue-600">
                <Award className="h-4 w-4" />
                Certificate
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de lição
const LessonItem: React.FC<{ 
  lesson: Lesson; 
  onClick: () => void;
}> = ({ lesson, onClick }) => {
  const getStatusIcon = () => {
    if (lesson.completed) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (lesson.progress > 0) return <Play className="h-5 w-5 text-blue-500" />;
    return <Play className="h-5 w-5 text-gray-400" />;
  };
  
  const getContentIcon = () => {
    switch (lesson.content.type) {
      case 'video': return '🎥';
      case 'text': return '📖';
      case 'interactive': return '🎮';
      case 'quiz': return '❓';
      default: return '📝';
    }
  };
  
  return (
    <div 
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {getStatusIcon()}
        <div className="flex items-center gap-2">
          <span className="text-lg">{getContentIcon()}</span>
          <div>
            <h4 className="font-medium">{lesson.title}</h4>
            <p className="text-sm text-gray-600">{lesson.description}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{lesson.duration}min</span>
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          {lesson.points}
        </span>
        {lesson.progress > 0 && lesson.progress < 100 && (
          <Progress value={lesson.progress} className="w-16 h-2" />
        )}
      </div>
    </div>
  );
};

// Componente principal
const LearningHubSystem: React.FC<LearningHubProps> = ({ language }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 2450,
    level: 8,
    streak: 12,
    completedCourses: 3,
    skillBadges: ['SMC Master', 'Risk Expert', 'Chart Reader'],
    achievements: ['Early Adopter', 'Knowledge Seeker', 'Consistent Learner']
  });
  
  const [activeTab, setActiveTab] = useState<'courses' | 'progress' | 'achievements'>('courses');
  
  // Filtrar cursos por categoria
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', 'Technical Analysis', 'Risk Management', 'Psychology', 'Cryptocurrency'];
  
  const filteredCourses = selectedCategory === 'all' 
    ? SAMPLE_COURSES 
    : SAMPLE_COURSES.filter(course => course.category === selectedCategory);
  
  // Simular completion de lição
  const completeLesson = (lessonId: string) => {
    if (selectedCourse) {
      const updatedLessons = selectedCourse.lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, completed: true, progress: 100 }
          : lesson
      );
      
      const updatedCourse = { 
        ...selectedCourse, 
        lessons: updatedLessons,
        completedLessons: updatedLessons.filter(l => l.completed).length
      };
      
      setSelectedCourse(updatedCourse);
      
      // Atualizar pontos do usuário
      const lesson = selectedCourse.lessons.find(l => l.id === lessonId);
      if (lesson && !lesson.completed) {
        setUserProgress(prev => ({
          ...prev,
          totalPoints: prev.totalPoints + lesson.points
        }));
      }
    }
  };
  
  if (selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedLesson(null)}
            className="mb-4"
          >
            ← Back to Course
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl">
              {selectedLesson.content.type === 'video' ? '🎥' : 
               selectedLesson.content.type === 'interactive' ? '🎮' : '📖'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
              <p className="text-gray-600">{selectedLesson.description}</p>
            </div>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {selectedLesson.content.type === 'video' ? '▶️' : '🎯'}
                </div>
                <p className="text-gray-600">
                  {selectedLesson.content.type === 'video' ? 'Video Content' : 'Interactive Content'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Duration: {selectedLesson.duration} minutes
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {selectedLesson.skills.map(skill => (
                  <span 
                    key={skill}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              
              <Button 
                onClick={() => completeLesson(selectedLesson.id)}
                disabled={selectedLesson.completed}
                className="flex items-center gap-2"
              >
                {selectedLesson.completed ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    Complete Lesson
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (selectedCourse) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCourse(null)}
            className="mb-4"
          >
            ← Back to Courses
          </Button>
          
          <div className="flex items-start gap-6">
            <div className="text-6xl">{selectedCourse.thumbnail}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{selectedCourse.title}</h1>
              <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {selectedCourse.totalLessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedCourse.duration} hours
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {selectedCourse.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {selectedCourse.students.toLocaleString()} students
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Course Progress</span>
                  <span>{selectedCourse.completedLessons}/{selectedCourse.totalLessons}</span>
                </div>
                <Progress 
                  value={(selectedCourse.completedLessons / selectedCourse.totalLessons) * 100} 
                  className="h-3"
                />
              </div>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedCourse.lessons.map(lesson => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => setSelectedLesson(lesson)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Hub</h1>
        <p className="text-gray-600">Master the art of crypto trading with our comprehensive courses</p>
      </div>
      
      <UserStats progress={userProgress} />
      
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="mt-6">
          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category === 'all' ? 'All Courses' : category}
              </Button>
            ))}
          </div>
          
          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => setSelectedCourse(course)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">
                    {userProgress.streak}
                  </div>
                  <p className="text-gray-600">days in a row</p>
                  <div className="mt-4 flex justify-center gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-4 h-4 rounded-full",
                          i < userProgress.streak ? "bg-orange-500" : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skill Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userProgress.skillBadges.map(badge => (
                    <div key={badge} className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userProgress.achievements.map(achievement => (
              <Card key={achievement} className="text-center p-6">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{achievement}</h3>
                <p className="text-sm text-gray-600">Achievement unlocked!</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningHubSystem;