import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useGoogleAuth, loginWithGoogle } from '../api/oauth.api';
import { onboardingApi } from '../api/onboarding.api';

type Labels = {
  failed: string;
  noToken: string;
};

type Options = {
  labels: Labels;
  setError: (msg: string) => void;
  setLoading: (loading: boolean) => void;
};

export function useGoogleSignIn({ labels, setError, setLoading }: Options) {
  const router = useRouter();
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      if (!accessToken) {
        setError(labels.noToken);
        setLoading(false);
        return;
      }

      (async () => {
        try {
          await loginWithGoogle(accessToken);
          const settings = await onboardingApi.getOnBoarding().catch(() => null);
          router.replace(settings?.onBoardingCompleted ? '/home' : '/onboarding/purpose');
        } catch {
          setError(labels.failed);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    if (response.type === 'error') {
      setError(labels.failed);
      setLoading(false);
      return;
    }

    if (response.type === 'cancel' || response.type === 'dismiss') {
      setLoading(false);
    }
  }, [response]);

  const signIn = () => {
    setError('');
    setLoading(true);
    promptAsync();
  };

  return { request, signIn };
}
