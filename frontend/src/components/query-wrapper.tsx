

/**
 * A reusable wrapper to handle TanStack Query states.
 * Such as 
 * isLoading and error
 * this will simplify the pattern of
 * 
 * data && !isLoading && !error 
 * 
 * <>
 *  show data
 * </>

 */
import { type ReactNode } from "react";
import { LoadingOne } from "./loading";

interface QueryWrapperProps<T> {
  isLoading: boolean;
  error: Error | null | any;
  data: T | undefined;
  children: ReactNode;
  loader?: ReactNode;
  noResultsComponent?: ReactNode;
}

const QueryWrapper = <T,>({
  isLoading,
  error,
  data,
  children,
  noResultsComponent
}: QueryWrapperProps<T>) => {

  if (isLoading) return <LoadingOne/>;

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
        <p className="font-bold">Something went wrong</p>
        <p className="text-sm">{error.message || "Unknown Error"}</p>
      </div>
    );
  }

  if (!data) return <p>No data found</p>;

  if (data?.data?.results?.length === 0 || data?.results?.length === 0) {
    return <>{noResultsComponent ?? "No Record yet"}</>
  }

  return <>{children}</>;
};

export default QueryWrapper;