import React from 'react';

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  rangeStart,
  rangeEnd,
  totalItems,
}) => {
  if (totalItems <= 0) return null;

  return (
    <div className="pagination-bar">
      <span className="pagination-info">
        Showing {rangeStart}–{rangeEnd} of {totalItems}
      </span>
      {totalPages > 1 ? (
        <div className="pagination-controls">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span className="pagination-page">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Pagination;