import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { LeadQueryParams, LeadStatus, LeadSource } from '../types';

const LEADS_PER_PAGE = 10;

// Build filter query from request params
const buildFilterQuery = (
  params: LeadQueryParams,
  userId: string,
  role: string
): Record<string, unknown> => {
  const query: Record<string, unknown> = {};

  // Sales users can only see their own leads
  if (role === 'sales') {
    query.createdBy = new mongoose.Types.ObjectId(userId);
  }

  if (params.status) query.status = params.status;
  if (params.source) query.source = params.source;

  if (params.search) {
    const searchRegex = new RegExp(params.search, 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  return query;
};

export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = 1,
      limit = LEADS_PER_PAGE,
    } = req.query as unknown as LeadQueryParams;

    const currentPage = Math.max(1, Number(page));
    const pageLimit = Math.min(50, Math.max(1, Number(limit)));
    const skip = (currentPage - 1) * pageLimit;

    const filterQuery = buildFilterQuery(
      { status: status as LeadStatus, source: source as LeadSource, search },
      req.user!.id,
      req.user!.role
    );

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filterQuery)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Lead.countDocuments(filterQuery),
    ]);

    const totalPages = Math.ceil(total / pageLimit);

    res.json({
      success: true,
      message: 'Leads fetched successfully',
      data: {
        items: leads,
        pagination: {
          total,
          page: currentPage,
          limit: pageLimit,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!lead) throw new AppError('Lead not found', 404);

    // Sales users can only view their own leads
    if (
      req.user!.role === 'sales' &&
      lead.createdBy.toString() !== req.user!.id
    ) {
      throw new AppError('Access denied', 403);
    }

    res.json({ success: true, message: 'Lead fetched', data: { lead } });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new AppError('Lead not found', 404);

    // Sales can only update their own leads
    if (
      req.user!.role === 'sales' &&
      lead.createdBy.toString() !== req.user!.id
    ) {
      throw new AppError('Access denied', 403);
    }

    // Prevent changing createdBy
    delete req.body.createdBy;

    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new AppError('Lead not found', 404);

    // Only admin can delete, or sales user their own leads
    if (
      req.user!.role === 'sales' &&
      lead.createdBy.toString() !== req.user!.id
    ) {
      throw new AppError('Access denied', 403);
    }

    await lead.deleteOne();

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, source, search } = req.query as unknown as LeadQueryParams;

    const filterQuery = buildFilterQuery(
      { status: status as LeadStatus, source: source as LeadSource, search },
      req.user!.id,
      req.user!.role
    );

    const leads = await Lead.find(filterQuery)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const csvHeaders = ['Name', 'Email', 'Status', 'Source', 'Notes', 'Created At'];
    const csvRows = leads.map((lead) => [
      `"${lead.name}"`,
      `"${lead.email}"`,
      `"${lead.status}"`,
      `"${lead.source}"`,
      `"${lead.notes ?? ''}"`,
      `"${new Date(lead.createdAt).toISOString()}"`,
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=gigflow-leads.csv');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matchStage =
      req.user!.role === 'sales'
        ? { $match: { createdBy: new mongoose.Types.ObjectId(req.user!.id) } }
        : { $match: {} };

    const stats = await Lead.aggregate([
      matchStage,
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const sourceStats = await Lead.aggregate([
      matchStage,
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalLeads = await Lead.countDocuments(
      req.user!.role === 'sales' ? { createdBy: req.user!.id } : {}
    );

    res.json({
      success: true,
      message: 'Stats fetched',
      data: { statusStats: stats, sourceStats, totalLeads },
    });
  } catch (error) {
    next(error);
  }
};
