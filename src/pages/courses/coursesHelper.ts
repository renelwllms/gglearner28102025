// Common types and interfaces for Courses pages
export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

export const initialPaginationState: PaginationState = {
  current: 1,
  pageSize: 10,
  total: 0,
};

// Common pagination configuration
export const getPaginationConfig = (
  pagination: PaginationState,
  setPagination: (state: PaginationState) => void
) => ({
  ...pagination,
  showTotal: true,
  showJumper: true,
  sizeCanChange: true,
  onChange: (current: number, pageSize: number) => {
    setPagination({ ...pagination, current, pageSize });
  },
});
