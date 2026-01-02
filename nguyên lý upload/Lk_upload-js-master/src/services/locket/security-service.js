const CryptoJS = require("crypto-js");
const { logInfo, logError } = require("../logger.service.js");

// const decryptLoginData = (encryptedEmail, encryptedPassword) => {
//     try {
//         logInfo("decryptLoginData", "Start decrypting login data");
//         const secretKey = process.env.HASH_SECRET_KEY || 'default-key';
//         // Decrypt with same configuration as encryption
//         const decryptedEmail = CryptoJS.AES.decrypt(encryptedEmail, secretKey, {
//             mode: CryptoJS.mode.ECB,
//             padding: CryptoJS.pad.Pkcs7
//         }).toString(CryptoJS.enc.Utf8);

//         const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, secretKey, {
//             mode: CryptoJS.mode.ECB,
//             padding: CryptoJS.pad.Pkcs7
//         }).toString(CryptoJS.enc.Utf8);

//         if (!decryptedEmail || !decryptedPassword) {
//             throw new Error("Failed to decrypt login data - empty result");
//         }
//         return { decryptedEmail, decryptedPassword };
//     } catch (error) {
//         logError("decryptLoginData", `Decryption error: ${error.message}`);
//         throw new Error("Decryption failed: " + error.message);
//     }
// };

const decryptLoginData = (encryptedEmail, encryptedPassword) => {
    // We dont decrypt anymore
    const decryptedEmail = encryptedEmail;
    const decryptedPassword = encryptedPassword;
    return { decryptedEmail, decryptedPassword };
}

module.exports = {
    decryptLoginData,
};
