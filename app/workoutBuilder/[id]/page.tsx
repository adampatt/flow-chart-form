'use server';
import React from 'react';
import { getAllWorkouts } from '../../actions';
import FlowComponent from '../../_components/FlowComponent';
import { dbFetchSelectedWorkoutsByUserId } from '@/app/db/services';

export default async function UserWorkoutDetails({ params }: { params: { id: string } }) {
  const workouts = await getAllWorkouts();
  const userId = params.id;
  const selectedWorkouts = await dbFetchSelectedWorkoutsByUserId(userId);
  return (
    <FlowComponent
      workouts={workouts.data ?? []}
      selectedWorkouts={selectedWorkouts.data ?? []}
      userID={userId}
    />
  );
}
