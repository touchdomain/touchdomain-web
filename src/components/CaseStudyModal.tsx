'use client';

import { CaseStudy } from './../data/caseStudies';

interface CaseStudyModalProps {
  project: CaseStudy | null;
  onClose: () => void;
}

export default function CaseStudyModal({ project, onClose }: CaseStudyModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <span className="inline-block bg-td-purple text-white text-[10.5px] font-[700] uppercase tracking-wide px-3 py-1 rounded-full mb-2">
              {project.category}
            </span>
            <h3 className="text-lg font-bold text-td-purple leading-tight">{project.clientName}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none shrink-0 ml-3">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <div>
            <span className="block text-td-accent text-[11px] font-[700] uppercase tracking-wide mb-1">The Challenge</span>
            <p className="text-gray-700 text-[14px] leading-relaxed">{project.challenge}</p>
          </div>
          <div>
            <span className="block text-td-accent text-[11px] font-[700] uppercase tracking-wide mb-1">Our Approach</span>
            <p className="text-gray-700 text-[14px] leading-relaxed">{project.approach}</p>
          </div>
          <div>
            <span className="block text-td-accent text-[11px] font-[700] uppercase tracking-wide mb-1">The Result</span>
            <p className="text-gray-700 text-[14px] leading-relaxed">{project.result}</p>
          </div>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center text-[14px] px-[20px] py-[10px] bg-td-purple text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold mt-2"
            >
              Visit Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
