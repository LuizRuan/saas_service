import { ParsedQs } from 'qs';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export function parsePagination(query: ParsedQs): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(query['page']) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query['limit']) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
