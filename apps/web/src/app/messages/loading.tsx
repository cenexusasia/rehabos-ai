import React from 'react';

export default function MessagesLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  );
}
