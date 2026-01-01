import axios from "axios";
import { API_URL } from "./api";

/**
 * Kiểm tra token người dùng
 * @param idToken string
 * @param localId string
 * @returns status code của server (200 nếu hợp lệ)
 */
export const getInfocheckAuth = async (
  idToken: string,
  localId: string
): Promise<boolean> => {
  const res = await axios.post(API_URL.CHECK_AUTH_URL.toString(), {
    idToken,
    localId,
  });

  return res.status === 200;
};

