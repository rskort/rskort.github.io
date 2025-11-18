import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xnnrqdlbpoixiynfxcpm.supabase.co';
const supabaseKey = typeof window !== 'undefined' ? window.SUPABASE_ANON_KEY : undefined;

const getDisplayName = (user) => {
  const raw =
    user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const trimmed = raw?.trim();
  if (trimmed) {
    return trimmed;
  }
  return user?.email ?? '';
};

const fillContactForm = async () => {
  if (!supabaseKey) {
    return;
  }
  const supabase = createClient(SUPABASE_URL, supabaseKey);
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    const user = data.session?.user;
    if (!user) {
      return;
    }

    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');

    if (nameField && !nameField.value.trim()) {
      nameField.value = getDisplayName(user);
    }
    if (emailField && !emailField.value.trim()) {
      emailField.value = user.email ?? '';
    }
  } catch (error) {
    console.error('Unable to prefill contact form', error);
  }
};

fillContactForm();
