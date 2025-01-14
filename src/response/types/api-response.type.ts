export type ApiResponse<D = null> = {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: D;
};
