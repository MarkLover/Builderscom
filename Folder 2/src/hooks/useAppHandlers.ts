import { useToast } from '@/hooks/use-toast';
import { canAddItem } from '@/utils/accountLimits';

interface UseAppHandlersProps {
  user: any;
  projects: any[];
  setProjects: (projects: any[]) => void;
  employees: any[];
  setEmployees: (employees: any[]) => void;
  tasks: any[];
  setTasks: (tasks: any[]) => void;
  companyExpenses: any[];
  setCompanyExpenses: (expenses: any[]) => void;
  expenseCategories: any[];
  setExpenseCategories: (categories: any[]) => void;
  viewingProject: number | null;
  selectedStage: number | null;
  viewingCategory: number | null;
  setIsProjectDialogOpen: (open: boolean) => void;
  setIsStageDialogOpen: (open: boolean) => void;
  setIsEmployeeDialogOpen: (open: boolean) => void;
  setIsTaskDialogOpen: (open: boolean) => void;
  setIsExpenseDialogOpen: (open: boolean) => void;
  setIsCommentDialogOpen: (open: boolean) => void;
  setIsCompanyExpenseDialogOpen: (open: boolean) => void;
  setIsExpenseCategoryDialogOpen: (open: boolean) => void;
  setIsPaymentDialogOpen: (open: boolean) => void;
  setIsProjectExpenseDialogOpen: (open: boolean) => void;
  setIsProjectIncomeDialogOpen: (open: boolean) => void;
  selectedProjectForTransaction: number | null;
  setSelectedProjectForTransaction: (id: number | null) => void;
  setIsStageExpenseDialogOpen: (open: boolean) => void;
  setIsStageIncomeDialogOpen: (open: boolean) => void;
  selectedStageForTransaction: number | null;
  setSelectedStageForTransaction: (id: number | null) => void;
  filterProject: string;
  filterDate: string;
  filterMinAmount: string;
  filterMaxAmount: string;
}

