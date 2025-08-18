import * as FileSystem from "expo-file-system";

class AWSS3Service {

    // Method 1: Direct upload using presigned URL (RECOMMENDED - Backend required)
    async uploadWithPresignedUrl(
        fileUri: string,
        fileName?: string
    ): Promise<string> {
        try {
            const finalFileName = fileName || `prescription_${Date.now()}.jpg`;

            // Step 1: Get presigned URL from your backend
            const presignedUrlResponse = await fetch(
                `${process.env.EXPO_PUBLIC_NODE_API_URL}/api/s3/presigned-url`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileName: finalFileName,
                        fileType: "image/jpeg",
                    }),
                }
            );

            const { uploadUrl, fileUrl } = await presignedUrlResponse.json();

            // Step 2: Upload file using presigned URL
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                throw new Error("File does not exist");
            }

            const uploadResponse = await FileSystem.uploadAsync(
                uploadUrl,
                fileUri,
                {
                    httpMethod: "PUT",
                    headers: {
                        "Content-Type": "image/jpeg",
                    },
                }
            );

            if (uploadResponse.status !== 200) {
                throw new Error(
                    `Upload failed with status: ${uploadResponse.status}`
                );
            }

            return fileUrl; // Return the public URL of uploaded file
        } catch (error) {
            console.error("S3 presigned upload error:", error);
            throw error;
        }
    }

    // Method 2: Upload via your backend API (RECOMMENDED for security)
    async uploadViaBackend(
        fileUri: string,
        fileName?: string
    ): Promise<{
        fileUrl: string;
        key: string;
        size: number;
    }> {
        try {

            // Create FormData
            const formData = new FormData();
            formData.append("file", {
                uri: fileUri,
                type: "image/jpeg",
                name: fileName,
            } as any);

            // Upload via your backend
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_NODE_API_URL}/api/prescription/upload`,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Backend upload failed: ${response.status}`);
            }

            const result = await response.json();
            return result.data; // Your backend returns the S3 URL
        } catch (error) {
            console.error("Backend S3 upload error:", error);
            throw error;
        }
    }

    // Delete file from S3 (requires backend implementation for security)
    async deleteFile(fileName: string): Promise<boolean> {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_NODE_API_URL}/api/s3/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileName }),
            });

            return response.ok;
        } catch (error) {
            console.error("S3 delete error:", error);
            return false;
        }
    }
}

export default new AWSS3Service();
