"use client";

import { LucideIcon } from "lucide-react";
import React, { useReducer } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { IconInput } from "../ui/input-icon";
import { cn } from "@/lib/utils";

interface TextInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  formatter: (value: string) => string;
  icon?: LucideIcon;
  maxLength: number;
  removeMask?: boolean;
  classNameItem?: string;
}

const InputMaskForm = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      form,
      name,
      label,
      placeholder,
      disabled = false,
      formatter,
      icon,
      maxLength,
      removeMask = true,
      classNameItem,
    },
    ref,
  ) => {
    const initialValue = form.getValues()[name]
      ? formatter(form.getValues()[name])
      : "";

    const [value, setValue] = useReducer((_: string, next: string) => {
      const digits = next.replace(/\D/g, "");
      return formatter(digits);
    }, initialValue);

    function handleChange(
      realChangeFn: (value: string) => void,
      formattedValue: string,
    ) {
      const digits = removeMask
        ? formattedValue.replace(/\D/g, "")
        : formattedValue;

      realChangeFn(digits);
    }

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          field.value = value;
          const _change = field.onChange;

          return (
            <FormItem className={cn("", classNameItem)}>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <div>
                  <IconInput
                    {...field}
                    StartIcon={icon}
                    placeholder={placeholder}
                    value={value}
                    ref={ref}
                    disabled={disabled}
                    maxLength={maxLength}
                    onChange={(e) => {
                      setValue(e.target.value);
                      handleChange(_change, e.target.value);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  },
);

InputMaskForm.displayName = "InputMaskForm";

export { InputMaskForm };
