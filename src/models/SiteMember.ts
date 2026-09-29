import { Schema, model, Document, Types } from 'mongoose';
import { UserRole } from './User';

export interface ISiteMember extends Document {
  _id: Types.ObjectId;
  siteId: Types.ObjectId;
  userId: Types.ObjectId;
  role: UserRole;
  assignedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const siteMemberSchema = new Schema<ISiteMember>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['OWNER', 'SUPERVISOR', 'VIEWER'],
      default: 'SUPERVISOR'
    },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Prevent duplicate membership for same site & user
siteMemberSchema.index({ siteId: 1, userId: 1 }, { unique: true });

export const SiteMember = model<ISiteMember>('SiteMember', siteMemberSchema);
