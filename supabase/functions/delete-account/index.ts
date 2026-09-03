import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Client scoped to the requesting user — used only to verify who they are.
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;

    // Admin client — service role key, only usable server-side inside the function.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Delete this user's listing photos from storage.
    const { data: listings } = await adminClient
      .from('listings')
      .select('id')
      .eq('seller_id', userId);

    if (listings && listings.length > 0) {
      for (const listing of listings) {
        const { data: files } = await adminClient.storage
          .from('listing-photos')
          .list(`${userId}/${listing.id}`);
        if (files && files.length > 0) {
          const paths = files.map((f) => `${userId}/${listing.id}/${f.name}`);
          await adminClient.storage.from('listing-photos').remove(paths);
        }
      }
    }

    // 2. Delete profile photo from storage, if any.
    await adminClient.storage.from('profile-photos').remove([`${userId}.jpg`]);

    // 3. Delete this user's listings (DB rows).
    await adminClient.from('listings').delete().eq('seller_id', userId);

    // 4. Delete this user's profile row.
    await adminClient.from('users').delete().eq('id', userId);

    // 5. Delete the auth user itself — must be last.
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) throw deleteAuthError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});