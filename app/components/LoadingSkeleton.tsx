"use client";

import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((key) => (
        <div
          key={key}
          className="glass-panel relative overflow-hidden rounded-2xl p-5 border border-white/10"
        >
          <div className="absolute inset-0 animate-shimmer" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-300/30 dark:bg-gray-700/30" />
              <div className="space-y-1.5">
                <div className="w-24 h-4 rounded bg-gray-300/40 dark:bg-gray-700/40" />
                <div className="w-16 h-3 rounded bg-gray-300/30 dark:bg-gray-700/30" />
              </div>
            </div>
            <div className="w-20 h-6 rounded-full bg-gray-300/30 dark:bg-gray-700/30" />
          </div>

          <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-gray-300/10 dark:bg-gray-700/10">
            <div className="w-full h-8 rounded bg-gray-300/20 dark:bg-gray-700/20" />
            <div className="w-full h-8 rounded bg-gray-300/20 dark:bg-gray-700/20" />
          </div>

          <div className="space-y-2 mt-4">
            <div className="w-full h-2 rounded-full bg-gray-300/30 dark:bg-gray-700/30" />
            <div className="flex justify-between">
              <div className="w-28 h-3 rounded bg-gray-300/20 dark:bg-gray-700/20" />
              <div className="w-12 h-3 rounded bg-gray-300/20 dark:bg-gray-700/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
