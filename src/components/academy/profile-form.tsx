'use client'

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { updateProfile } from "@/app/actions/profile"
import { Loader2, User, Mail, ShieldCheck } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, {
    message: "השם חייב להכיל לפחות 2 תווים",
  }),
  email: z.string().email({
    message: "כתובת אימייל לא תקינה",
  }),
})

interface ProfileFormProps {
  initialData: {
    name: string
    email: string
    role: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
    },
  })

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true)
    try {
      await updateProfile(values)
      toast.success("הפרופיל עודכן בהצלחה")
    } catch (error: any) {
      toast.error(error.message || "שגיאה בעדכון הפרופיל")
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
            name="name"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">שם מלא</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input {...field} className="pr-10 h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">כתובת אימייל</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input {...field} type="email" className="pr-10 h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all" />
                  </div>
                </FormControl>
                <FormDescription className="text-[10px] text-slate-400 font-medium">
                  שינוי האימייל ידרוש אימות מחדש.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">תפקיד במערכת</label>
            <div className="relative group">
              <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                value={initialData.role === 'admin' ? 'מנהל אקדמיה' : 'תלמיד'} 
                disabled 
                className="pr-10 h-11 rounded-xl bg-slate-100 border-slate-100 text-slate-500 cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20">
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                מעדכן...
              </>
            ) : (
              "שמור שינויים"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}


