'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { createUser } from '../actions';
import { UserSchema, FitnessLevel } from '../zod/types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Label } from '@radix-ui/react-label';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';

const frequencyOptions: Record<string, string>[] = [{ value: '3' }, { value: '4' }, { value: '5' }];
const fitnessLevel: typeof FitnessLevel = FitnessLevel;

const formSchemaTest = z.object({
  fitness_level: z.number(),
  times_per_week: z.string(),
});

export default function StarterForm() {
  const form = useForm<z.infer<typeof formSchemaTest>>({
    resolver: zodResolver(formSchemaTest),
    defaultValues: {
      fitness_level: 1,
      times_per_week: '4',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaTest>) {
    const parsedUserInput: z.infer<typeof UserSchema> = {
      fitness_level: fitnessLevel[values.fitness_level],
      times_per_week: parseInt(values.times_per_week, 10),
    };

    await createUser(parsedUserInput);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Get Started</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-4 flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="fitness_level"
                  render={({ field }) => (
                    <>
                      <FormItem>
                        <FormLabel className="block text-sm text-gray-700 text-center">Choose your fitness level</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={1}
                            className="mt-2"
                            name="fitness_level"
                            value={[field.value]}
                          />
                        </FormControl>
                      </FormItem>
                      <div className="flex justify-between text-xs mt-1">
                        <div className="flex flex-col items-center">
                          <Image
                            src="/svg/chart-bar-1.svg"
                            alt="Beginner Chart"
                            width={50}
                            height={50}
                          />
                          <span className="text-center mt-1 font-medium">Beginner</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Image
                            src="/svg/chart-bar-2.svg"
                            alt="Beginner Chart"
                            width={50}
                            height={50}
                          />
                          <span className="text-center mt-1 font-medium">Intermediate</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Image
                            src="/svg/chart-bar-3.svg"
                            alt="Beginner Chart"
                            width={50}
                            height={50}
                          />
                          <span className="text-center mt-1 font-medium">Advanced</span>
                        </div>
                      </div>
                    </>
                  )}
                />
                <FormField
                  control={form.control}
                  name="times_per_week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm text-gray-700 text-center">How many times per week do you want to run?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid gap-4 md:grid-cols-3"
                          name="workout_times_per_week"
                        >
                          {frequencyOptions.map((option) => (
                            <div key={option.value}>
                              <RadioGroupItem
                                value={option.value}
                                id={`workout_times_per_week_${option.value}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`workout_times_per_week_${option.value}`}
                                className={`flex flex-col items-center justify-between rounded-md p-4 hover:bg-accent hover:text-accent-foreground ${
                                  field.value === option.value
                                    ? 'border-green-500 border-4 bg-[#4BB543] bg-opacity-30 text-white'
                                    : 'border-muted bg-popover'
                                }`}
                              >
                                <Card className="w-full flex justify-center">
                                  <CardContent className="pt-6 flex flex-col items-center">
                                    <div className="mb-4 text-center flex flex-col items-center">
                                      <span className="text-4xl font-bold">{option.value}</span>
                                      <span className="text-sm font-medium text-gray-700">days</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full font-bold"
              >
                Get your plan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
