'use client'

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { updatePassword } from "@/app/actions/profile"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"

const passwordSchema = z.object({
  password: z.string().min(6, {
    message: "הסיסמה חייבת להכיל לפחות 6 תווים",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"],
})

export function PasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true)
    try {
      await updatePassword(values.password)
      toast.success("הסיסמה עודכנה בהצלחה")
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "שגיאה בעדכון הסיסמה")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">סיסמה חדשה</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      {...field} 
                      type={showPassword ? "text" : "password"} 
                      className="pr-10 pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">אימות סיסמה חדשה</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      {...field} 
                      type={showPassword ? "text" : "password"} 
                      className="pr-10 h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20">
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                מעדכן...
              </>
            ) : (
              "עדכן סיסמה"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}


