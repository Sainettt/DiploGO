import { apiClient } from './api.client';

export interface OnBoardingPayload {
  purpose?: string;
  dailyTimeSpent?: number;
  pushNotifications?: boolean;
  onBoardingCompleted?: boolean;
}

export const onboardingApi = {
  save: async (data: OnBoardingPayload) => {
    const response = await apiClient.post('/onboarding', data);
    return response.data;
  },

  getOnBoarding: async () => {
    const response = await apiClient.get('/onboarding');
    return response.data as OnBoardingPayload & { onBoardingCompleted: boolean };
  },
};
