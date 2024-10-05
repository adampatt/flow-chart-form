"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, X } from "lucide-react"

const testData = {
  "Unit Tests": ["Function Test", "Class Test", "Module Test"],
  "Integration Tests": ["API Test", "Database Test", "Service Test"],
  "End-to-End Tests": ["UI Test", "User Flow Test", "Performance Test"],
}

type FormData = {
  testType: string
  testName: string
}

export default function Component() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTestType, setSelectedTestType] = useState("")
  const { control, handleSubmit, watch, setValue } = useForm<FormData>()

  const watchTestType = watch("testType")

  const onSubmit = (data: FormData) => {
    console.log(data)
    // Handle form submission here
  }

  const handleTestTypeChange = (value: string) => {
    setSelectedTestType(value)
    setValue("testName", "") // Reset testName when testType changes
  }

  const getDescription = (testType: string) => {
    switch (testType) {
      case "Unit Tests":
        return "Unit tests focus on verifying the correctness of individual components or functions in isolation."
      case "Integration Tests":
        return "Integration tests ensure that different parts of the application work together correctly."
      case "End-to-End Tests":
        return "End-to-end tests simulate real user scenarios to validate the entire application flow."
      default:
        return ""
    }
  }

  return (
    <div className="relative min-h-screen">
      <Button
        variant="ghost"
        className={`fixed right-0 top-0 h-full w-10 rounded-none bg-blue-500 hover:bg-blue-600 focus:ring-0 transition-opacity duration-300 ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </Button>

      <div
        className={`fixed right-0 top-0 h-full w-[400px] bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Select Test Type and Name</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground mb-6">
            Choose a test type and then select a specific test name.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="testType" className="text-sm font-medium">
                Test Type
              </label>
              <Controller
                name="testType"
                control={control}
                rules={{ required: "Test Type is required" }}
                render={({ field }) => (
                  <Select onValueChange={(value) => {
                    field.onChange(value)
                    handleTestTypeChange(value)
                  }}>
                    <SelectTrigger id="testType">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(testData).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="testName" className="text-sm font-medium">
                Test Name
              </label>
              <Controller
                name="testName"
                control={control}
                rules={{ required: "Test Name is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    disabled={!watchTestType}
                  >
                    <SelectTrigger id="testName">
                      <SelectValue placeholder="Select test name" />
                    </SelectTrigger>
                    <SelectContent>
                      {watchTestType &&
                        testData[watchTestType as keyof typeof testData].map(
                          (name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Button type="submit" className="w-full">Submit</Button>
          </form>
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{watchTestType || "No Test Type Selected"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{getDescription(watchTestType)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}