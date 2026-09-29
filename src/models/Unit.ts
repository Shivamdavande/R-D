import { Schema, model, Document, Types } from 'mongoose';

export interface IUnit extends Document {
  _id: Types.ObjectId;
  name: string;
  isCustom: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const unitSchema = new Schema<IUnit>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isCustom: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Unit = model<IUnit>('Unit', unitSchema);
