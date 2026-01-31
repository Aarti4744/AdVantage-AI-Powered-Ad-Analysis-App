import axios from "axios";

/* ================= BASE CONFIG ================= */

export const BASE_URL =
  "https://study-saturday-offerings-stones.trycloudflare.com/api/v1/";

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
 * SIGN IN: Generates OTP for existing users
 * Screenshot match: { "email": "..." }
 */
export const loginApi = (payload: { email: string }) => 
  api.post(APIKEY.login, payload);

/**
 * SIGN UP: Creates account and generates OTP
 * Screenshot match: { "name": "...", "email": "..." }
 */
export const signUpApi = (payload: { name: string; email: string }) =>
  api.post(APIKEY.signUp, payload);

/**
 * VERIFY OTP: Validates the 6-digit code for both login and signup
 * Screenshot match: { "email": "...", "otp": "..." }
 */
export const verifyOtpApi = (payload: { email: string; otp: string }) => 
  api.post(APIKEY.verifyOtp, payload);

export const getProfileApi = () =>
  api.get(APIKEY.profile);

export const getProfileByIdApi = (id: string | number) =>
  api.get(`${APIKEY.profile}/${id}`);
/* ================= AUDIT APIs ================= */



export const processAuditApi = (payload: any) =>
  api.post(APIKEY.audit, payload);

export const getAuditHistoryApi = (params: { 
  user_id: string | number; 
  page: number; 
  limit: number 
}) => api.get(APIKEY.auditHistory, { params });



export const getAuditByIdApi = (id: string | number) =>
  api.get(`${APIKEY.getAuditById}${id}`);

export default api;

export const S3_BASE_URL =
  "https://anuj-nextjs-s3-test.s3.eu-north-1.amazonaws.com/";