// utils/responseHandler.ts

export const responseHandler = {
  success(res: any, message: string, data?: any, status = 200) {
    return res.status(status).json({
      status,
      message,
      data,
    });
  },

  error(res: any, message: string, status = 500, error?: any) {
    return res.status(status).json({
      status,
      message,
      error,
    });
  },

  validationError(res: any, errors: any, message = "Validation failed", status = 400) {
    return res.status(status).json({
      status,
      message,
      errors,
    });
  },

  paginated(res: any, message: string, data: any[], total: number, page: number, perPage: number, status = 200) {
    const lastPage = Math.ceil(total / perPage);
    return res.status(status).json({
      status,
      message,
      data,
      pagination: {
        total,
        page,
        perPage,
        lastPage,
      },
    });
  },
};
