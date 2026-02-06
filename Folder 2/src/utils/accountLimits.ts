export const ACCOUNT_LIMITS = {
  personal: {
    maxProjects: 1,
    maxEmployees: 10,
    hasCompanyFinances: false
  },
  businessFree: {
    maxProjects: 1,
    maxEmployees: 10,
    hasCompanyFinances: true
  },
  businessPaid: {
    maxProjects: Infinity,
    maxEmployees: Infinity,
    hasCompanyFinances: true
  }
};

export const checkAccountLimit = (user: any, limitType: 'projects' | 'employees'): boolean => {
  if (user.accountType === 'personal') {
    return false;
  }
  
  if (user.accountType === 'business' && !user.subscriptionActive) {
    return false;
  }
  
  return true;
};

export const getMaxLimit = (accountType: 'personal' | 'business', subscriptionActive: boolean, limitType: 'projects' | 'employees'): number => {
  if (accountType === 'personal') {
    return limitType === 'projects' ? ACCOUNT_LIMITS.personal.maxProjects : ACCOUNT_LIMITS.personal.maxEmployees;
  }
  
  if (accountType === 'business') {
    if (subscriptionActive) {
      return limitType === 'projects' ? ACCOUNT_LIMITS.businessPaid.maxProjects : ACCOUNT_LIMITS.businessPaid.maxEmployees;
    } else {
      return limitType === 'projects' ? ACCOUNT_LIMITS.businessFree.maxProjects : ACCOUNT_LIMITS.businessFree.maxEmployees;
    }
  }
  
  return 0;
};

export const canAddItem = (
  accountType: 'personal' | 'business',
  subscriptionActive: boolean,
  currentCount: number,
  limitType: 'projects' | 'employees'
): { allowed: boolean; message: string } => {
  const limit = getMaxLimit(accountType, subscriptionActive, limitType);
  
  if (currentCount >= limit) {
    if (accountType === 'personal') {
      return {
        allowed: false,
        message: limitType === 'projects' 
          ? 'Личный аккаунт поддерживает только 1 объект. Перейдите на бизнес-аккаунт для неограниченного количества.'
          : 'Достигнут лимит в 10 сотрудников для личного аккаунта. Перейдите на бизнес-аккаунт для неограниченного количества.'
      };
    }
    
    if (accountType === 'business' && !subscriptionActive) {
      return {
        allowed: false,
        message: limitType === 'projects'
          ? 'Бесплатный тариф поддерживает только 1 объект. Оплатите подписку для неограниченного количества объектов.'
          : 'Достигнут лимит в 10 сотрудников. Оплатите подписку для неограниченного количества сотрудников.'
      };
    }
  }
  
  return { allowed: true, message: '' };
};