export interface BulkSlotGenerationRequest {
  doctorIds: string[];
  startDate: string; // Format: YYYY-MM-DD
  endDate: string;   // Format: YYYY-MM-DD
}

export interface DoctorSlotResult {
  doctorId: string;
  success: boolean;
  slotsGenerated: number;
  errorMessage?: string;
}

export interface BulkSlotGenerationResponse {
  startDate: string;
  endDate: string;
  totalDoctors: number;
  successfulGenerations: number;
  failedGenerations: number;
  totalSlotsGenerated: number;
  results: DoctorSlotResult[];
  message: string;
}
