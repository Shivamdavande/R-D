import { Schema, model, Document, Types } from 'mongoose';

export type ActivityAction = 
  | 'SITE_CREATED'
  | 'SITE_UPDATED'
  | 'SITE_CLOSED'
  | 'SITE_REOPENED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'EXPENSE_ADDED'
  | 'EXPENSE_UPDATED'
  | 'EXPENSE_DELETED'
  | 'EXPENSES_SYNCED'
  | 'SITE_IMAGE_ADDED'
  | 'SITE_IMAGE_DELETED';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  siteId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  action: ActivityAction;
  details: string;
  expenseId?: Types.ObjectId;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    action: { 
      type: String, 
      required: true,
      index: true 
    },
    details: { type: String, required: true },
    expenseId: { type: Schema.Types.ObjectId, ref: 'Expense' },
    previousValues: { type: Schema.Types.Mixed },
    newValues: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
