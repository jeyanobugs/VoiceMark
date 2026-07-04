import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const useMock = !supabaseUrl || 
                 !supabaseAnonKey || 
                 supabaseUrl.includes('dummy') || 
                 supabaseUrl.includes('YOUR_');

class MockAuth {
  private listeners: Array<(event: string, session: any) => void> = [];

  private getUsername(email: string) {
    if (email && email.includes('@')) {
      return email.split('@')[0];
    }
    return email || '';
  }

  private getStoredUsers() {
    try {
      const stored = localStorage.getItem('VOICEMARK_USERS');
      if (stored) return JSON.parse(stored);
      // Initialize with default demo user
      const defaultUsers = { "prof_smith": "password123" };
      localStorage.setItem('VOICEMARK_USERS', JSON.stringify(defaultUsers));
      return defaultUsers;
    } catch {
      return { "prof_smith": "password123" };
    }
  }

  private saveStoredUsers(users: any) {
    localStorage.setItem('VOICEMARK_USERS', JSON.stringify(users));
  }

  private getStoredSession() {
    try {
      const sess = localStorage.getItem('VOICEMARK_SESSION');
      return sess ? JSON.parse(sess) : null;
    } catch {
      return null;
    }
  }

  private saveStoredSession(session: any) {
    if (session) {
      localStorage.setItem('VOICEMARK_SESSION', JSON.stringify(session));
    } else {
      localStorage.removeItem('VOICEMARK_SESSION');
    }
  }

  async getSession() {
    const session = this.getStoredSession();
    return { data: { session }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const session = this.getStoredSession();
    // Trigger initial callback asynchronously to let listeners attach
    setTimeout(() => {
      callback('SIGNED_IN', session);
    }, 0);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private notify(event: string, session: any) {
    this.listeners.forEach(l => {
      try {
        l(event, session);
      } catch (err) {
        console.error(err);
      }
    });
  }

  async signUp({ email, password }: any) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const username = this.getUsername(email);
    const users = this.getStoredUsers();
    
    if (users[username]) {
      return { data: { user: null }, error: { message: 'Username/User already exists' } };
    }

    users[username] = password;
    this.saveStoredUsers(users);

    const user = {
      id: username,
      email,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    };

    return { data: { user }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const username = this.getUsername(email);
    const users = this.getStoredUsers();
    
    if (users[username] === password) {
      const session = {
        access_token: 'mock-token-' + Date.now(),
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-' + Date.now(),
        user: {
          id: username,
          email: email.includes('@') ? email : `${username}@voicemark.edu`,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
      }
      };
      this.saveStoredSession(session);
      this.notify('SIGNED_IN', session);
      return { data: { session, user: session.user }, error: null };
    }

    return { data: { session: null, user: null }, error: { message: 'Invalid username or password' } };
  }

  async signOut() {
    this.saveStoredSession(null);
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }
}

const createMockSupabase = () => {
  return {
    auth: new MockAuth(),
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      })
    })
  };
};

let clientInstance: any;

if (useMock) {
  console.warn("VoiceMark: Running in MOCK AUTH MODE using localStorage. Set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real integration.");
  clientInstance = createMockSupabase();
} else {
  try {
    clientInstance = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (e) {
    console.error("Vite: Failed to initialize Supabase client. Falling back to mock auth.", e);
    clientInstance = createMockSupabase();
  }
}

export const supabase = clientInstance;

