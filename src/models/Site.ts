import { Schema, model, Document, Types } from 'mongoose';

export type SiteStatus = 'ACTIVE' | 'COMPLETED' | 'CLOSED';

export interface ISite extends Document {
  _id: Types.ObjectId;
  siteName: string;
  clientName: string;
  workOrderNumber: string;
  workOrderDate?: Date;
  contractValue: number;
  location?: string;
  startDate?: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  description?: string;
  status: SiteStatus;
  createdBy: Types.ObjectId;
  closedBy?: Types.ObjectId;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const siteSchema = new Schema<ISite>(
  {
    siteName: { type: String, required: true, trim: true, index: true },
    clientName: { type: String, required: true, trim: true },
    workOrderNumber: { type: String, required: true, trim: true, index: true },
    workOrderDate: { type: Date },
    contractValue: { type: Number, default: 0, min: 0 },
    location: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    expectedEndDate: { type: Date },
    actualEndDate: { type: Date },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CLOSED'],
      default: 'ACTIVE',
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date }
  },
  { timestamps: true }
);

export const Site = model<ISite>('Site', siteSchema);
