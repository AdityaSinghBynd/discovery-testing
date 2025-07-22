"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnimatedGraphSkeleton() {
  const [heights, setHeights] = useState([65, 40, 75, 50, 85, 60, 70])

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights((prevHeights) =>
        prevHeights.map((height) => Math.max(30, Math.min(85, height + Math.floor(Math.random() * 20) - 10))),
      )
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full rounded bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-sm text-[#9babc7] mb-2">
          Generating graph for the selected data...
        </CardTitle>
      </CardHeader>
      <CardContent>

        {/* Graph skeleton */}
        <div className="relative h-64 w-full border-l-2 border-b-2 border-gray-200">
          {/* Y-axis skeleton */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between py-2">
            <div className="h-2 w-3 bg-gray-100 rounded-md" />
            <div className="h-2 w-3 bg-gray-100 rounded-md" />
            <div className="h-2 w-3 bg-gray-100 rounded-md" />
            <div className="h-2 w-3 bg-gray-100 rounded-md" />
            <div className="h-2 w-3 bg-gray-100 rounded-md" />
          </div>

          {/* Graph bars */}
          <div className="absolute left-5 right-0 top-0 bottom-6 flex items-end justify-around">
            {heights.map((height, index) => (
              <motion.div
                key={index}
                className="w-12 bg-gray-100 rounded-t"
                style={{ height: `${height}%` }}
                initial={{ height: `${height}%` }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <motion.div
                  className="w-full h-full bg-[primary/30] rounded"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* X-axis skeleton */}
          <div className="absolute left-5 right-0 bottom-0 flex justify-around items-end">
            {Array(7)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="h-2 w-5 bg-gray-100 " />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

