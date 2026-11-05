export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  createdAt?: string;
}

export interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
}
