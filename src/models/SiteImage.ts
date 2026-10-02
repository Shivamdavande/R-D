import { Schema, model, Document, Types } from 'mongoose';
import './User';

export interface ISiteImage extends Document {
  _id: Types.ObjectId;
  siteId: Types.ObjectId;
  imageUrl: string;
  imageKitFileId?: string;
  fileName?: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const siteImageSchema = new Schema<ISiteImage>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    imageUrl: { type: String, required: true },
    imageKitFileId: { type: String },
    fileName: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const SiteImage = model<ISiteImage>('SiteImage', siteImageSchema);
