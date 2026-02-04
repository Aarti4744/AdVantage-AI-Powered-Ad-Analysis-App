import axios from "axios";
import { ProcessAudit } from "../types/ProcessAudit ";

/* ================= BASE CONFIG ================= */

export const BASE_URL =
  "https://forms-lock-surprise-viii.trycloudflare.com/api/v1/";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= API KEYS ================= */

export const APIKEY = {
  login: "auth/login",
  verifyOtp: "auth/verify-otp",
  signUp: "auth/signup",
  profile: "auth/profile",

  getS3ImageUrl: "s3/upload-url",

  audit: "audits/process",
  auditHistory: "audits/history",
  getAuditById: "audits/",
};

/* ================= AUTH APIs ================= */

/**
 * SIGN IN: Generates OTP
 * Payload: { email }
 */
export const loginApi = (payload: { email: string }) =>
  api.post(APIKEY.login, payload);

/**
 * SIGN UP
 * Payload: { name, email }
 */
export const signUpApi = (payload: { name: string; email: string }) =>
  api.post(APIKEY.signUp, payload);

/**
 * VERIFY OTP
 * Payload: { email, otp }
 */
export const verifyOtpApi = (payload: { email: string; otp: string }) =>
  api.post(APIKEY.verifyOtp, payload);

/**
 * GET LOGGED-IN USER PROFILE
 */
export const getProfileApi = () =>
  api.get(APIKEY.profile);

/**
 * GET PROFILE BY ID
 */
export const getProfileByIdApi = (id: string | number) =>
  api.get(`${APIKEY.profile}/${id}`);




/**
 * GET AUDIT HISTORY (Paginated)
 */
export const getAuditHistoryApi = (params: {
  user_id: string | number;
  page: number;
  limit: number;
}) =>
  api.get(APIKEY.auditHistory, { params });

/**
 * GET AUDIT BY ID
 */
export const getAuditByIdApi = (id: string | number) =>
  api.get(`${APIKEY.getAuditById}${id}`);

/* ================= S3 APIs ================= */

export const fetchS3ImageUrlApi = async (
  fileName: string,
  contentType: string
) => {
  try {
    const res = await api.get(APIKEY.getS3ImageUrl, {
      params: {
        file_name: fileName,
        content_type: contentType,
      },
    });
    return res.data;
  } catch (error) {
console.log(error);

  }
};

/* ================= AUDIT APIs ================= */

export const processAuditApi = async (payload: {
  user_id: number;
  s3_key: string;
  target_audience: string;
}) => {
  try {
    const res = await api.post(APIKEY.audit, payload);
    return res.data;
  } catch (error) {
console.log(error);
  }
};

/* ================= EXPORTS ================= */

export default api;

/* ================= S3 PUBLIC BASE URL ================= */

export const S3_BASE_URL =
  "https://anuj-nextjs-s3-test.s3.eu-north-1.amazonaws.com/";
