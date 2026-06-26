import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  Megaphone,
  NotebookTabs,
  Receipt,
  School,
  Settings2,
  Users,
  UserRound,
  UserRoundCheck
} from 'lucide-react';

export const roleNavigation = {
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Teachers', path: '/admin/teachers', icon: UserRoundCheck },
    { label: 'Parents', path: '/admin/parents', icon: Users },
    { label: 'Classes', path: '/admin/classes', icon: School },
    { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { label: 'Teacher Assignments', path: '/admin/teacher-assignments', icon: Settings2 },
    { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { label: 'Grades', path: '/grades', icon: NotebookTabs },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays },
    { label: 'Report Cards', path: '/report-cards', icon: BarChart3 },
    { label: 'Fees', path: '/fees', icon: Receipt }
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'My Classes', path: '/teacher/classes', icon: School },
    { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { label: 'Grades', path: '/grades', icon: NotebookTabs },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Performance', path: '/teacher/performance', icon: BarChart3 },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays }
  ],
  student: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Profile', path: '/student/profile', icon: UserRound },
    { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { label: 'Grades', path: '/grades', icon: NotebookTabs },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Report Card', path: '/report-cards', icon: BarChart3 },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays }
  ],
  parent: [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Children', path: '/parent/children', icon: GraduationCap },
    { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
    { label: 'Grades', path: '/grades', icon: NotebookTabs },
    { label: 'Assignments', path: '/assignments', icon: FileText },
    { label: 'Report Cards', path: '/report-cards', icon: BarChart3 },
    { label: 'Fees', path: '/fees', icon: Receipt },
    { label: 'Announcements', path: '/announcements', icon: Megaphone },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays }
  ]
};
