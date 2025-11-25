/**
 * Test setup and configuration
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

/**
 * Connect to in-memory MongoDB for testing
 */
export const connectDatabase = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
};

/**
 * Clear all test data
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Close database connection and stop server
 */
export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

/**
 * Setup before all tests
 */
beforeAll(async () => {
  await connectDatabase();
});

/**
 * Clear data after each test
 */
afterEach(async () => {
  await clearDatabase();
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  await closeDatabase();
});