export const useAppHandlers = (props: UseAppHandlersProps) => {
  const { toast } = useToast();

  const handleArchiveProject = (projectId: number) => {
    props.setProjects(props.projects.map(p => 
      p.id === projectId ? { ...p, archived: true } : p
    ));
    toast({ title: 'Объект архивирован', description: 'Объект перемещён в архив' });
  };

  const handleUnarchiveProject = (projectId: number) => {
    props.setProjects(props.projects.map(p => 
      p.id === projectId ? { ...p, archived: false } : p
    ));
    toast({ title: 'Объект восстановлен', description: 'Объект возвращён из архива' });
  };

  const handleArchiveEmployee = (employeeId: number) => {
    props.setEmployees(props.employees.map(e => 
      e.id === employeeId ? { ...e, archived: true } : e
    ));
    toast({ title: 'Сотрудник архивирован', description: 'Сотрудник перемещён в архив' });
  };

  const handleUnarchiveEmployee = (employeeId: number) => {
    props.setEmployees(props.employees.map(e => 
      e.id === employeeId ? { ...e, archived: false } : e
    ));
    toast({ title: 'Сотрудник восстановлен', description: 'Сотрудник возвращён из архива' });
  };

  const handleAddProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const currentActiveProjects = props.projects.filter(p => !p.archived).length;
    const check = canAddItem(
      props.user.accountType,
      props.user.subscriptionActive,
      currentActiveProjects,
      'projects'
    );
    
    if (!check.allowed) {
      toast({ 
        title: 'Достигнут лимит', 
        description: check.message,
        variant: 'destructive' 
      });
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const newProject = {
      id: props.projects.length + 1,
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      budget: Number(formData.get('budget')),
      spent: 0,
      income: 0,
      materials: 0,
      labor: 0,
      other: 0,
      archived: false,
      comments: [],
      stages: []
    };
    props.setProjects([...props.projects, newProject]);
    props.setIsProjectDialogOpen(false);
    toast({ title: 'Объект добавлен', description: `${newProject.name} успешно создан` });
  };

  const handleAddStage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = Number(formData.get('projectId'));
    const newStage = {
      id: Date.now(),
      name: formData.get('stageName') as string,
      budget: Number(formData.get('budget')) || 0,
      spent: 0,
      income: 0,
      materials: 0,
      labor: 0,
      other: 0,
      expenses: [],
      incomes: []
    };
    props.setProjects(props.projects.map(p => 
      p.id === projectId ? { ...p, stages: [...p.stages, newStage] } : p
    ));
    props.setIsStageDialogOpen(false);
    toast({ title: 'Этап добавлен', description: `Этап "${newStage.name}" создан` });
  };

  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const currentActiveEmployees = props.employees.filter(emp => !emp.archived).length;
    const check = canAddItem(
      props.user.accountType,
      props.user.subscriptionActive,
      currentActiveEmployees,
      'employees'
    );
    
    if (!check.allowed) {
      toast({ 
        title: 'Достигнут лимит', 
        description: check.message,
        variant: 'destructive' 
      });
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const newEmployee = {
      id: props.employees.length + 1,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      phone: formData.get('phone') as string || '',
      telegram: formData.get('telegram') as string || '',
      whatsapp: formData.get('whatsapp') as string || '',
      max: formData.get('max') as string || '',
      tasks: 0,
      archived: false
    };
    props.setEmployees([...props.employees, newEmployee]);
    props.setIsEmployeeDialogOpen(false);
    toast({ title: 'Сотрудник добавлен', description: `${newEmployee.name} добавлен в команду` });
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask = {
      id: props.tasks.length + 1,
      title: formData.get('title') as string,
      project: formData.get('project') as string,
      assignee: formData.get('assignee') as string,
      status: 'Ожидает'
    };
    props.setTasks([...props.tasks, newTask]);
    props.setIsTaskDialogOpen(false);
    toast({ title: 'Задача создана', description: `"${newTask.title}" добавлена` });
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = props.viewingProject;
    const stageId = props.selectedStage;
    const files = (e.currentTarget.elements.namedItem('receipt') as HTMLInputElement).files;
    const receiptUrl = files && files.length > 0 ? URL.createObjectURL(files[0]) : null;
    
    const newExpense = {
      id: Date.now(),
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      type: formData.get('type') as string,
      date: new Date().toISOString().split('T')[0],
      receipt: receiptUrl
    };

    props.setProjects(props.projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          stages: p.stages.map(s => {
            if (s.id === stageId) {
              const updatedExpenses = [...s.expenses, newExpense];
              const materials = updatedExpenses.filter(e => e.type === 'materials').reduce((sum, e) => sum + e.amount, 0);
              const labor = updatedExpenses.filter(e => e.type === 'labor').reduce((sum, e) => sum + e.amount, 0);
              const other = updatedExpenses.filter(e => e.type === 'other').reduce((sum, e) => sum + e.amount, 0);
              return { ...s, expenses: updatedExpenses, materials, labor, other, spent: materials + labor + other };
            }
            return s;
          })
        };
      }
      return p;
    }));

    props.setIsExpenseDialogOpen(false);
    toast({ title: 'Расход добавлен', description: `Расход на ${newExpense.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ добавлен` });
  };

  const handleAddComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = props.viewingProject;
    
    const newComment = {
      id: Date.now(),
      text: formData.get('comment') as string,
      date: new Date().toISOString().split('T')[0],
      author: 'Алексей Петров'
    };

    props.setProjects(props.projects.map(p => 
      p.id === projectId ? { ...p, comments: [...p.comments, newComment] } : p
    ));

    props.setIsCommentDialogOpen(false);
    toast({ title: 'Комментарий добавлен', description: 'Комментарий успешно создан' });
  };

  const handleAddCompanyExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = (e.currentTarget.elements.namedItem('receipt') as HTMLInputElement).files;
    const receiptUrl = files && files.length > 0 ? URL.createObjectURL(files[0]) : null;
    
    const newExpense = {
      id: Date.now(),
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      date: formData.get('date') as string || new Date().toISOString().split('T')[0],
      receipt: receiptUrl
    };

    props.setCompanyExpenses([...props.companyExpenses, newExpense]);
    props.setIsCompanyExpenseDialogOpen(false);
    toast({ title: 'Расход компании добавлен', description: `Расход на ${newExpense.amount.toLocaleString()} ₽ добавлен` });
  };

  const handleAddExpenseCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newCategory = {
      id: Date.now(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      amount: Number(formData.get('amount')) || 0,
      description: formData.get('description') as string,
      payments: []
    };

    props.setExpenseCategories([...props.expenseCategories, newCategory]);
    props.setIsExpenseCategoryDialogOpen(false);
    toast({ title: 'Статья расходов создана', description: `"${newCategory.name}" успешно добавлена` });
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = (e.currentTarget.elements.namedItem('receipt') as HTMLInputElement).files;
    const receiptUrl = files && files.length > 0 ? URL.createObjectURL(files[0]) : null;
    const categoryId = props.viewingCategory;
    
    const newPayment = {
      id: Date.now(),
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string || new Date().toISOString().split('T')[0],
      receipt: receiptUrl
    };

    props.setExpenseCategories(props.expenseCategories.map(cat => 
      cat.id === categoryId ? { ...cat, payments: [...cat.payments, newPayment] } : cat
    ));

    props.setIsPaymentDialogOpen(false);
    toast({ title: 'Платёж добавлен', description: `Платёж на ${newPayment.amount.toLocaleString()} ₽ добавлен` });
  };

  const getAllExpenses = () => {
    const allExpenses: Array<{
      id: number;
      description: string;
      amount: number;
      type: string;
      receipt: string | null;
      projectName: string;
      projectId: number;
      stageName: string;
      date: string;
    }> = [];

    props.projects.forEach(project => {
      project.stages.forEach(stage => {
        stage.expenses.forEach(expense => {
          allExpenses.push({
            ...expense,
            projectName: project.name,
            projectId: project.id,
            stageName: stage.name,
            date: new Date().toISOString().split('T')[0]
          });
        });
      });
    });

    return allExpenses.sort((a, b) => b.id - a.id);
  };

  const getFilteredExpenses = () => {
    let expenses = getAllExpenses();

    if (props.filterProject !== 'all') {
      expenses = expenses.filter(e => e.projectId === Number(props.filterProject));
    }

    if (props.filterDate) {
      expenses = expenses.filter(e => e.date === props.filterDate);
    }

    if (props.filterMinAmount) {
      expenses = expenses.filter(e => e.amount >= Number(props.filterMinAmount));
    }

    if (props.filterMaxAmount) {
      expenses = expenses.filter(e => e.amount <= Number(props.filterMaxAmount));
    }

    return expenses;
  };

  const handleAddProjectExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = props.selectedProjectForTransaction;
    const amount = Number(formData.get('amount'));
    const type = formData.get('type') as string;
    
    props.setProjects(props.projects.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, spent: p.spent + amount };
        if (type === 'materials') updated.materials = (updated.materials || 0) + amount;
        if (type === 'labor') updated.labor = (updated.labor || 0) + amount;
        if (type === 'other') updated.other = (updated.other || 0) + amount;
        return updated;
      }
      return p;
    }));
    
    props.setIsProjectExpenseDialogOpen(false);
    props.setSelectedProjectForTransaction(null);
    toast({ title: 'Расход добавлен', description: `Расход ${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ добавлен` });
  };

  const handleAddProjectIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = props.selectedProjectForTransaction;
    const amount = Number(formData.get('amount'));
    
    props.setProjects(props.projects.map(p => {
      if (p.id === projectId) {
        return { ...p, income: p.income + amount };
      }
      return p;
    }));
    
    props.setIsProjectIncomeDialogOpen(false);
    props.setSelectedProjectForTransaction(null);
    toast({ title: 'Приход добавлен', description: `Приход ${amount.toLocaleString()} ₽ добавлен в проект` });
  };

  const handleAddStageExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = props.viewingProject;
    const stageId = props.selectedStageForTransaction;
    const files = (e.currentTarget.elements.namedItem('receipt') as HTMLInputElement).files;
    const receiptUrl = files && files.length > 0 ? URL.createObjectURL(files[0]) : null;
    const amount = Number(formData.get('amount'));
    const type = formData.get('type') as string;
    
    const newExpense = {
      id: Date.now(),
      description: formData.get('description') as string,
      amount,
      type,
      date: new Date().toISOString().split('T')[0],
      receipt: receiptUrl
    };

    props.setProjects(props.projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          stages: p.stages.map(s => {
            if (s.id === stageId) {
              const updatedExpenses = [...s.expenses, newExpense];
              const materials = updatedExpenses.filter(e => e.type === 'materials').reduce((sum, e) => sum + e.amount, 0);
              const labor = updatedExpenses.filter(e => e.type === 'labor').reduce((sum, e) => sum + e.amount, 0);
              const other = updatedExpenses.filter(e => e.type === 'other').reduce((sum, e) => sum + e.amount, 0);
              return { ...s, expenses: updatedExpenses, materials, labor, other, spent: materials + labor + other };
            }
            return s;
          })
        };
      }
      return p;
    }));

    props.setIsStageExpenseDialogOpen(false);
    props.setSelectedStageForTransaction(null);
    toast({ title: 'Расход добавлен', description: `Расход ${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ добавлен в этап` });
  };

  const handleAddStageIncome = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectId = props.viewingProject;
    const stageId = props.selectedStageForTransaction;
    const files = (e.currentTarget.elements.namedItem('receipt') as HTMLInputElement).files;
    const receiptUrl = files && files.length > 0 ? URL.createObjectURL(files[0]) : null;
    const amount = Number(formData.get('amount'));
    
    const newIncome = {
      id: Date.now(),
      description: formData.get('description') as string,
      amount,
      date: new Date().toISOString().split('T')[0],
      receipt: receiptUrl
    };

    props.setProjects(props.projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          stages: p.stages.map(s => {
            if (s.id === stageId) {
              const updatedIncomes = [...(s.incomes || []), newIncome];
              const totalIncome = updatedIncomes.reduce((sum, inc) => sum + inc.amount, 0);
              return { ...s, incomes: updatedIncomes, income: totalIncome };
            }
            return s;
          })
        };
      }
      return p;
    }));

    props.setIsStageIncomeDialogOpen(false);
    props.setSelectedStageForTransaction(null);
    toast({ title: 'Приход добавлен', description: `Приход ${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ добавлен в этап` });
  };

  return {
    handleArchiveProject,
    handleUnarchiveProject,
    handleArchiveEmployee,
    handleUnarchiveEmployee,
    handleAddProject,
    handleAddStage,
    handleAddEmployee,
    handleAddTask,
    handleAddExpense,
    handleAddComment,
    handleAddCompanyExpense,
    handleAddExpenseCategory,
    handleAddPayment,
    handleAddProjectExpense,
    handleAddProjectIncome,
    handleAddStageExpense,
    handleAddStageIncome,
    getAllExpenses,
    getFilteredExpenses
  };
};