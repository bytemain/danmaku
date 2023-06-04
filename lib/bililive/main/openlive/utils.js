import crypto from 'crypto';

/**
 * @param {*} params
 * @param {string} appKey
 * @param {string} appSecret
 * @returns
 */
export function getEncodeHeader(params = {}, appKey, appSecret) {
  const timestamp = parseInt(Date.now() / 1000 + '');
  const nonce = parseInt(Math.random() * 100000 + '') + timestamp;
  const header = {
    'x-bili-accesskeyid': appKey,
    'x-bili-content-md5': getMd5Content(JSON.stringify(params)),
    'x-bili-signature-method': 'HMAC-SHA256',
    'x-bili-signature-nonce': nonce + '',
    'x-bili-signature-version': '1.0',
    'x-bili-timestamp': timestamp,
  };
  /**
   * @type {string[]}
   */
  const data = [];
  for (const key in header) {
    data.push(`${key}:${header[key]}`);
  }

  const signature = crypto
    .createHmac('sha256', appSecret)
    .update(data.join('\n'))
    .digest('hex');
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...header,
    Authorization: signature,
  };
}

/**
 * @param {string} str
 * @returns
 */
export function getMd5Content(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}
