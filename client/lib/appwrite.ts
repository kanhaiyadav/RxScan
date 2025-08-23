// lib/appwrite.ts
import { Client, Account, Databases, ID } from 'appwrite';

// Get configuration from environment variables with validation
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT as string;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID as string;
const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID as string;
const APPWRITE_USER_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID as string;

// Validate that all required environment variables are set
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_DATABASE_ID || !APPWRITE_USER_COLLECTION_ID) {
  throw new Error('Missing required Appwrite environment variables. Please check your .env file.');
}

class AppwriteService {
  client: Client;
  account: Account;
  databases: Databases;

  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
  }

  // Auth Methods
  async createAccount(email: string, password: string, name?: string) {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      if (userAccount) {
        // Auto sign in after account creation
        return this.signIn(email, password);
      } else {
        return userAccount;
      }
    } catch (error) {
      console.log('Appwrite service :: createAccount :: error', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.log('Appwrite service :: signIn :: error', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.log('Appwrite service :: getCurrentUser :: error', error);
      return null;
    }
  }

  async signOut() {
    try {
      await this.account.deleteSessions();
      return true;
    } catch (error) {
      console.log('Appwrite service :: signOut :: error', error);
      return false;
    }
  }

  // Database Methods
  async createUserProfile(userId: string, data: any) {
    try {
      return await this.databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_USER_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          ...data,
        }
      );
    } catch (error) {
      console.log('Appwrite service :: createUserProfile :: error', error);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    try {
      return await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_USER_COLLECTION_ID,
        [
          // Query.equal('userId', userId)
        ]
      );
    } catch (error) {
      console.log('Appwrite service :: getUserProfile :: error', error);
      return null;
    }
  }
}

const appwriteService = new AppwriteService();

export default appwriteService;

// Export config for easy access
export {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID,
};