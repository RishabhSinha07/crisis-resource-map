import { setRequestLocale } from 'next-intl/server';
import { MapPageClient } from './map-page-client';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // SSR: fetch initial resources
  let initialResources = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
      // Generous bbox around default center (34.0, 36.0) at zoom ~6
      const bboxFilter = '&lat=gte.24&lat=lte.44&lng=gte.26&lng=lte.46';
      const res = await fetch(
        `${supabaseUrl}/rest/v1/resources?select=*&order=created_at.desc${bboxFilter}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          next: { revalidate: 60 },
        }
      );
      if (res.ok) {
        initialResources = await res.json();
      }
    }
  } catch {
    // SSR fetch failed, client will retry
  }

  return <MapPageClient initialResources={initialResources} />;
}
