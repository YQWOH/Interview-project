import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  action: {
    type: String,
    required: true,
    enum: [
      "upload",
      "download",
      "delete",
      "bookmark",
      "unbookmark",
      "search",
      "list",
    ],
  },
  resource: {
    type: String,
    required: true,
    enum: ["image", "analytics"],
  },
  resourceId: {
    type: String,
  },
  details: {
    type: Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
});

// Index for querying logs
ActivityLogSchema.index({ timestamp: -1 });
ActivityLogSchema.index({ action: 1, resource: 1 });

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  ActivityLogSchema
);
