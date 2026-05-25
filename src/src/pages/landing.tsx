import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { FileText, Sparkles, Clock, Target, ArrowRight, CheckCircle } from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Target,
      title: 'Keyword Matching',
      description: 'AI analyzes job descriptions and injects the exact keywords recruiters look for.'
    },
    {
      icon: Sparkles,
      title: 'Smart Highlighting',
      description: 'Your most relevant experience gets front-and-center placement for each job.'
    },
    {
      icon: Clock,
      title: 'Seconds, Not Hours',
      description: 'Tailor your CV in under 30 seconds. Apply to 10x more jobs effortlessly.'
    }
  ];

  return (
    <div className="space-y-16">
      <section className="pt-12 sm:pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          AI-Powered Resume Optimization
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-6">
          Get more interviews.
          <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            AI tailors your CV to every job in seconds.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Stop sending generic resumes. Our AI rewrites your CV using the exact keywords from each job description,
          highlighting your most relevant experience for every role.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? '/dashboard' : '/auth'}
            className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:scale-105"
          >
            {user ? 'Go to Dashboard' : 'Start Tailoring Free'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
          >
            View Pricing
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          3 free tailors per month. No credit card required.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group p-8 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              {feature.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <section className="py-16 px-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Land your dream job faster
        </h2>
        <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
          Join thousands of job seekers who have used Resume Tailor AI to customize their resumes
          and increase their interview callback rate.
        </p>
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {['10,000+ Resumes Tailored', '4.9/5 User Rating', '30 Seconds Average Time'].map((stat) => (
            <div key={stat} className="text-center">
              <div className="text-2xl font-bold">{stat.split(' ')[0]}</div>
              <div className="text-emerald-200 text-sm">{stat.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
        <Link
          to={user ? '/dashboard' : '/auth'}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-600 font-semibold shadow-xl hover:bg-emerald-50 transition-all transform hover:scale-105"
        >
          {user ? 'Continue Tailoring' : 'Get Started Free'}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: 1, title: 'Paste Job Description', desc: 'Copy the job posting you want to apply for' },
            { step: 2, title: 'Upload Your CV', desc: 'Paste your existing resume or upload a PDF' },
            { step: 3, title: 'Get Tailored CV', desc: 'AI rewrites your CV in seconds' }
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-bold text-lg mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
