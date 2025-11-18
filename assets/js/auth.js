import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xnnrqdlbpoixiynfxcpm.supabase.co';
const PLACEHOLDER_PATTERN = window.SUPABASE_ANON_KEY;

const $ = (id) => document.getElementById(id);

const elements = {
  openButton: $('auth-open-button'),
  userButton: $('auth-user-button'),
  userName: $('auth-user-name'),
  modal: $('auth-modal'),
  signOutButton: $('auth-signout'),
  status: $('auth-status'),
  keyHint: $('auth-key-hint'),
  viewSwitcher: $('auth-view-switcher'),
  accountName: $('auth-account-name'),
  accountEmail: $('auth-account-email'),
  accountView: $('auth-account-view'),
  accountStatus: $('auth-account-status'),
  accountLastSeen: $('auth-account-last-seen'),
  resetCurrentButton: $('auth-reset-current'),
};

const viewButtons = Array.from(document.querySelectorAll('[data-auth-view]'));
const viewTargets = Array.from(document.querySelectorAll('[data-auth-view-target]'));
const forms = {
  signin: $('auth-signin-form'),
  signup: $('auth-signup-form'),
  reset: $('auth-reset-form'),
  profile: $('auth-profile-form'),
  email: $('auth-email-form'),
  password: $('auth-password-form'),
};

let activeView = 'signin';
let lastKnownUserId = null;
let currentUser = null;

const supabaseKey = typeof window !== 'undefined' ? window.SUPABASE_ANON_KEY : undefined;
const placeholderMatcher =
  PLACEHOLDER_PATTERN && typeof PLACEHOLDER_PATTERN.test === 'function'
    ? PLACEHOLDER_PATTERN
    : null;
const isKeyMissing =
  !supabaseKey ||
  (placeholderMatcher && placeholderMatcher.test(String(supabaseKey).trim()));
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

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const updateAccountStatus = (user) => {
  if (!elements.accountStatus) return;
  if (!user) {
    elements.accountStatus.textContent = 'Not signed in';
    elements.accountStatus.dataset.variant = 'muted';
    return;
  }
  const verified = Boolean(user?.email_confirmed_at);
  elements.accountStatus.textContent = verified ? 'Email verified' : 'Email pending verification';
  elements.accountStatus.dataset.variant = verified ? 'positive' : 'warning';
};

const reflectSession = (user) => {
  const signedIn = Boolean(user);
  currentUser = user || null;
  if (elements.openButton) {
    elements.openButton.hidden = signedIn;
  }
  if (elements.userButton) {
    elements.userButton.hidden = !signedIn;
  }
  if (elements.signOutButton) {
    elements.signOutButton.disabled = !signedIn;
  }
  if (elements.userName) {
    elements.userName.textContent = signedIn ? getDisplayName(user) : 'Account';
  }
  if (elements.viewSwitcher) {
    elements.viewSwitcher.hidden = signedIn;
  }
  if (signedIn) {
    if (elements.accountName) {
      elements.accountName.textContent = getDisplayName(user);
    }
    if (elements.accountEmail) {
      elements.accountEmail.textContent = user?.email ?? '';
    }
    if (elements.accountLastSeen) {
      elements.accountLastSeen.textContent = user?.last_sign_in_at
        ? `Last active ${formatDateTime(user.last_sign_in_at)}`
        : 'Last active: —';
    }
    const profileNameField = forms.profile?.elements?.displayName;
    if (profileNameField) {
      profileNameField.value = getDisplayName(user);
    }
    const changeEmailField = forms.email?.elements?.email;
    if (changeEmailField && !changeEmailField.value) {
      changeEmailField.placeholder = user?.email || 'new@email.com';
    }
    updateAccountStatus(user);
    setActiveView('account');
    setStatus(`Signed in as ${getDisplayName(user)}.`, 'positive');
  } else {
    if (elements.accountName) {
      elements.accountName.textContent = '';
    }
    if (elements.accountEmail) {
      elements.accountEmail.textContent = '';
    }
    if (elements.accountLastSeen) {
      elements.accountLastSeen.textContent = '';
    }
    const profileNameField = forms.profile?.elements?.displayName;
    if (profileNameField) {
      profileNameField.value = '';
    }
    const changeEmailField = forms.email?.elements?.email;
    if (changeEmailField) {
      changeEmailField.value = '';
      changeEmailField.placeholder = 'new@email.com';
    }
    updateAccountStatus(null);
    setActiveView('signin');
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

const refreshUser = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  const user = data.user ?? null;
  reflectSession(user);
  return user;
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

// Profile name update
handleForm(forms.profile, async ({ displayName }) => {
  if (!currentUser) {
    setStatus('Sign in to manage your profile.', 'error');
    return;
  }
  const fullName = (displayName || '').trim();
  if (!fullName) {
    setStatus('Please share the name you want us to use.', 'error');
    return;
  }
  const currentName = getDisplayName(currentUser);
  if (fullName === currentName) {
    setStatus('That is already your display name.', 'error');
    return;
  }
  setStatus('Updating your profile...', 'info');
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName, name: fullName },
  });
  if (error) {
    throw error;
  }
  setStatus('Name updated.', 'positive');
  await refreshUser();
});

// Email change request
handleForm(forms.email, async ({ email }) => {
  if (!currentUser) {
    setStatus('Sign in to update your contact email.', 'error');
    return;
  }
  const newEmail = (email || '').trim();
  if (!newEmail) {
    setStatus('Enter the email you would like to use.', 'error');
    return;
  }
  if (currentUser?.email && newEmail.toLowerCase() === currentUser.email.toLowerCase()) {
    setStatus('You are already using that email address.', 'error');
    return;
  }
  setStatus('Sending a confirmation to update your email...', 'info');
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: window.location.origin }
  );
  if (error) {
    throw error;
  }
  setStatus(`We sent a confirmation to ${newEmail}. Use it to finish updating your account.`, 'positive');
  forms.email?.reset();
});

// Password update
handleForm(forms.password, async ({ password }) => {
  if (!currentUser) {
    setStatus('Sign in to change your password.', 'error');
    return;
  }
  const newPassword = (password || '').trim();
  if (!newPassword || newPassword.length < 8) {
    setStatus('Choose a password with at least 8 characters.', 'error');
    return;
  }
  setStatus('Updating your password...', 'info');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw error;
  }
  setStatus('Password updated. Use it the next time you sign in.', 'positive');
  forms.password?.reset();
});

// Send reset link to the current account email
elements.resetCurrentButton?.addEventListener('click', async () => {
  if (!supabase) {
    setStatus('Add your Supabase anon key before continuing.', 'error');
    return;
  }
  const email = currentUser?.email;
  if (!email) {
    setStatus('We could not find an email for your account.', 'error');
    return;
  }
  try {
    setStatus(`Sending a reset link to ${email}...`, 'info');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      throw error;
    }
    setStatus(`A password reset email is on its way to ${email}.`, 'positive');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Unable to send the reset email.', 'error');
  }
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
