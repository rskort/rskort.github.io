import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xnnrqdlbpoixiynfxcpm.supabase.co';
const PLACEHOLDER_PATTERN = /PASTE_SUPABASE_ANON_KEY_HERE/i;

const $ = (id) => document.getElementById(id);

const elements = {
  openButton: $('auth-open-button'),
  userButton: $('auth-user-button'),
  userName: $('auth-user-name'),
  modal: $('auth-modal'),
  signOutWrapper: $('auth-signout-wrapper'),
  signOutButton: $('auth-signout'),
  status: $('auth-status'),
  keyHint: $('auth-key-hint'),
};

const viewButtons = Array.from(document.querySelectorAll('[data-auth-view]'));
const viewTargets = Array.from(document.querySelectorAll('[data-auth-view-target]'));
const forms = {
  signin: $('auth-signin-form'),
  signup: $('auth-signup-form'),
  reset: $('auth-reset-form'),
};

let activeView = 'signin';
let lastKnownUserId = null;

const supabaseKey = typeof window !== 'undefined' ? window.SUPABASE_ANON_KEY : undefined;
const isKeyMissing = !supabaseKey || PLACEHOLDER_PATTERN.test(String(supabaseKey).trim());
const supabase = isKeyMissing ? null : createClient(SUPABASE_URL, supabaseKey);

const setStatus = (message = '', variant = 'info') => {
  if (!elements.status) return;
  elements.status.textContent = message;
  if (!message) {
    elements.status.removeAttribute('data-variant');
    return;
  }
  elements.status.dataset.variant = variant;
};

const toggleBodyScroll = (locked) => {
  if (!document?.body) return;
  document.body.style.overflow = locked ? 'hidden' : '';
};

const openModal = () => {
  if (!elements.modal) return;
  elements.modal.classList.add('is-visible');
  elements.modal.setAttribute('aria-hidden', 'false');
  toggleBodyScroll(true);
};

const closeModal = () => {
  if (!elements.modal) return;
  elements.modal.classList.remove('is-visible');
  elements.modal.setAttribute('aria-hidden', 'true');
  toggleBodyScroll(false);
};

const setActiveView = (view) => {
  activeView = view;
  viewButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.authView === view);
  });
  viewTargets.forEach((target) => {
    target.classList.toggle('is-active', target.dataset.authViewTarget === view);
  });
};

const toggleFormControls = (form, disabled) => {
  Array.from(form.elements).forEach((control) => {
    control.disabled = disabled;
  });
};

const reflectSession = (user) => {
  const signedIn = Boolean(user);
  if (elements.openButton) {
    elements.openButton.hidden = signedIn;
  }
  if (elements.userButton) {
    elements.userButton.hidden = !signedIn;
  }
  if (elements.signOutWrapper) {
    elements.signOutWrapper.hidden = !signedIn;
  }
  if (elements.signOutButton) {
    elements.signOutButton.disabled = !signedIn;
  }
  if (elements.userName) {
    elements.userName.textContent = signedIn ? getDisplayName(user) : 'Account';
  }
  if (signedIn) {
    lastKnownUserId = user?.id ?? 'local-user';
  } else if (lastKnownUserId) {
    setStatus('You are signed out.', 'info');
    lastKnownUserId = null;
  }
};

const getDisplayName = (user) => {
  const raw = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const name = raw.trim();
  if (name) {
    return name;
  }
  return user?.email ?? 'Account';
};

const handleForm = (form, handler) => {
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabase) {
      setStatus('Add your Supabase anon key before continuing.', 'error');
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    toggleFormControls(form, true);
    try {
      await handler(payload);
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      toggleFormControls(form, false);
    }
  });
};

const initAuth = async () => {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    reflectSession(data.session?.user ?? null);
  } catch (error) {
    console.error('Unable to fetch Supabase session', error);
    setStatus('Unable to check the current session. You can still sign in.', 'error');
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    reflectSession(session?.user ?? null);
  });
};

// View switcher setup
viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveView(button.dataset.authView);
  });
});

setActiveView(activeView);

// Modal triggers
elements.openButton?.addEventListener('click', () => {
  openModal();
  if (!supabase && isKeyMissing) {
    setStatus('Add your Supabase anon key to finish configuring authentication.', 'error');
  }
});

elements.userButton?.addEventListener('click', openModal);

document.querySelectorAll('[data-auth-close]').forEach((node) => {
  node.addEventListener('click', closeModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// Sign-in form
handleForm(forms.signin, async ({ email, password }) => {
  setStatus('Signing you in...', 'info');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  setStatus('Signed in successfully.', 'positive');
  closeModal();
});

// Sign-up form
handleForm(forms.signup, async ({ email, password, name }) => {
  const fullName = (name || '').trim();
  if (!fullName) {
    setStatus('Please share your full name before continuing.', 'error');
    return;
  }
  setStatus('Creating your account...', 'info');
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) {
    throw error;
  }
  forms.signup?.reset();
  setActiveView('signin');
  setStatus('Check your inbox to confirm your email, then sign in.', 'positive');
});

// Password reset form
handleForm(forms.reset, async ({ email }) => {
  setStatus('Sending a reset link...', 'info');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) {
    throw error;
  }
  setStatus('A password reset email is on its way.', 'positive');
  forms.reset?.reset();
});

elements.signOutButton?.addEventListener('click', async () => {
  if (!supabase) {
    setStatus('Add your Supabase anon key before continuing.', 'error');
    return;
  }
  try {
    setStatus('Signing you out...', 'info');
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    closeModal();
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Unable to sign out.', 'error');
  }
});

if (elements.keyHint) {
  elements.keyHint.hidden = !isKeyMissing;
}

if (supabase) {
  setStatus('Use your email and password to sign in or create an account.', 'info');
  initAuth();
} else {
  setStatus('Add your Supabase anon key near the bottom of _layouts/default.html, then reload.', 'error');
}
