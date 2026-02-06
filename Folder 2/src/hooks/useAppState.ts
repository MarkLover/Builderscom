import { useState } from 'react';
import { mockProjects, mockEmployees, mockTasks, mockCompanyExpenses, mockExpenseCategories } from '@/data/mockData';

export const useAppState = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [viewingProject, setViewingProject] = useState<number | null>(null);
  const [projects, setProjects] = useState(mockProjects);
  const [employees, setEmployees] = useState(mockEmployees);
  const [tasks, setTasks] = useState(mockTasks);
  const [companyExpenses, setCompanyExpenses] = useState(mockCompanyExpenses);
  const [expenseCategories, setExpenseCategories] = useState(mockExpenseCategories);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isCompanyExpenseDialogOpen, setIsCompanyExpenseDialogOpen] = useState(false);
  const [isExpenseCategoryDialogOpen, setIsExpenseCategoryDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProjectExpenseDialogOpen, setIsProjectExpenseDialogOpen] = useState(false);
  const [isProjectIncomeDialogOpen, setIsProjectIncomeDialogOpen] = useState(false);
  const [selectedProjectForTransaction, setSelectedProjectForTransaction] = useState<number | null>(null);
  const [isStageExpenseDialogOpen, setIsStageExpenseDialogOpen] = useState(false);
  const [isStageIncomeDialogOpen, setIsStageIncomeDialogOpen] = useState(false);
  const [selectedStageForTransaction, setSelectedStageForTransaction] = useState<number | null>(null);
  const [viewingCategory, setViewingCategory] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
  const [showArchivedEmployees, setShowArchivedEmployees] = useState(false);

  const totalBudget = projects.filter(p => !p.archived).reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.filter(p => !p.archived).reduce((acc, p) => acc + p.spent, 0);
  const totalIncome = projects.filter(p => !p.archived).reduce((acc, p) => acc + p.income, 0);

  return {
    activeSection,
    setActiveSection,
    selectedProject,
    setSelectedProject,
    viewingProject,
    setViewingProject,
    projects,
    setProjects,
    employees,
    setEmployees,
    tasks,
    setTasks,
    companyExpenses,
    setCompanyExpenses,
    expenseCategories,
    setExpenseCategories,
    isProjectDialogOpen,
    setIsProjectDialogOpen,
    isStageDialogOpen,
    setIsStageDialogOpen,
    isEmployeeDialogOpen,
    setIsEmployeeDialogOpen,
    isTaskDialogOpen,
    setIsTaskDialogOpen,
    isExpenseDialogOpen,
    setIsExpenseDialogOpen,
    isCommentDialogOpen,
    setIsCommentDialogOpen,
    isCompanyExpenseDialogOpen,
    setIsCompanyExpenseDialogOpen,
    isExpenseCategoryDialogOpen,
    setIsExpenseCategoryDialogOpen,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isProjectExpenseDialogOpen,
    setIsProjectExpenseDialogOpen,
    isProjectIncomeDialogOpen,
    setIsProjectIncomeDialogOpen,
    selectedProjectForTransaction,
    setSelectedProjectForTransaction,
    isStageExpenseDialogOpen,
    setIsStageExpenseDialogOpen,
    isStageIncomeDialogOpen,
    setIsStageIncomeDialogOpen,
    selectedStageForTransaction,
    setSelectedStageForTransaction,
    viewingCategory,
    setViewingCategory,
    selectedStage,
    setSelectedStage,
    filterProject,
    setFilterProject,
    filterDate,
    setFilterDate,
    filterMinAmount,
    setFilterMinAmount,
    filterMaxAmount,
    setFilterMaxAmount,
    showArchivedEmployees,
    setShowArchivedEmployees,
    totalBudget,
    totalSpent,
    totalIncome
  };
};