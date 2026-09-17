export interface CourseResponseDto {
  id: string;
  professorId: string;
  professorName: string;
  title: string;
  description: string;
  category: string;
  price: number;
  isPublic: boolean;
  status: string;
  coverImageUrl?: string;
  createdAt: string;
  subjectsCount: number;
  enrollmentsCount: number;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  category: string;
  price: number;
  isPublic: boolean;
  coverImageUrl?: string;
}

export interface CreateSubjectDto {
  courseId: string;
  name: string;
  description: string;
}

export interface CreateTopicDto {
  subjectId: string;
  title: string;
  examBoard: string;
}

export interface StudySessionHierarchyDto {
  id: string;
  courseId: string;
  name: string;
  orderIndex: number;
  subjects?: SubjectHierarchyDto[];
}

export type CourseModuleDto = StudySessionHierarchyDto;

export interface SubjectHierarchyDto {
  id: string;
  courseId: string;
  moduleId?: string;
  sessionId?: string;
  module?: { id: string; name: string; orderIndex?: number };
  sessionName?: string;
  name: string;
  meta?: string;
  description: string;
  orderIndex: number;
  topics: TopicHierarchyDto[];
}

export interface TopicHierarchyDto {
  id: string;
  subjectId: string;
  title: string;
  examBoard: string;
  contentMarkdown?: string;
  orderIndex: number;
  topicContent?: any;
  topicDetail?: {
    id?: string;
    topicId?: string;
    title: string;
    summary: string;
    detail: string;
    peso?: string;
    examples?: { question: string; answer: string; application?: string }[];
    keyPoints?: string[];
    tips?: string[];
    usefulLinks?: { label: string; url: string; type: string; youtubeId?: string }[];
  };
  flashcards?: {
    id?: string;
    topicId?: string;
    frontText: string;
    backText: string;
    difficulty?: string;
  }[];
  questions?: {
    id?: string;
    topicId?: string;
    statement: string;
    optionsJson?: string;
    options?: string[];
    correctOptionIndex: number;
    explanation?: string;
    examBoard?: string;
  }[];
}

export interface CourseStudyPlan {
  id: string;
  professorId: string;
  professorName?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  isPublic: boolean;
  modules?: CourseModuleDto[];
  studySessions?: StudySessionHierarchyDto[];
  subjects: SubjectHierarchyDto[];
  studySchedules?: any[];
  simulatedTests?: any[];
}
