import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { projectsService } from '@/services/projects.service';
import { companyExpensesService } from '@/services/company-expenses.service';
import { expenseCategoriesService } from '@/services/expense-categories.service';
import { FinancesView } from '@/components/sections/projects/FinancesView';
import { usePageOnboarding } from '@/components/layout/useOnboarding';
import { DriveStep } from 'driver.js';

const Finances = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // State
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [viewingCategory, setViewingCategory] = useState<number | null>(null);

    // Dialog states
    const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
    const [isCompanyExpenseDialogOpen, setIsCompanyExpenseDialogOpen] = useState(false);
    const [isExpenseCategoryDialogOpen, setIsExpenseCategoryDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    // Queries
    const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsService.getAll,
    });

    const { data: companyExpenses = [], isLoading: isLoadingExpenses } = useQuery({
        queryKey: ['companyExpenses'],
        queryFn: companyExpensesService.getAll,
    });

    const { data: expenseCategories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['expenseCategories'],
        queryFn: expenseCategoriesService.getAll,
    });

    // Tour configuration
    const financesTourSteps: DriveStep[] = [
        {
            popover: {
                title: 'Финансовый учет 💰',
                description: 'Здесь вы можете контролировать бюджеты по каждому объекту, а также вести учет общих расходов компании.',
                align: 'center'
            }
        },
        {
            element: '#tour-fin-stage',
            popover: {
                title: 'Этапы работ',
                description: 'Разбивайте объект на этапы (например, «Фундамент», «Коробка», «Кровля») и контролируйте прибыльность каждого.',
                side: 'bottom',
                align: 'end'
            }
        },
        {
            element: '#tour-fin-company',
            popover: {
                title: 'Расходы компании',
                description: 'Учитывайте аренду офиса, рекламу, покупку инструмента и прочие затраты, не привязанные к конкретным объекрам.',
                side: 'top',
                align: 'start'
            }
        }
    ];

    usePageOnboarding(!isLoadingProjects && !isLoadingExpenses && !isLoadingCategories, 'finances_page', financesTourSteps);

    // Mutations
    const createStageMutation = useMutation({
        mutationFn: (data: any) => projectsService.createStage({ projectId: data.projectId, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsStageDialogOpen(false);
            toast({ title: 'Успешно', description: 'Этап работ добавлен' });
        },
        onError: () => toast({ title: 'Ошибка', description: 'Не удалось добавить этап', variant: 'destructive' })
    });

    const createCompanyExpenseMutation = useMutation({
        mutationFn: companyExpensesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companyExpenses'] });
            setIsCompanyExpenseDialogOpen(false);
            toast({ title: 'Успешно', description: 'Расход добавлен' });
        },
        onError: () => toast({ title: 'Ошибка', description: 'Не удалось добавить расход', variant: 'destructive' })
    });

    const createExpenseCategoryMutation = useMutation({
        mutationFn: expenseCategoriesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
            setIsExpenseCategoryDialogOpen(false);
            toast({ title: 'Успешно', description: 'Статья расходов создана' });
        },
        onError: () => toast({ title: 'Ошибка', description: 'Не удалось создать статью', variant: 'destructive' })
    });

    const createPaymentMutation = useMutation({
        mutationFn: (data: any) => expenseCategoriesService.addPayment(viewingCategory!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
            setIsPaymentDialogOpen(false);
            toast({ title: 'Успешно', description: 'Платеж добавлен' });
        },
        onError: () => toast({ title: 'Ошибка', description: 'Не удалось добавить платеж', variant: 'destructive' })
    });

    // Handlers
    const handleAddStage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createStageMutation.mutate({
            projectId: Number(formData.get('projectId')),
            title: formData.get('stageName'),
            budget: Number(formData.get('budget'))
        });
    };

    const handleAddCompanyExpense = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createCompanyExpenseMutation.mutate({
            description: formData.get('description') as string,
            amount: Number(formData.get('amount')),
            category: formData.get('category') as string,
            date: formData.get('date') as string,
            // receipt: formData.get('receipt') as File // TODO: Handle file upload
        });
    };

    const handleAddExpenseCategory = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createExpenseCategoryMutation.mutate({
            name: formData.get('name') as string,
            type: formData.get('type') as any,
            amount: Number(formData.get('amount')) || 0,
            description: formData.get('description') as string
        });
    };

    const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (!viewingCategory) return;

        createPaymentMutation.mutate({
            amount: Number(formData.get('amount')),
            date: formData.get('date') as string,
            description: formData.get('description') as string
        });
    };

    if (isLoadingProjects || isLoadingExpenses || isLoadingCategories) {
        return <div className="flex justify-center p-8">Загрузка данных...</div>;
    }

    return (
        <FinancesView
            projects={projects}
            companyExpenses={companyExpenses}
            expenseCategories={expenseCategories}
            selectedProject={selectedProject}
            viewingCategory={viewingCategory}
            setSelectedProject={setSelectedProject}
            setViewingCategory={setViewingCategory}

            isStageDialogOpen={isStageDialogOpen}
            setIsStageDialogOpen={setIsStageDialogOpen}

            isCompanyExpenseDialogOpen={isCompanyExpenseDialogOpen}
            setIsCompanyExpenseDialogOpen={setIsCompanyExpenseDialogOpen}

            isExpenseCategoryDialogOpen={isExpenseCategoryDialogOpen}
            setIsExpenseCategoryDialogOpen={setIsExpenseCategoryDialogOpen}

            isPaymentDialogOpen={isPaymentDialogOpen}
            setIsPaymentDialogOpen={setIsPaymentDialogOpen}

            handleAddStage={handleAddStage}
            handleAddCompanyExpense={handleAddCompanyExpense}
            handleAddExpenseCategory={handleAddExpenseCategory}
            handleAddPayment={handleAddPayment}
        />
    );
};

export default Finances;
