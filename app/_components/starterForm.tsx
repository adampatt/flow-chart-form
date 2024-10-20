'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { createUser } from '../actions';
import { useFormState } from 'react-dom';
import { UserSchema } from '../zod/types';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Image from 'next/image';

const frequencyOptions = [
  { value: '3', label: '3', description: 'Beginners', recommendation: 'Great for those just starting their running journey!' },
  { value: '4', label: '4', description: 'Intermediate', recommendation: 'Excellent choice for building endurance and consistency.' },
  { value: '5', label: '5', description: 'Advanced', recommendation: 'Optimal for experienced runners aiming for peak performance.' },
];

export default function StarterForm() {
  const [state, formAction] = useFormState(createUser, null);
  const [selectedFrequency, setSelectedFrequency] = useState('3');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Get Started</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="mb-4 flex flex-col gap-2">
              <label className="block text-sm text-gray-700 text-center">Choose your fitness level</label>
              <Slider
                min={0}
                max={2}
                step={1}
                onValueChange={(value) => {
                  const levels: Array<z.infer<typeof UserSchema>['fitness_level']> = ['beginner', 'intermediate', 'advanced'];
                  return levels[value[0]];
                }}
                className="mt-2"
                name="fitness_level"
              />
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
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <span className="block text-sm font-medium text-gray-700 text-center">How many times per week do you want to run?</span>
              <RadioGroup
                value={selectedFrequency}
                onValueChange={setSelectedFrequency}
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
                        selectedFrequency === option.value
                          ? 'border-green-500 border-4 bg-[#4BB543] bg-opacity-30 text-white'
                          : 'border-muted bg-popover'
                      }`}
                    >
                      <Card className="w-full flex justify-center">
                        <CardContent className="pt-6 flex flex-col items-center">
                          <div className="mb-4 text-center flex flex-col items-center">
                            <span className="text-4xl font-bold">{option.label}</span>
                            <span className="text-sm font-medium text-gray-700">days</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button
              type="submit"
              className="w-full font-bold"
            >
              Get your plan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
