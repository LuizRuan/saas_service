import { IServiceRequest } from '../models/ServiceRequest';
import { UserRole } from '../types';

export function sanitizeServiceRequest(
  doc: IServiceRequest,
  requesterId: string,
  requesterRole: UserRole
): Record<string, any> {
  const obj: Record<string, any> = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  if (requesterRole === 'admin') return obj;
  if (obj.clientId?.toString() === requesterId) return obj;
  if (obj.selectedProviderId?.toString() === requesterId) return obj;

  delete obj.fullAddress;
  return obj;
}
