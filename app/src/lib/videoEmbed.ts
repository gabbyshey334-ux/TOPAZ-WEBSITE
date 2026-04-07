export type VideoEmbedKind = 'youtube' | 'vimeo';

export type ParsedVideoUrl = {
  kind: VideoEmbedKind;
  id: string;
  embedSrc: string;
};

/**
 * Parse a YouTube or Vimeo URL into an iframe embed src.
 */
export function parseVideoUrl(raw: string): ParsedVideoUrl | null {
  const input = raw.trim();
  if (!input) return null;

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.replace(/^\//, '').split('/')[0];
    if (!id) return null;
    return {
      kind: 'youtube',
      id,
      embedSrc: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (url.pathname.startsWith('/embed/')) {
      const id = url.pathname.replace('/embed/', '').split('/')[0];
      if (!id) return null;
      return { kind: 'youtube', id, embedSrc: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    const v = url.searchParams.get('v');
    if (v) return { kind: 'youtube', id: v, embedSrc: `https://www.youtube-nocookie.com/embed/${v}` };
    return null;
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id || !/^\d+$/.test(id)) return null;
    return {
      kind: 'vimeo',
      id,
      embedSrc: `https://player.vimeo.com/video/${id}`,
    };
  }

  return null;
}
