import { apiClient } from './api.client';

export const userApi = {
  /**
   * Register (or clear) the Expo push token for this device on the server.
   * Call with `null` to unregister (e.g. on logout or permission revoked).
   */
  updatePushToken: async (expoPushToken: string | null) => {
    const res = await apiClient.patch('/users/me/push-token', { expoPushToken });
    return res.data as { success: boolean };
  },
};
