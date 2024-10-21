'use server';
import React from 'react';
import { getAllWorkouts, getUserWorkoutConstraints } from '../../actions';
import FlowComponent from '../../_components/FlowComponent';
import { dbFetchSelectedWorkoutsByUserId } from '@/app/db/services';

export default async function UserWorkoutDetails({ params }: { params: { id: string } }) {
  const workouts = await getAllWorkouts();
  const userId = params.id;
  const selectedWorkouts = await dbFetchSelectedWorkoutsByUserId(userId);
  const userWorkoutConstraints = await getUserWorkoutConstraints(userId);

  console.log('userWorkoutConstraints', userWorkoutConstraints);
  return (
    <FlowComponent
      workouts={workouts.data ?? []}
      selectedWorkouts={selectedWorkouts.data ?? []}
      userID={userId}
      userWorkoutConstraints={
        userWorkoutConstraints.data ?? {
          fitness_level: 'beginner',
          times_per_week: 1,
        }
      }
    />
  );
}
