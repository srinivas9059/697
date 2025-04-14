"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Bike,
  Car,
  CloudOff,
  BatteryCharging,
  Package,
  MapPin,
  Flag,
  Settings,
  Terminal,
  Info,
  Lightbulb,
  LayoutGrid,
  Menu,
} from "lucide-react";
//import { Gps } from '@/components/icons';

export default function Home() {
  const GRID_SIZE = 10;

  const cellTypes = {
    road: {},
    bikeLane: { icon: <Bike size={16} /> },
    chargingStation: { icon: <BatteryCharging size={16} /> },
    pollution: { icon: <CloudOff size={16} /> },
  };
  const initialGrid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => "road")
  );

  const initialAgentPosition = { x: 0, y: 0 };
  const initialBatteryLevel = 100;
  const initialTaskStatus = "idle";

  const [grid, setGrid] = useState(initialGrid);
  const [agentPosition, setAgentPosition] = useState(initialAgentPosition);
  const [batteryLevel, setBatteryLevel] = useState(initialBatteryLevel);
  const [taskStatus, setTaskStatus] = useState(initialTaskStatus);
  const [manualControl, setManualControl] = useState(false);
  const [sustainabilityScore, setSustainabilityScore] = useState(0); // [state] Sustainability Score

  // Function to generate a random grid
  const generateRandomGrid = () => {
    const newGrid = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => {
        const cellTypeKeys = Object.keys(cellTypes);
        return cellTypeKeys[Math.floor(Math.random() * cellTypeKeys.length)];
      })
    );
    setGrid(newGrid);
  };

  // [function] Calculate Sustainability Score

  // Effect to calculate sustainability score. For now it recalculates the score every 5 seconds

  // Manual Control functions
  const moveAgent = (direction: string) => {
    if (!manualControl || taskStatus === "success" || taskStatus === "failed")
      return;

    let newX = agentPosition.x;
    let newY = agentPosition.y;

    switch (direction) {
      case "up":
        newY = Math.max(0, newY - 1);
        break;
      case "down":
        newY = Math.min(GRID_SIZE - 1, newY + 1);
        break;
      case "left":
        newX = Math.max(0, newX - 1);
        break;
      case "right":
        newX = Math.min(GRID_SIZE - 1, newX + 1);
        break;
    }

    const cell = grid[newY][newX];

    // Update position visually first
    setAgentPosition({ x: newX, y: newY });

    // Check WIN condition first
    if (newX === 9 && newY === 9) {
      setTaskStatus("success");
      setManualControl(false);
      alert("🎉 Mission Complete! You delivered sustainably!");
      return;
    }

    // Handle cell effects
    if (cell === "bikeLane") {
      setSustainabilityScore((prev) => prev + 5);
    }

    if (cell === "pollution") {
      setSustainabilityScore((prev) => Math.max(0, prev - 10));
    }

    if (cell === "chargingStation") {
      setBatteryLevel((prev) => {
        const newLevel = Math.min(prev + 5, 100);
        alert("🔋 Recharged +5% at charging station!");
        return newLevel;
      });
    } else {
      setBatteryLevel((prev) => {
        const newLevel = Math.max(prev - 5, 0);
        if (newLevel <= 0) {
          setTaskStatus("failed");
          setManualControl(false);
          alert("💀 Battery depleted. Game over!");
        }
        return newLevel;
      });
    }

    // Task status visual feedback
    setTaskStatus("moving");
    setTimeout(() => setTaskStatus("idle"), 500);
  };
  function weightedBFS(grid, start, goal) {
    const directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];

    const cost = {
      road: 1,
      bikeLane: 0.5,
      chargingStation: 1,
      pollution: 100, // very high to avoid
    };

    const visited = Array.from({ length: grid.length }, () =>
      Array(grid[0].length).fill(false)
    );

    const queue = [[start, [start], 0]];
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
      queue.sort((a, b) => a[2] - b[2]); // sort by cost
      const [current, path, totalCost] = queue.shift();

      if (current.x === goal.x && current.y === goal.y) return path;

      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < grid[0].length &&
          ny < grid.length &&
          !visited[ny][nx]
        ) {
          const nextCell = grid[ny][nx];
          const stepCost = cost[nextCell] ?? 1;
          visited[ny][nx] = true;

          queue.push([
            { x: nx, y: ny },
            [...path, { x: nx, y: ny }],
            totalCost + stepCost,
          ]);
        }
      }
    }

    return null;
  }

  function bfsPathfind(
    grid: string[][],
    start: { x: number; y: number },
    goal: { x: number; y: number }
  ): { x: number; y: number }[] | null {
    const directions = [
      [0, -1], // up
      [0, 1], // down
      [-1, 0], // left
      [1, 0], // right
    ];

    const visited = Array.from({ length: grid.length }, () =>
      Array(grid[0].length).fill(false)
    );

    const queue: [{ x: number; y: number }, { x: number; y: number }[]][] = [
      [start, [start]],
    ];
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
      const [current, path] = queue.shift()!;

      if (current.x === goal.x && current.y === goal.y) {
        return path;
      }

      for (let [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < grid[0].length &&
          ny < grid.length &&
          !visited[ny][nx]
        ) {
          visited[ny][nx] = true;
          queue.push([{ x: nx, y: ny }, [...path, { x: nx, y: ny }]]);
        }
      }
    }

    return null; // no path found
  }
  async function animatePath(
    path: { x: number; y: number }[],
    setAgentPosition: (pos: { x: number; y: number }) => void,
    setTaskStatus: (status: string) => void
  ) {
    setTaskStatus("moving");

    for (const step of path) {
      await new Promise((res) => setTimeout(res, 300));
      setAgentPosition(step);

      const cell = grid[step.y][step.x];

      if (cell === "bikeLane") {
        setSustainabilityScore((prev) => prev + 5);
      } else if (cell === "pollution") {
        setSustainabilityScore((prev) => Math.max(0, prev - 10));
      }

      if (cell === "chargingStation") {
        setBatteryLevel((prev) => Math.min(prev + 5, 100));
      } else {
        setBatteryLevel((prev) => {
          const next = Math.max(prev - 5, 0);
          if (next <= 0) {
            setTaskStatus("failed");
            alert("💀 Battery depleted. Game over!");
          }
          return next;
        });
      }
    }

    if (path.at(-1)?.x === 9 && path.at(-1)?.y === 9) {
      setTaskStatus("success");
      alert("🎉 Mission Complete! You delivered sustainably!");
    } else {
      setTaskStatus("idle");
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <Card className="p-4 bg-white shadow mb-4">
        <CardTitle>🌍 Welcome to EcoRoute RL</CardTitle>
        <CardDescription className="text-sm mt-2 text-gray-700">
          You are controlling a delivery bot navigating a city. Your goal is to
          reach the destination while being sustainable.
          <ul className="mt-2 list-disc list-inside text-xs text-gray-600 space-y-1">
            <li>
              🚴 Use <strong>bike lanes</strong> to earn eco bonus points
            </li>
            <li>
              🌫️ Avoid <strong>pollution zones</strong> — they reduce your
              score!
            </li>
            <li>
              ⚡ Watch your <strong>battery level</strong> — when it hits 0,
              game over
            </li>
            <li>
              🎯 Reach <strong>bottom-right corner (9, 9)</strong> to complete
              the mission
            </li>
          </ul>
        </CardDescription>
      </Card>

      {/* 🎯 Mission Objective Banner */}
      <div className="mb-4 text-sm text-center text-gray-800 bg-yellow-100 p-2 rounded shadow-sm">
        🎯 <strong>Mission:</strong> Help the Delivery Bot reach{" "}
        <strong>(9, 9)</strong> while maximizing sustainability.
      </div>

      {/* 🧱 Tile Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-white border" /> Road
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-300 border" /> Bike Lane
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-100 border" /> Charging Station
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="2" />
          </svg>{" "}
          Delivery Bot
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 ">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 ">
          {/* City Grid Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-lg">City Grid</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                A 2D grid representing the city environment
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center ">
              <div
                className="grid gap-0.5 sm:gap-1 bg-gray-200 rounded-md p-1"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 2rem)`,
                }}
              >
                {grid.map((row, y) =>
                  row.map((cellType, x) => (
                    <div
                      key={`${x}-${y}`}
                      className="flex items-center justify-center text-sm border border-gray-300 relative w-full h-8"
                      style={{
                        backgroundColor:
                          cellType === "road"
                            ? "#FFFFFF"
                            : cellType === "bikeLane"
                            ? "#AEEA00"
                            : cellType === "chargingStation"
                            ? "#FFF9C4"
                            : "#FFCDD2", // For pollution
                      }}
                    >
                      {/* THIS is the correct place to paste conditionally rendered icons 👇 */}
                      {agentPosition.x === x && agentPosition.y === y && (
                        <motion.div
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="absolute top-1 left-1"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="1.5rem"
                                  height="1.5rem"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-3 w-3 text-blue-500"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <circle cx="12" cy="12" r="2" />
                                </svg>
                              </TooltipTrigger>
                              <TooltipContent>Delivery Bot</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </motion.div>
                      )}

                      {/* ✅ This is where you now add the flag */}
                      {x === 9 && y === 9 && (
                        <Flag
                          size={14}
                          className="absolute top-0 right-0 text-red-500"
                        />
                      )}

                      {cellTypes[cellType] && cellTypes[cellType].icon}
                    </div>
                  ))
                )}
              </div>
              <Button
                onClick={() => {
                  const path = weightedBFS(grid, agentPosition, {
                    x: 9,
                    y: 9,
                  });

                  if (path) {
                    animatePath(path.slice(1), setAgentPosition, setTaskStatus); // skip current position
                  } else {
                    alert("🚫 No path found to goal!");
                  }
                }}
                className="w-full mt-2"
              >
                🚗 Auto Navigate
              </Button>

              <Button onClick={generateRandomGrid} className="mt-4 w-full">
                Generate Random Grid
              </Button>
            </CardContent>
          </Card>
          {/* Agent Status Card */}

          <Card className="flex flex-col md:col-span-1">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-lg">Agent Status</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Current position, battery level, and task status
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center p-2 sm:p-4">
              <div className="space-y-1 sm:space-y-2 text-center p-2">
                <p className="text-xs sm:text-sm">
                  Position:{" "}
                  <strong>
                    ({agentPosition.x}, {agentPosition.y})
                  </strong>
                </p>
                <p className="text-xs sm:text-sm">
                  Battery Level: <strong>{batteryLevel}%</strong>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${batteryLevel}%`,
                      backgroundColor:
                        batteryLevel > 60
                          ? "#4caf50"
                          : batteryLevel > 30
                          ? "#ffeb3b"
                          : "#f44336",
                    }}
                  />
                </div>

                <p className="text-xs sm:text-sm">
                  Task Status: <strong>{taskStatus}</strong>
                </p>
                <p className="text-xs sm:text-sm">
                  Sustainability Score: <strong>{sustainabilityScore}</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="md:col-span-1 ">
            <CardHeader className="pb-2 sm:pb-3 ">
              <CardTitle className="text-sm sm:text-lg ">How to Play</CardTitle>
              <CardDescription className="text-xs sm:text-sm ">
                Instructions and game mechanics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 ">
              <div className="text-xs sm:text-sm space-y-2">
                <p>
                  1. The grid represents a city with roads, bike lanes, and
                  charging stations.
                </p>
                <p>2. The goal is to navigate the agent efficiently.</p>
                <p>
                  3. Use the sidebar to generate a random grid or enable manual
                  control.
                </p>
                <p>4. Monitor the agent's status and sustainability score.</p>
              </div>
            </CardContent>
          </Card>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setAgentPosition({ x: 0, y: 0 });
              setBatteryLevel(100);
              setSustainabilityScore(0);
              setTaskStatus("idle");
              generateRandomGrid();
            }}
          >
            🔁 Reset Game
          </Button>

          {/* Manual Control Card */}
          <Card className="md:col-span-1 ">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-lg">
                Manual Control
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manually control the agent
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-2 sm:p-4">
              <div className="flex flex-col items-center space-y-2 sm:space-y-4">
                <Button
                  onClick={() => setManualControl(!manualControl)}
                  className="w-full sm:w-auto"
                >
                  {manualControl
                    ? "Disable Manual Control"
                    : "Enable Manual Control"}
                </Button>
                {manualControl && (
                  <div className="grid grid-cols-3 gap-2 mt-2 sm:mt-4">
                    <div />
                    <Button onClick={() => moveAgent("up")} className="w-full">
                      Up
                    </Button>
                    <div />
                    <Button
                      onClick={() => moveAgent("left")}
                      className="w-full"
                    >
                      Left
                    </Button>
                    <Button
                      onClick={() => moveAgent("down")}
                      className="w-full"
                    >
                      Down
                    </Button>
                    <Button
                      onClick={() => moveAgent("right")}
                      className="w-full"
                    >
                      Right
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {(taskStatus === "success" || taskStatus === "failed") && (
          <Card className="md:col-span-4 mt-4 text-center bg-yellow-50 border border-yellow-300">
            <CardHeader>
              <CardTitle>
                {taskStatus === "success"
                  ? "🏁 Mission Complete"
                  : "💀 Game Over"}
              </CardTitle>
              <CardDescription className="text-sm">
                {taskStatus === "success"
                  ? `You reached the goal with ${batteryLevel}% battery left!`
                  : "You ran out of battery before reaching the destination."}
                <br />
                🌱 Sustainability Score: <strong>{sustainabilityScore}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  setAgentPosition({ x: 0, y: 0 });
                  setBatteryLevel(100);
                  setSustainabilityScore(0);
                  setTaskStatus("idle");
                  generateRandomGrid();
                }}
              >
                🔁 Play Again
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
