'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

<<<<<<< HEAD
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LinkPaginationProps {
  meta: PaginationMeta;
  baseUrl: string;
  additionalParams?: Record<string, string>;
}

interface ControlledPaginationProps {
=======
interface PaginationProps {
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

<<<<<<< HEAD
type PaginationProps = LinkPaginationProps | ControlledPaginationProps;

function isLinkProps(props: PaginationProps): props is LinkPaginationProps {
  return (props as LinkPaginationProps).meta !== undefined;
}

export const Pagination: React.FC<PaginationProps> = (props) => {
  const currentPage = isLinkProps(props) ? props.meta.page : props.currentPage;
  const totalPages = isLinkProps(props) ? props.meta.totalPages : props.totalPages;
=======
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return pages;
    }

    const halfMax = Math.floor(maxVisiblePages / 2);
    const start = Math.max(currentPage - halfMax, 1);
    const end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      return pages.slice(Math.max(end - maxVisiblePages + 1, 1) - 1, end);
    }

    return pages.slice(start - 1, end);
  };

<<<<<<< HEAD
  const buildHref = (page: number) => {
    if (!isLinkProps(props)) return '#';
    const params = new URLSearchParams({ ...(props.additionalParams || {}), page: String(page), limit: String(props.meta.limit) });
    return `${props.baseUrl}?${params.toString()}`;
  };

  const handlePrev = () => {
    if (isLinkProps(props)) return; // links handle via anchor
    (props as ControlledPaginationProps).onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (isLinkProps(props)) return;
    (props as ControlledPaginationProps).onPageChange(currentPage + 1);
  };
  const handleGoto = (page: number) => {
    if (isLinkProps(props)) return;
    (props as ControlledPaginationProps).onPageChange(page);
  };

  return (
    <nav className="flex items-center justify-center space-x-2 mt-8" aria-label="Pagination">
      {isLinkProps(props) ? (
        <a
          href={buildHref(currentPage - 1)}
          aria-disabled={currentPage === 1}
          className={`p-2 rounded-md hover:bg-gray-100 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </a>
      ) : (
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {getVisiblePages().map((page) => (
        isLinkProps(props) ? (
          <a
            key={page}
            href={buildHref(page)}
            className={`px-4 py-2 rounded-md ${
              currentPage === page ? 'bg-[#C9A14A] text-white' : 'hover:bg-gray-100'
            }`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </a>
        ) : (
          <button
            key={page}
            onClick={() => handleGoto(page)}
            className={`px-4 py-2 rounded-md ${
              currentPage === page ? 'bg-[#C9A14A] text-white' : 'hover:bg-gray-100'
            }`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      ))}

      {isLinkProps(props) ? (
        <a
          href={buildHref(currentPage + 1)}
          aria-disabled={currentPage === totalPages}
          className={`p-2 rounded-md hover:bg-gray-100 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </a>
      ) : (
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
=======
  return (
    <nav className="flex items-center justify-center space-x-2 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getVisiblePages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-md ${
            currentPage === page
              ? 'bg-[#C9A14A] text-white'
              : 'hover:bg-gray-100'
          }`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
    </nav>
  );
}; 