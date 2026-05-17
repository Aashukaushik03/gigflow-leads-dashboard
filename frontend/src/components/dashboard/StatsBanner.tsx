import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, XCircle, Phone, Star } from 'lucide-react';
import { leadsApi } from '../../api/leads';
import { LeadStats } from '../../types';
import Spinner from '../ui/Spinner';

const statIcons = {
  New: <Star size={18} className="text-blue-500" />,
  Contacted: <Phone size={18} className="text-yellow-500" />,
  Qualified: <CheckCircle size={18} className="text-emerald-500" />,
  Lost: <XCircle size={18} className="text-red-500" />,
};

const StatsBanner: React.FC = () => {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi.getStats()
      .then((res) => { if (res.data.data) setStats(res.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (!stats) return null;

  const statusMap = Object.fromEntries(stats.statusStats.map((s) => [s._id, s.count]));

  const cards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: <Users size={18} className="text-brand-500" />, color: 'from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20' },
    { label: 'New', value: statusMap['New'] || 0, icon: statIcons.New, color: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' },
    { label: 'Contacted', value: statusMap['Contacted'] || 0, icon: statIcons.Contacted, color: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' },
    { label: 'Qualified', value: statusMap['Qualified'] || 0, icon: statIcons.Qualified, color: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20' },
    { label: 'Lost', value: statusMap['Lost'] || 0, icon: statIcons.Lost, color: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`card p-4 bg-gradient-to-br ${card.color} border-0 animate-fade-in`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{card.label}</span>
            {card.icon}
          </div>
          <p className="text-2xl font-bold text-surface-800 dark:text-surface-100 font-display">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsBanner;
