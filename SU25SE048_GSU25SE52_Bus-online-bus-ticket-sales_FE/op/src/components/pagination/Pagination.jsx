import './Pagination.css';
import PropTypes from 'prop-types';
import { useMemo } from 'react';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1
}) => {
    const range = (start, end) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
    };

    const pageNumbers = useMemo(() => {
        const totalPageNumbers = siblingCount * 2 + 3 + boundaryCount * 2;

        if (totalPages <= totalPageNumbers) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const shouldShowLeftEllipsis = leftSiblingIndex > boundaryCount + 2;
        const shouldShowRightEllipsis = rightSiblingIndex < totalPages - (boundaryCount + 1);

        if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
            const leftRange = range(1, boundaryCount * 2 + siblingCount + 1);
            return [...leftRange, '...', ...range(totalPages - boundaryCount + 1, totalPages)];
        }

        if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
            const rightRange = range(totalPages - (boundaryCount * 2 + siblingCount), totalPages);
            return [...range(1, boundaryCount), '...', ...rightRange];
        }

        if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
            const middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [
                ...range(1, boundaryCount),
                '...',
                ...middleRange,
                '...',
                ...range(totalPages - boundaryCount + 1, totalPages),
            ];
        }

        return range(1, totalPages);
    }, [currentPage, totalPages, siblingCount, boundaryCount]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };

    return (
        <nav className="pagination" aria-label="Pagination">
            <button
                className="pagination-nav"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                aria-label="First page"
            >
                «
            </button>
            <button
                className="pagination-nav"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                ‹
            </button>

            {pageNumbers.map((page, index) => (
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                        …
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                className="pagination-nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                ›
            </button>
            <button
                className="pagination-nav"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
            >
                »
            </button>
        </nav>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    siblingCount: PropTypes.number,
    boundaryCount: PropTypes.number,
};

export default Pagination;