import React, { useEffect, useState } from "react";
import { ArrowUp, MoreHorizontal } from "lucide-react";

function AnimatedNumber({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    const duration = 800;
    const stepTime = 20;
    const increment = Math.ceil(end / (duration / stepTime));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}

export default function DashboardCards({ cards }) {
  const defaultCards = [
    {
      title: "Total Clubs",
      value: 0,
      delta: "+0",
      deltaLabel: "from this month",
    },
    {
      title: "Upcoming Events",
      value: 0,
      delta: "+0",
      deltaLabel: "from yesterday",
    },
    {
      title: "Total Users",
      value: 0,
      delta: "+0",
      deltaLabel: "from yesterday",
    },
    {
      title: "Active Members",
      value: 0,
      delta: "+0",
      deltaLabel: "from yesterday",
    },
  ];

  const list = cards?.length ? cards : defaultCards;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {list.map((c, i) => (
        <div
          key={i}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-md font-semibold">{c.title}</p>
            <MoreHorizontal size={18} className="text-[#9a9a9a]" />
          </div>

          {/* ✅ COUNTING ANIMATION FROM 0 */}
          <h3 className="text-3xl font-semibold text-white">
            <AnimatedNumber value={c.value} />
          </h3>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-[#0f2f16] text-[#34d399] px-2 py-1 rounded-full text-xs font-medium">
                <ArrowUp size={12} />
                {c.delta}
              </span>
              <span className="text-xs text-[#9a9a9a]">{c.deltaLabel}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
