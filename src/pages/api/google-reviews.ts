import type { APIRoute } from 'astro';

type GoogleReview = {
  author_name?: string;
  profile_photo_url?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
  time?: number; // unix seconds
};

function formatMonthYear(unixSeconds?: number, relative?: string): string | undefined {
  try {
    if (unixSeconds) {
      const d = new Date(unixSeconds * 1000);
      return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }
  } catch {}
  return relative;
}

export const GET: APIRoute = async () => {
  const key = import.meta.env.GOOGLE_PLACES_API_KEY as string | undefined;
  const placeId = import.meta.env.GOOGLE_PLACE_ID as string | undefined;

  // Fallback data if env vars are not set or API fails
  const fallback = [
    { testimonial: 'Brilliant service — windows always spotless and they text the day before. Highly recommend.', name: 'Sophie', job: 'Homeowner in Wells', rating: 5, date: 'May 2025' },
    { testimonial: 'Professional, reliable and great communication. Booking and payment were effortless.', name: 'James', job: 'Glastonbury', rating: 5, date: 'April 2025' },
    { testimonial: 'Fantastic job on our conservatory roof and regular window cleans — looks like new.', name: 'Laura', job: 'Somerton', rating: 5, date: 'March 2025' },
  ];

  if (!key || !placeId) {
    return new Response(JSON.stringify({ reviews: fallback }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'reviews,rating,user_ratings_total,name,url');
    url.searchParams.set('key', key);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Google API error: ${res.status}`);
    const data = await res.json();
    const raw: GoogleReview[] = data?.result?.reviews ?? [];

    const mapped = raw.slice(0, 10).map((r) => ({
      testimonial: r.text ?? '',
      name: r.author_name ?? 'Google user',
      job: '',
      rating: r.rating ?? 5,
      date: formatMonthYear(r.time, r.relative_time_description),
    }));

    return new Response(JSON.stringify({ reviews: mapped }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ reviews: fallback }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
};



