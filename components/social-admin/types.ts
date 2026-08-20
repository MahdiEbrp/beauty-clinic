export interface BulkResult {
  requested: number;
  succeeded: number;
  failures: Array<{ id: string; code: string }>;
}

export type BulkAction = "activate" | "deactivate" | "delete";