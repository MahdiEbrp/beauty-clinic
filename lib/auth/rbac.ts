export const ROLE_KEYS = ["admin", "doctor", "receptionist", "customer"] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

export function hasRole(
  userRoles: readonly string[],
  ...allowed: readonly RoleKey[]
): boolean {
  return userRoles.some((role) => (allowed as readonly string[]).includes(role));
}

export function hasAllRoles(
  userRoles: readonly string[],
  ...required: readonly RoleKey[]
): boolean {
  return required.every((role) => userRoles.includes(role));
}

export function hasPermission(
  userPermissions: readonly string[],
  required: string | readonly string[],
): boolean {
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.every((permission) => userPermissions.includes(permission));
}

export function hasAnyPermission(
  userPermissions: readonly string[],
  candidates: readonly string[],
): boolean {
  return candidates.some((permission) => userPermissions.includes(permission));
}
