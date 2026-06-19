import type { CollectionEntry } from 'astro:content';

const EXCERPT_LENGTH = 160;

/** Strip markdown syntax to plain text for excerpts. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\|[^|\n]+\|/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

/** Build a short excerpt from raw post body. */
export function getExcerpt(body: string, maxLength = EXCERPT_LENGTH): string {
  const plain = stripMarkdown(body);
  if (plain.length <= maxLength) return plain;
  const truncated = plain.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

/** Resolve SEO fields — description is auto-generated when omitted in frontmatter. */
export function getPostMeta(post: CollectionEntry<'blog'>) {
  const { title, description, author, image, pubDate, updatedDate, tags } = post.data;
  const excerpt = description ?? getExcerpt(post.body);

  return {
    title,
    description: excerpt,
    author,
    image,
    pubDate,
    updatedDate,
    tags,
    readTime: getReadTime(post.body),
  };
}

/** Estimate reading time from body word count. */
export function getReadTime(body: string): number {
  const words = stripMarkdown(body).split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 200));
}
