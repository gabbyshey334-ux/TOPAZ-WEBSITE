import { FunctionsHttpError } from '@supabase/functions-js';

/** Read `{ error: "..." }` from a failed Edge Function invoke. */
export async function parseEdgeFunctionFailure(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const res = error.context as Response;
      const ct = res.headers.get('Content-Type') ?? '';
      if (ct.includes('application/json')) {
        const body = (await res.json()) as unknown;
        if (body && typeof body === 'object' && body !== null && 'error' in body) {
          const inner = (body as { error?: unknown }).error;
          if (inner != null && String(inner).trim() !== '') return String(inner);
        }
      } else {
        const text = (await res.text()).trim();
        if (text) return text.length > 600 ? `${text.slice(0, 600)}…` : text;
      }
    } catch {
      // fall through
    }
  }
  if (error instanceof Error) return error.message;
  return String(error ?? 'Unknown error');
}
