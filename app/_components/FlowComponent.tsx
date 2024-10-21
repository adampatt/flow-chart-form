'use client';

import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, Node, Edge, NodeChange, EdgeChange, NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import steadyRunNode from './nodes/steadyRunNode';
import HillsDisplayNode from './nodes/hillsNode';
import longRunNode from './nodes/longRunNode';
import ParentNode from './nodes/parentNode';
import FormDrawer from './formDrawer';
import { z } from 'zod';
import { FlowNodeType, SelectedWorkoutSchema, UserWorkoutConstraints, WorkoutSchema } from '../zod/types';
import tempoRunNode from './nodes/tempoRunNode';
import ThresholdRunNode from './nodes/thresholdRunNode';
import WeekNode from './nodes/weekNode';

function nodePosition(weekNumber: number, nodeIndex: number): { x: number; y: number } {
  const parentX = 0;
  const parentY = -200; // Move parent node up
  const weekSpacing = 600; // Horizontal spacing between weeks
  const nodeSpacing = 300; // Vertical spacing between nodes within a week

  if (nodeIndex === -1) {
    // Week node
    return {
      x: parentX + (weekNumber - 2.5) * weekSpacing, // Center weeks horizontally
      y: parentY + 150, // Position weeks below the parent
    };
  } else {
    // Workout nodes
    return {
      x: parentX + (weekNumber - 2.5) * weekSpacing,
      y: parentY + 400 + nodeIndex * nodeSpacing,
    };
  }
}

const nodeTypes: Record<FlowNodeType, (props: NodeProps) => JSX.Element> = {
  steady: steadyRunNode,
  parent: ParentNode,
  hills: HillsDisplayNode,
  long: longRunNode,
  tempo: tempoRunNode,
  threshold: ThresholdRunNode,
  week: WeekNode,
};

function setNodesAndEdges(
  selectedWorkouts: z.infer<typeof SelectedWorkoutSchema>[],
  userId: string,
  userConstraints: z.infer<typeof UserWorkoutConstraints>,
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const handles = ['a', 'b', 'c', 'd'];

  const groupedData: { [key: number]: z.infer<typeof SelectedWorkoutSchema>[] } = {};

  nodes.push({
    id: 'Parent',
    type: 'parent',
    data: { userStressScore: userConstraints.fitness_level },
    position: { x: 0, y: -200 },
  });

  if (selectedWorkouts && selectedWorkouts.length > 0) {
    for (const selectedWorkout of selectedWorkouts) {
      if (!groupedData[selectedWorkout.week_number]) {
        groupedData[selectedWorkout.week_number] = [];
      }
      groupedData[selectedWorkout.week_number].push(selectedWorkout);
    }

    Object.entries(groupedData).forEach(([weekNumber, categoryNodes], index) => {
      const parsedWeekNumber = parseInt(weekNumber);
      const weekNodeId = `week-${parsedWeekNumber}`;

      // Calculate total stress for the week
      const weeklyTotalStress = categoryNodes.reduce((sum, workout) => sum + workout.stress!, 0);

      // Determine the background color based on the condition
      const weekWorkoutCountFull = categoryNodes.length < userConstraints.times_per_week;

      // Add week node
      nodes.push({
        id: weekNodeId,
        type: 'week',
        data: {
          weekNumber: parsedWeekNumber,
          weeklyTotalStress,
          usedHandles: ['out'],
          total_times_per_week: userConstraints.times_per_week,
          weekWorkoutCountFull,
        },
        position: nodePosition(parsedWeekNumber, -1),
      });

      // Connect parent to week node
      edges.push({
        id: `edge-parent-${weekNodeId}`,
        source: 'Parent',
        target: weekNodeId,
        sourceHandle: handles[index],
        targetHandle: 'in',
        type: 'smoothstep',
        style: { strokeWidth: 4, stroke: 'black' },
      });

      //Get the value of how many per week here and insert it into the category node use it in the edge
      categoryNodes.forEach((workout, nodeIndex: number) => {
        const nodeId = `node-${parsedWeekNumber}-${nodeIndex}`;
        const edgeId = `edge-${parsedWeekNumber}-${nodeIndex}`;

        nodes.push({
          id: nodeId,
          type: workout.type,
          data: {
            name: workout.name,
            description: workout.description,
            type: workout.type,
            duration: workout.duration,
            workout_id: workout.workout_id,
            stress: workout.stress,
            userId: userId,
            selected_id: workout.selected_id,
          },
          position: nodePosition(parsedWeekNumber, nodeIndex),
        });

        if (nodeIndex === 0) {
          // Connect week node to first workout node
          edges.push({
            id: edgeId,
            source: weekNodeId,
            target: nodeId,
            type: 'smoothstep',
            style: { strokeWidth: 4, stroke: weekWorkoutCountFull ? '#ef4444' : '#262626' },
          });
        } else {
          const sourceNodeId = `node-${parsedWeekNumber}-${nodeIndex - 1}`;
          edges.push({
            id: edgeId,
            source: sourceNodeId,
            target: nodeId,
            type: 'smoothstep',
            style: { strokeWidth: 4, stroke: weekWorkoutCountFull ? '#ef4444' : '#262626' },
          });
        }
      });
    });
  }
  return { nodes, edges };
}

interface FlowComponentProps {
  workouts: z.infer<typeof WorkoutSchema>[];
  selectedWorkouts: z.infer<typeof SelectedWorkoutSchema>[];
  userID: string;
  userWorkoutConstraints: z.infer<typeof UserWorkoutConstraints>;
}

export default function FlowComponent({ workouts, selectedWorkouts, userID, userWorkoutConstraints }: FlowComponentProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  useEffect(() => {
    const { nodes, edges } = setNodesAndEdges(selectedWorkouts, userID, userWorkoutConstraints);
    setNodes(nodes);
    setEdges(edges);
  }, [selectedWorkouts, workouts, userID, userWorkoutConstraints]);

  return (
    <div className="h-screen w-full flex">
      <div className={`h-full ${isDrawerOpen ? 'w-2/3' : 'w-full'}`}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          fitView
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <FormDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        workouts={workouts}
        userID={userID}
      />
    </div>
  );
}
