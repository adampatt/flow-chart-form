'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutSchema, WorkoutType, SelectWorkoutFormSchema, SelectWorkoutSchema } from '../zod/types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertWorkoutIntoWeek } from '../actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart, Ruler, Mountains, Smiley, Watch, ArrowFatRight, X } from '@phosphor-icons/react';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

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

const workoutTypeColors: Record<WorkoutType, { border: string; background: string }> = {
  threshold: { border: 'border-orange-500', background: 'bg-orange-500' },
  long: { border: 'border-blue-800', background: 'bg-blue-800' },
  steady: { border: 'border-green-500', background: 'bg-green-500' },
  hills: { border: 'border-red-900', background: 'bg-red-900' },
  tempo: { border: 'border-yellow-400', background: 'bg-yellow-400' },
};

export default function FormDrawer({ isDrawerOpen, setIsDrawerOpen, workouts, userID }: FormDrawerProps) {
  const form = useForm<z.infer<typeof SelectWorkoutFormSchema>>({
    resolver: zodResolver(SelectWorkoutFormSchema),
    defaultValues: {
      week_number: '',
      category: 'threshold',
      workout_id: '',
    },
  });

  const workoutTypes = useMemo(() => {
    return Array.from(new Set(workouts?.map((workout) => workout.type)));
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    const category = form.watch('category');
    if (!category) return workouts;
    return workouts.filter((workout) => workout.type === category);
  }, [form.watch('category'), workouts]);

  async function onSubmit(data: z.infer<typeof SelectWorkoutFormSchema>) {
    const transformedData: z.infer<typeof SelectWorkoutSchema> = {
      week_number: Number(data.week_number),
      user_id: userID,
      workout_id: data.workout_id,
    };

    await insertWorkoutIntoWeek(transformedData);
  }

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
          <p className="text-muted-foreground mb-6">Choose the type of workout you want, then select a specific one</p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="week_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week number</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a week" />
                        </SelectTrigger>
                      </FormControl>
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Workout Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-2"
                      >
                        {workoutTypes.map((type) => (
                          <div key={type}>
                            <RadioGroupItem
                              value={type}
                              id={`workout_type_${type}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`workout_type_${type}`}
                              className={`flex flex-col items-center justify-between rounded-md px-2 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer
                                ${
                                  field.value === type
                                    ? `${workoutTypeColors[type].border} border-4 ${workoutTypeColors[type].background} bg-opacity-30`
                                    : 'border border-muted'
                                }`}
                            >
                              {workoutTypeIcons[type]}
                              <span className="mt-1 text-sm font-medium text-gray-700">{type}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workout_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select workout">{form.getValues('category') || 'Select workout'}</SelectValue>
                        </SelectTrigger>
                      </FormControl>
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
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full font-bold"
              >
                Add to your training plan
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
