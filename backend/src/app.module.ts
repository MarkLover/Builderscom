import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { EmployeesModule } from './employees/employees.module';
import { TasksModule } from './tasks/tasks.module';
import { CommercialOffersModule } from './commercial-offers/commercial-offers.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CompanyUsersModule } from './company-users/company-users.module';
import { CompanyExpensesModule } from './company-expenses/company-expenses.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    ProjectsModule,
    EmployeesModule,
    TasksModule,
    CommercialOffersModule,
    SubscriptionsModule,
    CompanyUsersModule,
    CompanyExpensesModule,
    ExpenseCategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
