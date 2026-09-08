import React from 'react';
import Link from 'next/link';
import { getLegalDoc, type LegalBlock, type LegalDoc as LegalDocType } from '../data/legal';

// Turns email addresses inside a plain string into mailto links; everything
// else is left as text. Kept deliberately narrow — legal copy reads fine as
// plain text otherwise.
const EMAIL_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
function linkify(text: string): React.ReactNode[] {
  return text.split(EMAIL_RE).map((part, i) =>
    part.includes('@') && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(part) ? (
      <a key={i} href={`mailto:${part}`} className="text-td-accent hover:underline">{part}</a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ('h' in block) {
    return <h4 className="text-td-purple font-[700] text-[16px] mt-4 mb-0">{block.h}</h4>;
  }
  if ('sh' in block) {
    return <h5 className="text-td-purple/90 font-[600] text-[14px] mt-2 mb-0">{block.sh}</h5>;
  }
  if ('p' in block) {
    return <p>{linkify(block.p)}</p>;
  }
  if ('ul' in block) {
    return (
      <ul className="list-disc pl-5 flex flex-col gap-1.5">
        {block.ul.map((item, i) => <li key={i}>{linkify(item)}</li>)}
      </ul>
    );
  }
  if ('kv' in block) {
    return (
      <div className="flex flex-col gap-1">
        {block.kv.map(([label, value], i) => (
          <div key={i}>
            <span className="font-[600] text-td-purple">{label}:</span>{' '}
            <span>{linkify(value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function LegalDoc({ slug }: { slug: string }) {
  const doc = getLegalDoc(slug) as LegalDocType | undefined;
  if (!doc) return null;

  const related = ['terms', 'privacy', 'paia-manual', 'ecta-disclosure'].filter((s) => s !== slug);

  return (
    <main className="relative py-[2rem] my-[1.5rem]">
      <section id={`${slug}-page`} className="section-wrapper overflow-hidden pt-24">
        <h2>{doc.title}</h2>
        <h3 className="heading-text mb-[10px]">{doc.subtitle}</h3>
        <p className="intro !mb-[2rem]">Effective date: {doc.effectiveDate}</p>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 mt-2 flex flex-col gap-3 text-gray-700 text-[14.5px] leading-relaxed">

          <a
            href={doc.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start inline-flex items-center gap-2 text-[13px] font-[600] text-td-purple border border-td-purple/25 rounded-full px-4 py-2 mb-3 transition-colors hover:bg-td-purple hover:text-white"
          >
            <i aria-hidden="true" className="!bg-transparent !p-0 fas fa-file-arrow-down text-[13px]"></i>
            Download as PDF
          </a>

          {doc.blocks.map((block, i) => <Block key={i} block={block} />)}

          <p className="mt-6 pt-4 border-t border-gray-200 text-[13px] text-gray-500">
            Related:{' '}
            {related.map((s, i) => (
              <React.Fragment key={s}>
                <Link href={`/${s}`} className="text-td-accent hover:underline">
                  {(getLegalDoc(s) as LegalDocType | undefined)?.navLabel}
                </Link>
                {i < related.length - 1 ? ' · ' : ''}
              </React.Fragment>
            ))}
          </p>

        </div>
      </section>
    </main>
  );
}
