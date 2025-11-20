import {
  createContext,
  createMemo,
  onMount,
  ParentProps,
  Show,
  useContext,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/ui/button';
import { PageContainer } from '~/ui/page-container';
import { TextField, TextFieldInput, TextFieldLabel } from '~/ui/text-field';
import LogInIcon from 'lucide-solid/icons/log-in';

export interface UserSession {
  userId: string;
  username: string;
}

interface AuthStateSigngedIn {
  status: 'signed-in';
  isSignedIn: true;
  user: UserSession;
}

interface AuthStateSigngedOut {
  status: 'signed-out';
  isSignedIn: false;
  user: undefined;
}

export type AuthState = (AuthStateSigngedIn | AuthStateSigngedOut) & {
  signIn: (userId: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState>(undefined);

function InternalAuthProvider(props: ParentProps) {
  const localStorageKey = 'SOLID_CHAT_AUTH_USERNAME';

  const [authState, setAuthState] = createStore<AuthState>({
    status: 'signed-out',
    isSignedIn: false,
    user: undefined,
    signIn: (userId: string) => {
      const validUsers = [
        {
          userId: 'user-1',
          username: 'Alice',
        },
        {
          userId: 'user-2',
          username: 'Bob',
        },
      ];

      const user = validUsers.find((u) => u.userId === userId);

      if (!user) {
        throw new Error('Invalid user credentials');
      }

      setAuthState({
        status: 'signed-in',
        isSignedIn: true,
        user,
      });

      localStorage.setItem(localStorageKey, userId);
    },
    signOut: () => {
      setAuthState({
        status: 'signed-out',
        isSignedIn: false,
        user: undefined,
      });

      localStorage.removeItem(localStorageKey);
    },
  });

  onMount(() => {
    const initialLocalStorageValue = localStorage.getItem(localStorageKey);

    if (initialLocalStorageValue) {
      try {
        authState.signIn(initialLocalStorageValue);
      } catch {
        // Ignore invalid stored credentials
        localStorage.removeItem(localStorageKey);
      }
    }
  });

  return (
    <AuthContext.Provider value={authState}>
      {props.children}
    </AuthContext.Provider>
  );
}

function SigninForm() {
  const auth = useAuth();

  return (
    <PageContainer class="py-4">
      <form
        class="flex flex-col gap-4 border rounded-2xl p-4 max-w-96 mx-auto"
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const data = Object.fromEntries(formData.entries()) as {
            userId: string;
            username: string;
          };

          if (data.userId) {
            try {
              auth.signIn(data.userId);
            } catch (err) {
              alert(
                'Sign-in failed: ' +
                  (err instanceof Error ? err.message : `${err}`)
              );
            }
          }
        }}
      >
        <h1 class="text-2xl font-light">Sign in</h1>
        <TextField>
          <TextFieldLabel>User ID</TextFieldLabel>
          <TextFieldInput
            required
            name="userId"
            type="text"
            autocomplete="off"
          />
        </TextField>
        <Button type="submit" class="self-start" icon={LogInIcon}>
          Sign in
        </Button>
      </form>
    </PageContainer>
  );
}

function SignedInGuard(props: ParentProps) {
  const auth = useAuth();

  return (
    <Show when={auth.isSignedIn} fallback={<SigninForm />}>
      {props.children}
    </Show>
  );
}

export function AuthProvider(props: ParentProps) {
  return (
    <InternalAuthProvider>
      <SignedInGuard>{props.children}</SignedInGuard>
    </InternalAuthProvider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
};

export const useUser = () => {
  const auth = useAuth();

  return createMemo(() => {
    if (!auth.isSignedIn) {
      throw new Error('No user is signed in');
    }

    return auth.user;
  });
};
