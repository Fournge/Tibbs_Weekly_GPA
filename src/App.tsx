/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Phone, 
  MessageSquare, 
  UserPlus, 
  FileText, 
  ClipboardCheck, 
  AlertCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react';

// --- Constants & Types ---

type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

interface MetricState {
  actual: number;
  target: number;
}

interface Metrics {
  vcItems: MetricState;
  quotes: MetricState;
  calls: MetricState;
  texts: MetricState;
  referrals: MetricState;
}

const INITIAL_STATE: Metrics = {
  vcItems: { actual: 0, target: 10 },
  quotes: { actual: 0, target: 50 },
  calls: { actual: 0, target: 500 },
  texts: { actual: 0, target: 100 },
  referrals: { actual: 0, target: 20 },
};

// --- GPA Logic Helpers ---

const getGradeColors = (letter: Grade) => {
  switch(letter) {
    case 'A': return 'bg-pill-a-bg text-pill-a-text';
    case 'B': return 'bg-pill-b-bg text-pill-b-text';
    case 'C': return 'bg-pill-c-bg text-pill-c-text';
    case 'D': return 'bg-pill-c-bg text-pill-c-text'; // Reuse C style for D as approximation
    case 'F': return 'bg-pill-f-bg text-pill-f-text';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getGrade = (percentage: number): { letter: Grade; points: number } => {
  if (percentage >= 95) return { letter: 'A', points: 4.0 };
  if (percentage >= 85) return { letter: 'B', points: 3.0 };
  if (percentage >= 75) return { letter: 'C', points: 2.0 };
  if (percentage >= 65) return { letter: 'D', points: 1.0 };
  return { letter: 'F', points: 0.0 };
};

const getOverallLetterGrade = (gpa: number): Grade => {
  if (gpa >= 3.5) return 'A';
  if (gpa >= 2.5) return 'B';
  if (gpa >= 1.5) return 'C';
  if (gpa >= 0.5) return 'D';
  return 'F';
};

// --- Component ---

export default function App() {
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_STATE);

  const handleInputChange = (metric: keyof Metrics, field: keyof MetricState, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setMetrics(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: numValue
      }
    }));
  };

  const results = useMemo(() => {
    const calc = (m: keyof Metrics) => {
      const { actual, target } = metrics[m];
      const percentage = target > 0 ? (actual / target) * 100 : 0;
      return {
        ...getGrade(percentage),
        percentage: Math.round(percentage),
        actual,
        target
      };
    };

    const vc = { ...calc('vcItems'), label: 'VC Items Bound' };
    const q = { ...calc('quotes'), label: 'Quotes Generated' };
    const c = { ...calc('calls'), label: 'Outbound Calls Made' };
    const t = { ...calc('texts'), label: 'SMS / Texts Sent' };
    const r = { ...calc('referrals'), label: 'Referrals Requested' };

    const productionAvg = (vc.points + q.points) / 2;
    const activityAvg = (c.points + t.points + r.points) / 3;
    const finalGPA = (productionAvg * 0.7) + (activityAvg * 0.3);

    return {
      metrics: {
        vcItems: { group: 'Production', ...vc },
        quotes: { group: 'Production', ...q },
        calls: { group: 'Activity', ...c },
        texts: { group: 'Activity', ...t },
        referrals: { group: 'Activity', ...r },
      },
      finalGPA,
      finalGrade: getOverallLetterGrade(finalGPA),
      idsTriggers: [vc, q, c, t, r].filter(m => m.points <= 2.0),
      productionAvg,
      activityAvg
    };
  }, [metrics]);

  return (
    <div className="flex flex-col min-h-screen bg-sleek-bg">
      {/* Header */}
      <header className="bg-allstate-primary text-white py-5 px-6 md:px-10 flex justify-between items-center border-b-4 border-allstate-border">
        <div className="text-xl font-bold uppercase tracking-wider">Tibbs Insurance Agency Weekly GPA</div>
        <div className="text-right hidden md:block">
          <div className="font-semibold">Monday L10 Meeting Scorecard</div>
          <div className="text-sm opacity-80 uppercase tracking-tighter">Review Period: Week Ending {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="sleek-card md:col-span-2">
            <div className="text-[12px] text-sleek-muted uppercase font-bold tracking-wider mb-2">Overall Team GPA Scorecard</div>
            <div className="flex items-baseline gap-3">
              <div className="text-6xl font-extrabold text-allstate-primary leading-none">{results.finalGPA.toFixed(1)}</div>
              <div className={`text-3xl font-bold ${getGradeColors(results.finalGrade).split(' ')[1]}`}>{results.finalGrade}</div>
            </div>
            <div className="text-sm text-sleek-subtitle mt-2">Weighted composite score across 4 Production Team Members</div>
          </div>
          
          <div className="sleek-card">
            <div className="absolute top-4 right-4 bg-[#EBF8FF] text-[#2B6CB0] px-2 py-1 rounded text-[10px] font-bold">70% Weight</div>
            <div className="text-[12px] text-sleek-muted uppercase font-bold tracking-wider mb-2">Production Avg</div>
            <div className="text-6xl font-extrabold text-[#2D3748] leading-none">{results.productionAvg.toFixed(1)}</div>
            <div className="text-sm text-sleek-subtitle mt-2">VC Items & Quotes</div>
          </div>

          <div className="sleek-card">
            <div className="absolute top-4 right-4 bg-[#EBF8FF] text-[#2B6CB0] px-2 py-1 rounded text-[10px] font-bold">30% Weight</div>
            <div className="text-[12px] text-sleek-muted uppercase font-bold tracking-wider mb-2">Activity Avg</div>
            <div className="text-6xl font-extrabold text-[#2D3748] leading-none">{results.activityAvg.toFixed(1)}</div>
            <div className="text-sm text-sleek-subtitle mt-2">Outbound & Proactive</div>
          </div>
        </div>

        {/* Scoreboard Table */}
        <div className="sleek-card !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F7FAFC] border-b-2 border-[#EDF2F7]">
                <tr>
                  <th className="p-4 text-[12px] uppercase text-sleek-muted font-bold tracking-wider">Metric Group</th>
                  <th className="p-4 text-[12px] uppercase text-sleek-muted font-bold tracking-wider">KPI</th>
                  <th className="p-4 text-[12px] uppercase text-sleek-muted font-bold tracking-wider w-24">Actual</th>
                  <th className="p-4 text-[12px] uppercase text-sleek-muted font-bold tracking-wider w-24">Target</th>
                  <th className="p-4 text-[12px] uppercase text-sleek-muted font-bold tracking-wider">% to Goal</th>
                  <th className="p-4 text-[12px] uppercase text-sleek-muted font-bold tracking-wider w-24">Grade</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(results.metrics) as Array<keyof typeof results.metrics>).map((key) => {
                  const m = results.metrics[key];
                  return (
                    <tr key={key} className="border-bottom border-[#EDF2F7] hover:bg-slate-50 transition-colors">
                      <td className={`p-4 text-sm font-bold ${m.group === 'Production' ? 'text-allstate-primary' : 'text-sleek-muted'}`}>{m.group}</td>
                      <td className="p-4 text-sm">{(m as any).label}</td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={metrics[key as keyof Metrics].actual || ''}
                          onChange={(e) => handleInputChange(key as keyof Metrics, 'actual', e.target.value)}
                          className="w-20 sleek-input text-sm font-mono text-center"
                        />
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={metrics[key as keyof Metrics].target || ''}
                          onChange={(e) => handleInputChange(key as keyof Metrics, 'target', e.target.value)}
                          className="w-20 sleek-input text-sm font-mono text-center border-dashed"
                        />
                      </td>
                      <td className="p-4 text-sm font-mono font-semibold">{m.percentage.toFixed(1)}%</td>
                      <td className="p-4">
                        <span className={`sleek-grade-pill ${getGradeColors(m.letter)}`}>
                          {m.letter} ({m.points.toFixed(1)})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Insights */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-7 bg-insight-bg border-l-8 border-insight-border p-6 rounded-r-xl">
            <div className="text-[13px] font-extrabold text-[#2B6CB0] flex items-center gap-2 mb-3 tracking-widest">
              <Zap className="w-4 h-4" /> STRATEGIC INSIGHT
            </div>
            <p className="text-sm leading-relaxed text-[#2C5282]">
              {results.activityAvg < 2.0 
                ? "The team is not making enough calls and texts. This could mean we will have fewer sales later, even if we are doing well now."
                : "The team is doing a good job keeping up with calls and texts. This helps us find new people to work with."
              }
              {" "}
              {results.productionAvg >= 3.5 
                ? "We are very good at closing sales right now. We must keep working hard to stay on top."
                : "We need to get better at our daily tasks. Small improvements in how we work will help the whole team win."
              }
            </p>
          </div>

          <div className="md:col-span-5 bg-ids-bg border-l-8 border-ids-border p-6 rounded-r-xl">
            <div className="text-[13px] font-extrabold text-[#C53030] flex items-center gap-2 mb-3 tracking-widest">
               <AlertCircle className="w-4 h-4" /> IDS TRIGGERS (MOVE TO ISSUES LIST)
            </div>
            {results.idsTriggers.length > 0 ? (
              <ul className="text-sm text-[#9B2C2C] space-y-2 list-disc pl-5 font-semibold">
                {results.idsTriggers.map((m, i) => (
                  <li key={i}>{m.label} ({m.percentage}% of Goal)</li>
                ))}
                {results.idsTriggers.length > 0 && <li>Activity/Production Correlation Disconnect</li>}
              </ul>
            ) : (
              <p className="text-sm text-green-700 font-bold italic">No critical anomalies detected for the L10 Issues List.</p>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 px-10 text-center text-[11px] text-sleek-muted font-medium border-t border-slate-200 uppercase tracking-widest">
        Internal Use Only • Data Strategy Consultant Report • Tibbs Insurance Agency
      </footer>
    </div>
  );
}
