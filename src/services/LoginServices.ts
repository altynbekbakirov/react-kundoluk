import axios from "axios";
import { LoginModel } from "../models/LoginModel";
import { webUrl } from "./CommonServices";
import { ApiResponse } from "../models/ApiResponse";
import { ErrorResponse } from "../models/ErrorResponse";

export class PasswordChangeException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordChangeException";
  }
}

export async function authStudentUser(
  username: string,
  password: string,
  device: string,
  fcmToken: string
): Promise<LoginModel> {
  try {
    const response = await axios.post<LoginModel>(
      `${webUrl}/auth/loginStudent`,
      {
        username,
        password,
        device,
        fcm_token: fcmToken,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 410) {
        throw new PasswordChangeException("Password change required");
      }

      // Handle structured error responses
      if (data && typeof data === 'object' && 'resultMessage' in data) {
        throw new Error(data.resultMessage);
      }

      throw new Error(
        typeof data === "string" ? data : JSON.stringify(data)
      );
    }
    throw new Error("Unexpected error: " + (error as Error).message);
  }
}

export async function authTeacherUser({
    token,
    access,
    refresh,
    device,
    fcmToken,
    lang,
    error,
}: {
    token: string;
    access: string;
    refresh: string;
    device: string;
    fcmToken: string;
    lang: string;
    error: boolean;
}): Promise<LoginModel> {
    try {
        const response = await fetch(`${webUrl}/mugalimauth/storetokenmobile/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token,
                access,
                refresh,
                device,
                fcm_token: fcmToken,
                lang,
                error,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            const loginResponse: ApiResponse<LoginModel> = result;

            if (!loginResponse.data) {
                throw new Error('No data in response');
            }

            return loginResponse.data;
        } else {
            const errorResponse: ErrorResponse = result;
            throw new Error(errorResponse.resultMessage || 'Authentication failed');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Auth Error: ${error.message}`);
        }
        throw new Error('Auth Error: Unknown error occurred');
    }
}