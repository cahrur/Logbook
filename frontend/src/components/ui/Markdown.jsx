import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/cn';

// Renders GitHub-flavored markdown. Raw HTML is disabled by default in
// react-markdown, so user content is safe from HTML/script injection.
export function Markdown({ children, className }) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none prose-slate dark:prose-invert',
        'prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-headings:',
        'prose-a:text-brand-600 dark:prose-a:text-brand-300',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </div>
  );
}
