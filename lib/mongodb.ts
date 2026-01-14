
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI is not defined. Using local fallback for development.');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/workspace', opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

const DataSchema = new mongoose.Schema({
  id: { type: String, default: 'main_storage', unique: true },
  tasks: { type: Array, default: [] },
  teamMembers: { type: [String], default: ['Akhilesh', 'Pravallika', 'Chandu', 'Sharanya'] }
}, { timestamps: true, minimize: false });

export const DataModel = mongoose.models.WorkspaceData || mongoose.model('WorkspaceData', DataSchema);
