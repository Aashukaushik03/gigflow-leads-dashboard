import React, { useState, useEffect } from 'react';
import { Lead, LeadFormData, LEAD_STATUSES, LEAD_SOURCES } from '../../types';
import { leadsApi } from '../../api/leads';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

interface LeadFormProps {
  lead?: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

const defaultForm: LeadFormData = {
  name: '',
  email: '',
  status: 'New',
  source: 'Website',
  notes: '',
};

interface FormErrors {
  name?: string;
  email?: string;
  source?: string;
}

const LeadForm: React.FC<LeadFormProps> = ({ lead, onSuccess, onCancel }) => {
  const [form, setForm] = useState<LeadFormData>(
    lead
      ? { name: lead.name, email: lead.email, status: lead.status, source: lead.source, notes: lead.notes || '' }
      : defaultForm
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(lead);

  useEffect(() => {
    if (lead) {
      setForm({ name: lead.name, email: lead.email, status: lead.status, source: lead.source, notes: lead.notes || '' });
    }
  }, [lead]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!form.source) {
      newErrors.source = 'Source is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && lead) {
        await leadsApi.updateLead(lead._id, form);
        toast.success('Lead updated successfully!');
      } else {
        await leadsApi.createLead(form);
        toast.success('Lead created successfully!');
      }
      onSuccess();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter lead name"
          className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
          autoFocus
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="lead@example.com"
          className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Status + Source in a row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Status
          </label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Source <span className="text-red-500">*</span>
          </label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className={`input-field ${errors.source ? 'border-red-400' : ''}`}
          >
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.source && <p className="mt-1 text-xs text-red-500">{errors.source}</p>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Notes <span className="text-surface-400 font-normal">(optional)</span>
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Add any notes about this lead..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSubmitting}>
          {isSubmitting && <Spinner size="sm" />}
          {isEdit ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
