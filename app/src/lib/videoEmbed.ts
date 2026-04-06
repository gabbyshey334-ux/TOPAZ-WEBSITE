export type VideoProvider = 'youtube' | 'vimeo';

export interface ParsedVideo {
  provider: VideoProvider;
  id: string;
}

export function parseVideoUrl(raw: string): ParsedVideo | null {
  const url = raw.trim();
  if (!url) return null;

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? { provider: 'youtube', id } : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'www.youtube.com') {
      const v = u.searchParams.get('v');
      if (v) return { provider: 'youtube', id: v };
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embed?.[1]) return { provider: 'youtube', id: embed[1] };
      return null;
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const m = u.pathname.match(/(?:video\/)?(\d+)/);
      if (m?.[1]) return { provider: 'vimeo', id: m[1] };
      return null;
    }
  } catch {
    return null;
  }

  return null;
}

export function embedSrc(parsed: ParsedVideo): string {
  if (parsed.provider === 'youtube') {
    return `https://www.youtube.com/embed/${parsed.id}`;
  }
  return `https://player.vimeo.com/video/${parsed.id}`;
}
