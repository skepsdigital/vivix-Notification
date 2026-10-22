import { APIGatewayProxyEvent } from 'aws-lambda';
import { createHash, timingSafeEqual } from 'crypto';

const safeEqual = (a: string, b: string): boolean => {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
};

const getAuthorizationHeader = (event: APIGatewayProxyEvent): string | undefined => {
  const headers = event.headers || {};
  const key = Object.keys(headers).find((name) => name.toLowerCase() === 'authorization');
  return key ? headers[key] : undefined;
};

export const isAuthorized = (event: APIGatewayProxyEvent): boolean => {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    console.error('BASIC_AUTH_USER e BASIC_AUTH_PASSWORD não configuradas.');
    return false;
  }

  const header = getAuthorizationHeader(event);
  if (!header || header.slice(0, 6).toLowerCase() !== 'basic ') return false;

  const decoded = Buffer.from(header.slice(6).trim(), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator < 0) return false;

  const userOk = safeEqual(decoded.slice(0, separator), expectedUser);
  const passwordOk = safeEqual(decoded.slice(separator + 1), expectedPassword);
  return userOk && passwordOk;
};
