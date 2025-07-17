
import { apiClient } from './apiClient';

export interface CreateExpenseRequest {
  club_id: number;
  amount: number;
  category: string;
  description: string;
}

export interface GetExpensesParams {
  club_id: number;
  category?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface Expense {
  id: number;
  club_id: number;
  cash_session_id: number;
  amount: string;
  category: string;
  description: string;
  added_by: number;
  created_at: string;
  addedBy: {
    id: number;
    username: string;
    email: string;
  };
  cashSession: {
    id: number;
    opened_at: string;
    closed_at: string | null;
  };
}

export interface ExpensesResponse {
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const createExpense = async (expenseData: CreateExpenseRequest): Promise<any> => {
  const response = await apiClient.post('/api/expenses/create', expenseData);
  return response.data;
};

export const getExpenses = async (params: GetExpensesParams): Promise<any> => {
  const queryParams = new URLSearchParams();
  
  queryParams.append('club_id', params.club_id.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/api/expenses?${queryParams.toString()}`);
  return response.data;
};
