export default function DashboardOverviewPage() {
  // Mock data - eventually fetch this from Supabase based on the user's active project
  const projectPhase = "Web App Development";
  const projectProgress = 65; 

  const milestones = [
    { id: 1, title: 'Project Kickoff & Onboarding', status: 'completed', date: 'Aug 10' },
    { id: 2, title: 'Brand Identity & Design Concept', status: 'completed', date: 'Aug 24' },
    { id: 3, title: 'Web App Development', status: 'in-progress', date: 'In Progress' },
    { id: 4, title: 'Infrastructure & Cloud Setup', status: 'pending', date: 'Upcoming' },
    { id: 5, title: 'Testing & Final Deployment', status: 'pending', date: 'Upcoming' },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
        <p className="mt-1 text-sm text-slate-400">
          Here is the current status of your project with Touch Domain.
        </p>
      </div>

      {/* Progress Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Current Phase: <span className="text-indigo-400">{projectPhase}</span></h2>
          <span className="text-sm font-medium text-slate-400">{projectProgress}% Complete</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800">
          <div 
            className="h-3 rounded-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${projectProgress}%` }}
          />
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-white mb-6">Project Milestones</h2>
        
        <div className="relative border-l border-slate-800 ml-3 space-y-8">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative pl-8">
              {/* Timeline Dot */}
              <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-slate-900 ${
                milestone.status === 'completed' ? 'bg-indigo-500' :
                milestone.status === 'in-progress' ? 'bg-amber-500' : 'bg-slate-700'
              }`} />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className={`font-medium ${
                    milestone.status === 'completed' ? 'text-slate-300' :
                    milestone.status === 'in-progress' ? 'text-white' : 'text-slate-500'
                  }`}>
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 capitalize">
                    {milestone.status.replace('-', ' ')}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 text-sm text-slate-400 bg-slate-950 px-3 py-1 rounded-md border border-slate-800 w-fit">
                  {milestone.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}