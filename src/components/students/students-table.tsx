'use client'

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { removeStudent } from "@/app/actions/students"
import { StudentStatsModal } from "@/components/students/student-stats-modal"

const roleLabels = {
  admin: "מנהל",
  support: "תמיכה",
  student: "סטודנט",
}

interface StudentsTableProps {
  initialStudents: any[]
}

export function StudentsTable({ initialStudents }: StudentsTableProps) {
  const [students, setStudents] = useState(initialStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sync state with props when server data refreshes
  useEffect(() => {
    setStudents(initialStudents)
  }, [initialStudents])

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function openStudentStats(student: any) {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setTimeout(() => setSelectedStudent(null), 300)
  }

  async function handleRemove(id: string) {
    if (!confirm("האם אתה בטוח שברצונך להסיר סטודנט זה?")) return
    
    // Optimistic update
    const previousStudents = [...students]
    setStudents(students.filter(s => s.id !== id))
    
    try {
      await removeStudent(id)
      toast.success("הסטודנט הוסר בהצלחה")
    } catch (error: any) {
      // Revert on error
      setStudents(previousStudents)
      toast.error(error.message || "שגיאה בהסרת הסטודנט")
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input 
              placeholder="חיפוש לפי שם או אימייל..." 
              className="pr-9 rounded-lg h-10 text-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 rounded-lg h-10 px-4 font-bold border-slate-200">
            <Filter className="w-3.5 h-3.5" />
            סינון
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[280px] text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider h-11 pe-4">שם ואימייל</TableHead>
              <TableHead className="w-[100px] text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider h-11">תפקיד</TableHead>
              <TableHead className="w-[130px] text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider h-11">קורסים רשומים</TableHead>
              <TableHead className="w-[130px] text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider h-11">תאריך הצטרפות</TableHead>
              <TableHead className="w-[70px] text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider h-11">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium text-sm">
                  לא נמצאו סטודנטים.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow 
                  key={student.id} 
                  className="hover:bg-slate-50/30 transition-colors cursor-pointer group"
                  onClick={() => openStudentStats(student)}
                >
                  <TableCell className="py-3 pe-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-lg shadow-sm group-hover:scale-105 transition-transform border border-slate-100">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-[10px]">
                          {student.name.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-right">
                        <span className="font-bold text-sm text-slate-800">{student.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{student.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="secondary" className="rounded font-bold text-[9px] py-0.5 px-1.5 bg-slate-100 text-slate-500 border-none uppercase tracking-wider">
                      {roleLabels[student.role as keyof typeof roleLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-700">{student.enrolled_courses_count || 0}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">קורסים</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-slate-500 text-xs font-medium">
                    {new Date(student.created_at).toLocaleDateString('he-IL').replace(/\//g, '.')}
                  </TableCell>
                  <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      onClick={() => handleRemove(student.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StudentStatsModal 
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}
