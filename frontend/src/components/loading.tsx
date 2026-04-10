import React from "react";

// Spinner Base
const Spinner = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center w-full h-full">
    {children}
  </div>
);

// Loading Variation 1: Pulsing dots
export const LoadingOne = () => (
  <Spinner>
    <div className="flex space-x-2">
      <div className="w-4 h-4 bg-primary rounded-full animate-ping"></div>
      <div className="w-4 h-4 bg-primary rounded-full animate-ping animation-delay-200"></div>
      <div className="w-4 h-4 bg-primary rounded-full animate-ping animation-delay-400"></div>
    </div>
  </Spinner>
);

// Loading Variation 2: Spinning circle
export const LoadingTwo = () => (
  <Spinner>
    <div className="w-10 h-10 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
  </Spinner>
);

// Loading Variation 3: Bouncing bars
export const LoadingThree = () => (
  <Spinner>
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-6 bg-primary rounded animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  </Spinner>
);

// Loading Variation 4: Scaling circle
export const LoadingFour = () => (
  <Spinner>
    <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
  </Spinner>
);

// Loading Variation 5: Rotating blob
export const LoadingFive = () => (
  <Spinner>
    <div className="w-12 h-12 rounded-full bg-linear-to-tr from-primary to-accent animate-spin-slow"></div>
  </Spinner>
);

// Main Loading Export
const Loading = {
  LoadingOne,
  LoadingTwo,
  LoadingThree,
  LoadingFour,
  LoadingFive,
};

export default Loading;