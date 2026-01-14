'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { UserPlus, Loader2, RefreshCw, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { inviteStudent, checkUserExists } from "@/app/actions/students"

const formSchema = z.object({
  email: z.string().email({
    message: "אימייל לא תקין",
  }),
  role: z.enum(["student", "support"], {
    required_error: "נא לבחור תפקיד",
  }),
})

interface InviteStudentSheetProps {
  children?: React.ReactNode
}

export function InviteStudentSheet({ children }: InviteStudentSheetProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [userStatus, setUserStatus] = useState<{ exists: boolean, inOrg: boolean } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "student",
    },
  })

  const emailValue = form.watch("email")

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (emailValue && emailValue.includes('@') && emailValue.includes('.')) {
        setCheckingEmail(true)
        try {
          const result = await checkUserExists(emailValue)
          if (result) {
            setUserStatus({ exists: true, inOrg: result.isAlreadyInOrg })
            if (result.isAlreadyInOrg) {
              form.setError("email", { message: "הסטודנט כבר רשום במכללה זו" })
            } else {
              form.clearErrors("email")
            }
          } else {
            setUserStatus({ exists: false, inOrg: false })
            form.clearErrors("email")
          }
        } catch (error) {
          console.error(error)
        } finally {
          setCheckingEmail(false)
        }
      } else {
        setUserStatus(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [emailValue, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await inviteStudent(values.email, values.role as 'student' | 'support')
      toast.success(userStatus?.exists ? "הסטודנט התווסף למכללה בהצלחה" : "הסטודנט התווסף למכללה. הוא יוכל לקבוע סיסמה בכניסה הראשונה.")
      setOpen(false)
      form.reset()
      setUserStatus(null)
    } catch (error: any) {
      toast.error(error.message || "שגיאה בביצוע הפעולה")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button size="sm" className="gap-2 rounded-lg h-10 px-4 font-bold">
            <UserPlus className="w-4 h-4" />
            הזמן סטודנט
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" dir="rtl" className="w-full sm:max-w-md rounded-l-xl">
        <SheetHeader className="text-right">
          <SheetTitle className="text-xl font-bold">הוספת סטודנט</SheetTitle>
          <SheetDescription className="text-xs">
            {userStatus?.exists 
              ? "הסטודנט כבר קיים במערכת. הוספתו למכללה תאפשר לו גישה עם הפרטים הקיימים שלו."
              : "הזינו את המייל של הסטודנט להוספה למערכת."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="text-right">
                  <div className="flex items-center justify-between h-6 mb-1">
                    <FormLabel className="font-bold text-xs text-slate-500 uppercase">אימייל</FormLabel>
                    {checkingEmail && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                    {!checkingEmail && userStatus?.exists && !userStatus.inOrg && (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none gap-1 py-0 px-1.5 h-5 text-[9px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        סטודנט קיים
                      </Badge>
                    )}
                  </div>
                  <FormControl>
                    <Input placeholder="example@email.com" {...field} className="rounded-lg h-10 text-sm" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {userStatus?.exists && !userStatus.inOrg && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 text-blue-800 animate-in fade-in zoom-in-95">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium leading-relaxed">
                  הסטודנט כבר רשום במערכת (במכללה אחרת). הוספתו למכללה שלך תאפשר לו להתחבר עם הסיסמה הקיימת שלו.
                </p>
              </div>
            )}

            {!userStatus?.exists && emailValue && emailValue.includes('@') && !checkingEmail && (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-2 text-amber-800 animate-in fade-in zoom-in-95">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium leading-relaxed">
                  סטודנט חדש. הוא יתבקש לקבוע סיסמה בכניסה הראשונה למערכת.
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="text-right">
                  <FormLabel className="font-bold text-xs text-slate-500 uppercase">תפקיד</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-lg h-10 text-sm">
                        <SelectValue placeholder="בחר תפקיד" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      <SelectItem value="student" className="text-sm font-medium">סטודנט</SelectItem>
                      <SelectItem value="support" className="text-sm font-medium">תמיכה</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button type="submit" className="w-full rounded-lg font-bold h-10 text-sm" disabled={isLoading || (userStatus?.inOrg ?? false)}>
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    מעבד...
                  </>
                ) : (
                  userStatus?.exists ? "הוסף למכללה" : "הוסף סטודנט חדש"
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
