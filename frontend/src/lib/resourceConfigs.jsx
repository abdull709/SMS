import { Badge } from '../components/ui/Badge.jsx';
import { formatDate, fullName } from './format.js';

const roleOptions = [
  { label: 'All roles', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Student', value: 'student' },
  { label: 'Parent', value: 'parent' }
];

function splitList(value) {
  if (Array.isArray(value)) return value;
  return String(value || 'all')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripEmptyPassword(payload) {
  if (!payload.password) delete payload.password;
  return payload;
}

function parseIds(value) {
  const items = Array.isArray(value) ? value : String(value || '').split(',');
  return items
    .map((item) => Number(String(item).trim()))
    .filter(Boolean);
}

export const resourceConfigs = {
  students: {
    title: 'Students',
    description: 'Create, assign, and maintain student records.',
    endpoint: '/api/students',
    writeRoles: ['admin'],
    columns: [
      { key: 'name', label: 'Name', render: (row) => fullName(row.user) },
      { key: 'email', label: 'Email', render: (row) => row.user?.email },
      { key: 'admissionNumber', label: 'Admission No.' },
      { key: 'class', label: 'Class', render: (row) => row.class?.name },
      { key: 'parents', label: 'Parents', render: (row) => row.parents?.map((parent) => fullName(parent.user)).join(', ') || '-' }
    ],
    fields: [
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true, createOnlyHint: true },
      { name: 'phone', label: 'Phone' },
      { name: 'classId', label: 'Class', type: 'select', dependency: 'classes', required: true },
      { name: 'admissionNumber', label: 'Admission number', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: [{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }, { label: 'Other', value: 'other' }] },
      { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'parentIds', label: 'Parents/Guardians', type: 'multiselect', dependency: 'parents' }
    ],
    toForm: (row) => ({
      ...row,
      firstName: row.user?.firstName,
      lastName: row.user?.lastName,
      email: row.user?.email,
      phone: row.user?.phone,
      parentIds: row.parents?.map((parent) => String(parent.id)) || []
    }),
    transform: (payload) => {
      const clean = stripEmptyPassword({ ...payload });
      clean.classId = Number(clean.classId);
      clean.parentIds = parseIds(clean.parentIds);
      return clean;
    }
  },
  teachers: {
    title: 'Teachers',
    description: 'Maintain teacher profiles and employee records.',
    endpoint: '/api/teachers',
    writeRoles: ['admin'],
    columns: [
      { key: 'name', label: 'Name', render: (row) => fullName(row.user) },
      { key: 'email', label: 'Email', render: (row) => row.user?.email },
      { key: 'employeeNumber', label: 'Employee No.' },
      { key: 'qualification', label: 'Qualification' },
      { key: 'specialization', label: 'Specialization' }
    ],
    fields: [
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'phone', label: 'Phone' },
      { name: 'employeeNumber', label: 'Employee number', required: true },
      { name: 'qualification', label: 'Qualification' },
      { name: 'specialization', label: 'Specialization' }
    ],
    toForm: (row) => ({
      ...row,
      firstName: row.user?.firstName,
      lastName: row.user?.lastName,
      email: row.user?.email,
      phone: row.user?.phone
    }),
    transform: (payload) => stripEmptyPassword({ ...payload })
  },
  parents: {
    title: 'Parents',
    description: 'Manage parent and guardian contact profiles.',
    endpoint: '/api/parents',
    writeRoles: ['admin'],
    columns: [
      { key: 'name', label: 'Name', render: (row) => fullName(row.user) },
      { key: 'email', label: 'Email', render: (row) => row.user?.email },
      { key: 'phone', label: 'Phone', render: (row) => row.user?.phone || '-' },
      { key: 'occupation', label: 'Occupation' },
      { key: 'children', label: 'Children', render: (row) => row.children?.map((child) => fullName(child.user)).join(', ') || '-' }
    ],
    fields: [
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'phone', label: 'Phone' },
      { name: 'occupation', label: 'Occupation' },
      { name: 'address', label: 'Address', type: 'textarea' }
    ],
    toForm: (row) => ({
      ...row,
      firstName: row.user?.firstName,
      lastName: row.user?.lastName,
      email: row.user?.email,
      phone: row.user?.phone
    }),
    transform: (payload) => stripEmptyPassword({ ...payload })
  },
  classes: {
    title: 'Classes',
    description: 'Nursery, primary, and secondary class groups.',
    endpoint: '/api/classes',
    writeRoles: ['admin'],
    columns: [
      { key: 'name', label: 'Class' },
      { key: 'level', label: 'Level', render: (row) => <Badge tone="green">{row.level}</Badge> },
      { key: 'section', label: 'Section' },
      { key: 'academicSession', label: 'Session' },
      { key: 'classTeacher', label: 'Class teacher', render: (row) => fullName(row.classTeacher?.user) }
    ],
    fields: [
      { name: 'name', label: 'Class name', required: true },
      { name: 'level', label: 'Level', type: 'select', required: true, options: [{ label: 'Nursery', value: 'nursery' }, { label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }] },
      { name: 'section', label: 'Section' },
      { name: 'academicSession', label: 'Academic session', required: true },
      { name: 'classTeacherId', label: 'Class teacher', type: 'select', dependency: 'teachers' }
    ],
    transform: (payload) => ({ ...payload, classTeacherId: payload.classTeacherId ? Number(payload.classTeacherId) : null })
  },
  subjects: {
    title: 'Subjects',
    description: 'Subjects used across class levels.',
    endpoint: '/api/subjects',
    writeRoles: ['admin'],
    columns: [
      { key: 'name', label: 'Subject' },
      { key: 'code', label: 'Code' },
      { key: 'level', label: 'Level', render: (row) => <Badge tone="blue">{row.level}</Badge> }
    ],
    fields: [
      { name: 'name', label: 'Subject name', required: true },
      { name: 'code', label: 'Code', required: true },
      { name: 'level', label: 'Level', type: 'select', options: [{ label: 'All', value: 'all' }, { label: 'Nursery', value: 'nursery' }, { label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }] }
    ]
  },
  announcements: {
    title: 'Announcements',
    description: 'Publish school notices to selected roles.',
    endpoint: '/api/announcements',
    writeRoles: ['admin'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'visibleTo', label: 'Visible to', render: (row) => row.visibleTo?.join(', ') || 'all' },
      { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'published' ? 'green' : 'amber'}>{row.status}</Badge> },
      { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) }
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'body', label: 'Message', type: 'textarea', required: true },
      { name: 'visibleTo', label: 'Visible to', type: 'multiselect', options: roleOptions },
      { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }] }
    ],
    transform: (payload) => ({ ...payload, visibleTo: splitList(payload.visibleTo) })
  },
  calendar: {
    title: 'Calendar Events',
    description: 'Manage academic dates, meetings, holidays, and exams.',
    endpoint: '/api/calendar-events',
    writeRoles: ['admin'],
    columns: [
      { key: 'title', label: 'Event' },
      { key: 'type', label: 'Type', render: (row) => <Badge tone="amber">{row.type}</Badge> },
      { key: 'startDate', label: 'Start', render: (row) => formatDate(row.startDate) },
      { key: 'endDate', label: 'End', render: (row) => formatDate(row.endDate) },
      { key: 'visibleTo', label: 'Visible to', render: (row) => row.visibleTo?.join(', ') || 'all' }
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'type', label: 'Type', type: 'select', options: [{ label: 'Academic', value: 'academic' }, { label: 'Holiday', value: 'holiday' }, { label: 'Exam', value: 'exam' }, { label: 'Meeting', value: 'meeting' }, { label: 'Event', value: 'event' }] },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'visibleTo', label: 'Visible to', type: 'multiselect', options: roleOptions }
    ],
    transform: (payload) => ({ ...payload, visibleTo: splitList(payload.visibleTo) })
  }
};
