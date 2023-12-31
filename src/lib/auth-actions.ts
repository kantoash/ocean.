'use server';

import { unknown, z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AuthFormSchema } from './utils'
import db from './supabase/db';
import { users } from './supabase/schema';

export async function actionLoginUser({
  email,
  password,
}: z.infer<typeof AuthFormSchema>) {
  const supabase = createRouteHandlerClient({ cookies });
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return response;
}

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof AuthFormSchema>) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email);

  if (data?.length) return { error: { message: 'User already exists', data } };


  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  await db.insert(users).values({
    id: response.data.user?.id!,
    email: response.data.user?.email!,
    name: null,
    image: null,
    billingAddress: null,
    paymentMethod: null,
    updatedAt: new Date().toISOString(),
  })

  return response;
}