export class UpdateCompanyUserDto {
    name?: string;
    role?: string;
    canDashboard?: boolean;
    canProjects?: boolean;
    canFinances?: boolean;
    canCommercial?: boolean;
    canEmployees?: boolean;
    canTasks?: boolean;
    canProfile?: boolean;
    canSubscription?: boolean;
}
