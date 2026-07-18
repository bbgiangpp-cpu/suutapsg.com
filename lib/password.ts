import crypto from "node:crypto";

export type PasswordCredential = {
    passwordHash: string;
    passwordSalt: string;
};

const hashPassword = (password: string, salt: string) =>
    crypto.scryptSync(password, salt, 64).toString("hex");

export const createPasswordRecord = (password: string) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = hashPassword(password, salt);
    return { salt, hash };
};

const safeCompareHex = (leftHex: string, rightHex: string) => {
    const left = Buffer.from(leftHex, "hex");
    const right = Buffer.from(rightHex, "hex");

    if (left.length !== right.length) {
        return false;
    }

    return crypto.timingSafeEqual(left, right);
};

export const verifyPassword = (
    password: string,
    credential: PasswordCredential,
) => {
    const computedHash = hashPassword(password, credential.passwordSalt);
    return safeCompareHex(computedHash, credential.passwordHash);
};
