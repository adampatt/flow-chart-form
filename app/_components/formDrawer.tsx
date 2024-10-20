'use client';

import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormState } from 'react-dom';
import { WorkoutSchema, WorkoutType } from '../zod/types';
import { z } from 'zod';
import { insertWorkoutIntoWeek } from '../actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart, Ruler, Mountains, Smiley, Watch, ArrowFatRight, X } from '@phosphor-icons/react';

interface FormDrawerProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  workouts: z.infer<typeof WorkoutSchema>[];
  userID: string;
}

const workoutTypeIcons: Record<WorkoutType, React.ReactElement> = {
  threshold: <Heart />,
  long: <Ruler />,
  hills: <Mountains />,
  steady: <Smiley />,
  tempo: <Watch />,
};

const workoutTypeColors: Record<WorkoutType, string> = {
  threshold: 'orange-500',
  long: 'blue-900',
  steady: 'green-500',
  hills: 'red-900',
  tempo: 'yellow-400',
};

export default function FormDrawer({ isDrawerOpen, setIsDrawerOpen, workouts, userID }: FormDrawerProps) {
  const { control, watch, setValue, handleSubmit } = useForm();
  const watchTestCategory = watch('category');
  const handleWorkoutTypeChange = (value: string) => {
    setValue('workoutType', value);
  };

  const workoutTypes = useMemo(() => {
    return Array.from(new Set(workouts?.map((workout) => workout.type)));
  }, []);

  console.log(workoutTypes.forEach((workout, index) => console.log('D', index, workout)));
  const filteredWorkouts = useMemo(() => {
    if (!watchTestCategory) return workouts;
    return workouts.filter((workout) => workout.type === watchTestCategory);
  }, [watchTestCategory, workouts]);

  const [state, formAction] = useFormState(insertWorkoutIntoWeek, null);
  const [selectedWorkoutName, setSelectedWorkoutName] = useState<string>('');

  const onSubmit = handleSubmit((data) => {
    console.log('onSubmitData', data);
    const formData = new FormData();
    formData.append('user_id', userID);
    formData.append('week_number', data.weekNumber);
    formData.append('workout_id', data.workout_id);

    formAction(formData);
  });

  return (
    <div className="relative min-h-screen">
      <Button
        variant="ghost"
        className={`fixed right-0 top-0 h-full w-10 rounded-none bg-slate-500  focus:ring-0 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setIsDrawerOpen(true)}
      >
        <ArrowFatRight
          size={64}
          weight="bold"
          color="#FFFFFF"
        />
      </Button>

      <div
        className={`fixed right-0 top-0 h-full w-[400px] bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Pick a workout type</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-500 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={26} />
            </Button>
          </div>
          <p className="text-muted-foreground mb-6">Choose the type of workout you want, then select a specific a specific one</p>
          <form
            onSubmit={onSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="week_number"
                className="text-sm font-medium"
              >
                Week number
              </label>
              <Controller
                name="weekNumber"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger id="week_number">
                      <SelectValue placeholder="Select a week" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((week) => (
                        <SelectItem
                          key={week}
                          value={String(week)}
                        >
                          Week {week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="workoutType"
                className="text-sm font-medium"
              >
                Workout Type
              </label>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Workout Type is required' }}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleWorkoutTypeChange(value);
                    }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {workoutTypes.map((type) => {
                      const color = workoutTypeColors[type];
                      return (
                        <div key={type}>
                          <RadioGroupItem
                            value={type}
                            id={`workout_type_${type}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`workout_type_${type}`}
                            className={`flex flex-col items-center justify-between rounded-md px-2 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer
                              ${field.value === type ? `border-${color} border-4 bg-${color} bg-opacity-30` : 'border border-muted'}`}
                          >
                            {workoutTypeIcons[type]}
                            <span className="mt-1 text-sm font-medium text-gray-700">{type}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="workout"
                className="text-sm font-medium"
              >
                Workout
              </label>
              <Controller
                name="workout_id"
                control={control}
                rules={{ required: 'Workout is required' }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const selectedWorkout = filteredWorkouts.find((w) => w.workout_id === value);
                      setSelectedWorkoutName(selectedWorkout ? selectedWorkout.name : '');
                    }}
                    disabled={!watchTestCategory}
                  >
                    <SelectTrigger id="workout">
                      <SelectValue placeholder="Select workout">{selectedWorkoutName || 'Select workout'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredWorkouts.map((workout) => (
                        <SelectItem
                          key={workout.workout_id}
                          value={workout.workout_id}
                        >
                          <div className="gap-y-2 flex flex-col">
                            <p className="font-bold">{workout.name}</p>
                            <p className="text-sm text-gray-700">{workout.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full font-bold"
            >
              Add to your training plan
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
