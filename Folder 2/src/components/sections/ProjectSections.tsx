import { Dashboard } from './projects/Dashboard';
import { ProjectsList } from './projects/ProjectsList';
import { ExpensesView } from './projects/ExpensesView';
import { FinancesView } from './projects/FinancesView';
import { ProjectDetail } from './projects/ProjectDetail';
import { ProjectDetailNew } from './projects/ProjectDetailNew';

interface ProjectSectionsProps {
  projects: any[];
  companyExpenses: any[];
  expenseCategories: any[];
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  filterProject: string;
  filterDate: string;
  filterMinAmount: string;
  filterMaxAmount: string;
  isProjectDialogOpen: boolean;
  isStageDialogOpen: boolean;
  isExpenseDialogOpen: boolean;
  isCommentDialogOpen: boolean;
  isCompanyExpenseDialogOpen: boolean;
  isExpenseCategoryDialogOpen: boolean;
  isPaymentDialogOpen: boolean;
  isProjectExpenseDialogOpen: boolean;
  isProjectIncomeDialogOpen: boolean;
  selectedProjectForTransaction: number | null;
  isStageExpenseDialogOpen: boolean;
  isStageIncomeDialogOpen: boolean;
  selectedStageForTransaction: number | null;
  selectedStage: number | null;
  viewingProject: number | null;
  selectedProject: number | null;
  viewingCategory: number | null;
  setActiveSection: (section: string) => void;
  setViewingProject: (id: number | null) => void;
  setViewingCategory: (id: number | null) => void;
  setFilterProject: (value: string) => void;
  setFilterDate: (value: string) => void;
  setFilterMinAmount: (value: string) => void;
  setFilterMaxAmount: (value: string) => void;
  setIsProjectDialogOpen: (open: boolean) => void;
  setIsStageDialogOpen: (open: boolean) => void;
  setIsExpenseDialogOpen: (open: boolean) => void;
  setIsCommentDialogOpen: (open: boolean) => void;
  setIsCompanyExpenseDialogOpen: (open: boolean) => void;
  setIsExpenseCategoryDialogOpen: (open: boolean) => void;
  setIsPaymentDialogOpen: (open: boolean) => void;
  setIsProjectExpenseDialogOpen: (open: boolean) => void;
  setIsProjectIncomeDialogOpen: (open: boolean) => void;
  setSelectedProjectForTransaction: (id: number | null) => void;
  setIsStageExpenseDialogOpen: (open: boolean) => void;
  setIsStageIncomeDialogOpen: (open: boolean) => void;
  setSelectedStageForTransaction: (id: number | null) => void;
  setSelectedStage: (id: number | null) => void;
  setSelectedProject: (id: number | null) => void;
  handleAddProject: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddStage: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddComment: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddCompanyExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddExpenseCategory: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddPayment: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddProjectExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddProjectIncome: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddStageExpense: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAddStageIncome: (e: React.FormEvent<HTMLFormElement>) => void;
  handleArchiveProject: (id: number) => void;
  handleUnarchiveProject: (id: number) => void;
  getAllExpenses: () => any[];
  getFilteredExpenses: () => any[];
}

export const renderDashboard = (props: ProjectSectionsProps) => {
  return <Dashboard 
    projects={props.projects}
    totalBudget={props.totalBudget}
    totalSpent={props.totalSpent}
    totalIncome={props.totalIncome}
    setActiveSection={props.setActiveSection}
    setViewingProject={props.setViewingProject}
    getAllExpenses={props.getAllExpenses}
  />;
};

export const renderProjects = (props: ProjectSectionsProps) => {
  return <ProjectsList 
    projects={props.projects}
    isProjectDialogOpen={props.isProjectDialogOpen}
    setIsProjectDialogOpen={props.setIsProjectDialogOpen}
    handleAddProject={props.handleAddProject}
    setViewingProject={props.setViewingProject}
    setActiveSection={props.setActiveSection}
    handleArchiveProject={props.handleArchiveProject}
    handleUnarchiveProject={props.handleUnarchiveProject}
    isProjectExpenseDialogOpen={props.isProjectExpenseDialogOpen}
    setIsProjectExpenseDialogOpen={props.setIsProjectExpenseDialogOpen}
    isProjectIncomeDialogOpen={props.isProjectIncomeDialogOpen}
    setIsProjectIncomeDialogOpen={props.setIsProjectIncomeDialogOpen}
    selectedProjectForTransaction={props.selectedProjectForTransaction}
    setSelectedProjectForTransaction={props.setSelectedProjectForTransaction}
    handleAddProjectExpense={props.handleAddProjectExpense}
    handleAddProjectIncome={props.handleAddProjectIncome}
  />;
};

export const renderExpenses = (props: ProjectSectionsProps) => {
  return <ExpensesView 
    projects={props.projects}
    filterProject={props.filterProject}
    filterDate={props.filterDate}
    filterMinAmount={props.filterMinAmount}
    filterMaxAmount={props.filterMaxAmount}
    setFilterProject={props.setFilterProject}
    setFilterDate={props.setFilterDate}
    setFilterMinAmount={props.setFilterMinAmount}
    setFilterMaxAmount={props.setFilterMaxAmount}
    getFilteredExpenses={props.getFilteredExpenses}
  />;
};

export const renderFinances = (props: ProjectSectionsProps) => {
  return <FinancesView 
    projects={props.projects}
    companyExpenses={props.companyExpenses}
    expenseCategories={props.expenseCategories}
    selectedProject={props.selectedProject}
    viewingCategory={props.viewingCategory}
    setSelectedProject={props.setSelectedProject}
    setViewingCategory={props.setViewingCategory}
    isStageDialogOpen={props.isStageDialogOpen}
    setIsStageDialogOpen={props.setIsStageDialogOpen}
    isCompanyExpenseDialogOpen={props.isCompanyExpenseDialogOpen}
    setIsCompanyExpenseDialogOpen={props.setIsCompanyExpenseDialogOpen}
    isExpenseCategoryDialogOpen={props.isExpenseCategoryDialogOpen}
    setIsExpenseCategoryDialogOpen={props.setIsExpenseCategoryDialogOpen}
    isPaymentDialogOpen={props.isPaymentDialogOpen}
    setIsPaymentDialogOpen={props.setIsPaymentDialogOpen}
    handleAddStage={props.handleAddStage}
    handleAddCompanyExpense={props.handleAddCompanyExpense}
    handleAddExpenseCategory={props.handleAddExpenseCategory}
    handleAddPayment={props.handleAddPayment}
  />;
};

export const renderProjectDetail = (props: ProjectSectionsProps) => {
  return <ProjectDetailNew 
    projects={props.projects}
    viewingProject={props.viewingProject}
    isStageDialogOpen={props.isStageDialogOpen}
    setIsStageDialogOpen={props.setIsStageDialogOpen}
    isStageExpenseDialogOpen={props.isStageExpenseDialogOpen}
    setIsStageExpenseDialogOpen={props.setIsStageExpenseDialogOpen}
    isStageIncomeDialogOpen={props.isStageIncomeDialogOpen}
    setIsStageIncomeDialogOpen={props.setIsStageIncomeDialogOpen}
    selectedStageForTransaction={props.selectedStageForTransaction}
    setSelectedStageForTransaction={props.setSelectedStageForTransaction}
    setActiveSection={props.setActiveSection}
    handleAddStage={props.handleAddStage}
    handleAddStageExpense={props.handleAddStageExpense}
    handleAddStageIncome={props.handleAddStageIncome}
  />;
};