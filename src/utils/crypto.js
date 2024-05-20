// import MD5 from 'crypto-js/md5'
import { SM3, SM4 } from "gm-crypto";

// export function md5(str) {
//   return MD5(str).toString()
// }

/**
 * 对字符串进行SM3散列计算
 * @param {*} str
 * @returns
 */

export function sm3(str) {
  return SM3.digest(str, "utf8", "hex");
}

/**
 * 使用SM4加密数据，密钥为密码
 * @param {*} data
 * @param {*} password
 */
export function sm4Enc(data, password) {
  const h = sm3(password);
  const key = h.slice(0, 32);
  const iv = h.slice(32);
  return (
    iv +
    SM4.encrypt(data, key, {
      iv,
      inputEncoding: "utf8",
      outputEncoding: "hex",
    })
  );
}

/**
 * 使用SM4解密数据，密钥为密码
 * @param {*} data
 * @param {*} password
 */

export function sm4Dec(data, password) {
  const h = sm3(password);
  const key = h.slice(0, 32);
  const iv = data.slice(32);
  return SM4.decrypt(data.slice(32), key, {
    iv,
    inputEncoding: "hex",
    outputEncoding: "utf8",
  });
}
