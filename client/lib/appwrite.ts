import { UserHealthProfile } from '@/context/UserHealthContext';
import { MedicineSearchResult, PrescriptionData } from '@/types/prescription';
import { Account, Client, Databases, ID, Query, Storage, ImageGravity, ImageFormat } from 'appwrite';

// Get configuration from environment variables with validation
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT as string;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID as string;
const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID as string;
const APPWRITE_USER_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID as string;
const APPWRITE_HEALTH_PROFILE_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_HEALTH_PROFILE_COLLECTION_ID as string;
const APPWRITE_PRESCRIPTION_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_PRESCRIPTION_COLLECTION_ID as string;
const APPWRITE_STORAGE_BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID as string;

// Validate that all required environment variables are set
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_DATABASE_ID || !APPWRITE_USER_COLLECTION_ID || !APPWRITE_STORAGE_BUCKET_ID || !APPWRITE_HEALTH_PROFILE_COLLECTION_ID || !APPWRITE_PRESCRIPTION_COLLECTION_ID) {
  throw new Error('Missing required Appwrite environment variables. Please check your .env file.');
}

class AppwriteService {
  client: Client;
  account: Account;
  databases: Databases;
  storage: Storage;

  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
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
          Query.equal('userId', userId)
        ]
      );
    } catch (error) {
      console.log('Appwrite service :: getUserProfile :: error', error);
      return null;
    }
  }

  // Storage Methods
  async uploadImage(fileUri: string, fileName?: string): Promise<string | null> {
    try {
      const fileId = ID.unique();
      
      // For React Native/Expo, we need to create a File object from URI
      const file = {
        name: fileName || `image_${Date.now()}.jpg`,
        type: 'image/jpeg',
        uri: fileUri,
      };
      
      const response = await this.storage.createFile(
        APPWRITE_STORAGE_BUCKET_ID,
        fileId,
        file as any, // Cast to any for React Native compatibility
        undefined // permissions - will use bucket default
      );
      
      return response.$id;
    } catch (error) {
      console.log('Appwrite service :: uploadImage :: error', error);
      throw error;
    }
  }

  getImageUrl(fileId: string): string {
    return this.storage.getFilePreview(
      APPWRITE_STORAGE_BUCKET_ID,
      fileId,
      800, // width
      600, // height
      ImageGravity.Center, // gravity
      100, // quality
      0, // borderWidth
      '', // borderColor
      0, // borderRadius
      1, // opacity
      0, // rotation
      'ffffff', // background
      ImageFormat.Webp // output format
    ).toString();
  }

  getImageDownloadUrl(fileId: string): string {
    return this.storage.getFileDownload(
      APPWRITE_STORAGE_BUCKET_ID,
      fileId
    ).toString();
  }

  async deleteImage(fileId: string): Promise<boolean> {
    try {
      await this.storage.deleteFile(APPWRITE_STORAGE_BUCKET_ID, fileId);
      return true;
    } catch (error) {
      console.log('Appwrite service :: deleteImage :: error', error);
      return false;
    }
  }

  async getImageFile(fileId: string) {
    try {
      return await this.storage.getFile(APPWRITE_STORAGE_BUCKET_ID, fileId);
    } catch (error) {
      console.log('Appwrite service :: getImageFile :: error', error);
      return null;
    }
  }

  // Health Profile Methods
  async createHealthProfile(userId: string, healthProfile: UserHealthProfile) {
    try {
      // Convert the health profile to a format suitable for Appwrite
      const healthProfileData = {
        userId,
        allergies: JSON.stringify(healthProfile.allergies || []),
        medicalConditions: JSON.stringify(healthProfile.medicalConditions || []),
        currentMedications: JSON.stringify(healthProfile.currentMedications || []),
        dietaryRestrictions: JSON.stringify(healthProfile.dietaryRestrictions || []),
        emergencyContacts: JSON.stringify(healthProfile.emergencyContacts || []),
        bloodType: healthProfile.bloodType || '',
        dateOfBirth: healthProfile.dateOfBirth || '',
        weight: healthProfile.weight || 0,
        height: healthProfile.height || 0,
        additionalNotes: healthProfile.additionalNotes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return await this.databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_HEALTH_PROFILE_COLLECTION_ID,
        ID.unique(),
        healthProfileData
      );
    } catch (error) {
      console.log('Appwrite service :: createHealthProfile :: error', error);
      throw error;
    }
  }

  async updateHealthProfile(documentId: string, healthProfile: UserHealthProfile) {
    try {
      // Convert the health profile to a format suitable for Appwrite
      const healthProfileData = {
        allergies: JSON.stringify(healthProfile.allergies || []),
        medicalConditions: JSON.stringify(healthProfile.medicalConditions || []),
        currentMedications: JSON.stringify(healthProfile.currentMedications || []),
        dietaryRestrictions: JSON.stringify(healthProfile.dietaryRestrictions || []),
        emergencyContacts: JSON.stringify(healthProfile.emergencyContacts || []),
        bloodType: healthProfile.bloodType || '',
        dateOfBirth: healthProfile.dateOfBirth || '',
        weight: healthProfile.weight || 0,
        height: healthProfile.height || 0,
        additionalNotes: healthProfile.additionalNotes || '',
        updatedAt: new Date().toISOString(),
      };

      return await this.databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_HEALTH_PROFILE_COLLECTION_ID,
        documentId,
        healthProfileData
      );
    } catch (error) {
      console.log('Appwrite service :: updateHealthProfile :: error', error);
      throw error;
    }
  }

  async getHealthProfile(userId: string) {
    try {
      const response = await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_HEALTH_PROFILE_COLLECTION_ID,
        [
          Query.equal('userId', userId)
        ]
      );

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        // Parse JSON fields back to arrays/objects
        return {
          $id: doc.$id,
          userId: doc.userId,
          allergies: JSON.parse(doc.allergies || '[]'),
          medicalConditions: JSON.parse(doc.medicalConditions || '[]'),
          currentMedications: JSON.parse(doc.currentMedications || '[]'),
          dietaryRestrictions: JSON.parse(doc.dietaryRestrictions || '[]'),
          emergencyContacts: JSON.parse(doc.emergencyContacts || '[]'),
          bloodType: doc.bloodType || '',
          dateOfBirth: doc.dateOfBirth || '',
          weight: doc.weight || 0,
          height: doc.height || 0,
          additionalNotes: doc.additionalNotes || '',
          profileImageId: doc.profileImageId || '', // Add profile image support
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      }

      return null;
    } catch (error) {
      console.log('Appwrite service :: getHealthProfile :: error', error);
      return null;
    }
  }

  async createOrUpdateHealthProfile(userId: string, healthProfile: UserHealthProfile) {
    try {
      // First, check if a health profile already exists for this user
      const existingProfile = await this.getHealthProfile(userId);

      if (existingProfile) {
        // Update existing profile
        return await this.updateHealthProfile(existingProfile.$id, healthProfile);
      } else {
        // Create new profile
        return await this.createHealthProfile(userId, healthProfile);
      }
    } catch (error) {
      console.log('Appwrite service :: createOrUpdateHealthProfile :: error', error);
      throw error;
    }
  }

  async deleteHealthProfile(userId: string) {
    try {
      const existingProfile = await this.getHealthProfile(userId);
      
      if (existingProfile) {
        // Delete associated profile image if it exists
        if (existingProfile.profileImageId) {
          await this.deleteImage(existingProfile.profileImageId);
        }

        return await this.databases.deleteDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_HEALTH_PROFILE_COLLECTION_ID,
          existingProfile.$id
        );
      }

      return true;
    } catch (error) {
      console.log('Appwrite service :: deleteHealthProfile :: error', error);
      throw error;
    }
    }

    async createPrescription(userId: string, ocrResult:PrescriptionData, searchResult:MedicineSearchResult, image: string, key:string) {
        try {
            const prescriptionData = {
                userId,
                ocrResult: JSON.stringify(ocrResult),
                searchResult: JSON.stringify(searchResult),
                image,
                object_key: key,
            };

            return await this.databases.createDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_PRESCRIPTION_COLLECTION_ID,
                ID.unique(),
                prescriptionData
            );
        } catch (error) {
            console.log('Appwrite service :: createPrescription :: error', error);
            throw error;
        }
    }

    async getPrescriptions(userId: string) {
        try {
            const response = await this.databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_PRESCRIPTION_COLLECTION_ID,
                [
                    Query.equal('userId', userId)
                ]
            );

            return response.documents.map(doc => ({
                ...doc,
                ocrResult: JSON.parse(doc.ocrResult || '{}'),
                searchResult: JSON.parse(doc.searchResult || '{}'),
            }));
        } catch (error) {
            console.log('Appwrite service :: getPrescriptions :: error', error);
            return [];
        }
    }

    async deletePrescription(prescriptionId: string) {
        try {
            return await this.databases.deleteDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_PRESCRIPTION_COLLECTION_ID,
                prescriptionId
            );
        } catch (error) {
            console.log('Appwrite service :: deletePrescription :: error', error);
            throw error;
        }
    }

    async changePrescriptionStatus(prescriptionId: string, status: 'active' | 'inactive' | 'abandoned' | 'completed') {
        try {
            const existingPrescription = await this.databases.getDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_PRESCRIPTION_COLLECTION_ID,
                prescriptionId
            );

            if (existingPrescription) {
                return await this.databases.updateDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_PRESCRIPTION_COLLECTION_ID,
                    prescriptionId,
                    {
                        status
                    }
                );
            }

            throw new Error('Prescription not found');
        } catch (error) {
            console.log('Appwrite service :: changePrescriptionStatus :: error', error);
            throw error;
        }
    }
}

const appwriteService = new AppwriteService();

export default appwriteService;

// Export config for easy access
export {
  APPWRITE_DATABASE_ID, 
  APPWRITE_ENDPOINT, 
  APPWRITE_HEALTH_PROFILE_COLLECTION_ID, 
  APPWRITE_PROJECT_ID, 
  APPWRITE_USER_COLLECTION_ID,
  APPWRITE_STORAGE_BUCKET_ID
};