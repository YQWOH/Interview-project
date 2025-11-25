import mongoose, { Document, Schema } from "mongoose";

export interface IImage extends Document {
  name: string;
  originalName: string;
  filename: string;
  filepath: string;
  size: number;
  mimetype: string;
  isBookmarked: boolean;
  userId: mongoose.Types.ObjectId;
  uploadedAt: Date;
  updatedAt: Date;
  detections?: {
    detectedAt: Date;
    results: Array<{
      class_id: number;
      class_name: string;
      confidence: number;
      description: string;
    }>;
    metadata: {
      image_width: number;
      image_height: number;
      image_mode: string;
      total_detections: number;
      average_confidence: number;
      model_name: string;
      device: string;
    };
    summary: string;
  };
}

const ImageSchema = new Schema<IImage>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  isBookmarked: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  detections: {
    detectedAt: Date,
    results: [
      {
        class_id: Number,
        class_name: String,
        confidence: Number,
        description: String,
      },
    ],
    metadata: {
      image_width: Number,
      image_height: Number,
      image_mode: String,
      total_detections: Number,
      average_confidence: Number,
      model_name: String,
      device: String,
    },
    summary: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
ImageSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for search optimization
ImageSchema.index({ name: "text", originalName: "text" });
ImageSchema.index({ isBookmarked: 1 });

export const Image = mongoose.model<IImage>("Image", ImageSchema);
