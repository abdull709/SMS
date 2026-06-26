import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatDate, fullName } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { FormField, inputClass } from '../components/ui/FormField.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function AssignmentsPage() {
  const { user } = useAuth();
  const canWrite = ['admin', 'teacher'].includes(user.role);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [gradeModal, setGradeModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    teacherId: '',
    dueDate: '',
    totalMarks: 100,
    status: 'published'
  });
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const [assignments, classData, subjectData, teacherData] = await Promise.all([
        api.get('/api/assignments', { page: nextPage, limit: 10 }),
        canWrite ? api.get('/api/classes', { limit: 100 }) : Promise.resolve({ data: [] }),
        canWrite ? api.get('/api/subjects', { limit: 100 }) : Promise.resolve({ data: [] }),
        user.role === 'admin' ? api.get('/api/teachers', { limit: 100 }) : Promise.resolve({ data: [] })
      ]);
      setRows(assignments.data || []);
      setMeta(assignments.meta);
      setClasses(classData.data || []);
      setSubjects(subjectData.data || []);
      setTeachers(teacherData.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  async function save(event) {
    event.preventDefault();
    try {
      await api.post('/api/assignments', {
        ...form,
        classId: Number(form.classId),
        subjectId: Number(form.subjectId),
        teacherId: form.teacherId ? Number(form.teacherId) : undefined,
        totalMarks: Number(form.totalMarks)
      });
      toast.success('Assignment created');
      setModalOpen(false);
      setForm({ title: '', description: '', classId: '', subjectId: '', teacherId: '', dueDate: '', totalMarks: 100, status: 'published' });
      load(page);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function submitAssignment(row) {
    try {
      await api.post(`/api/assignments/${row.id}/submissions`, {});
      toast.success('Assignment submitted');
      load(page);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function deleteAssignment() {
    try {
      await api.delete(`/api/assignments/${confirm.id}`);
      toast.success('Assignment deleted');
      setConfirm(null);
      load(page);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function gradeSubmission(event) {
    event.preventDefault();
    try {
      await api.put(`/api/assignments/${gradeModal.assignmentId}/submissions/${gradeModal.id}`, {
        score: Number(gradeForm.score),
        feedback: gradeForm.feedback
      });
      toast.success('Submission graded');
      setGradeModal(null);
      load(page);
    } catch (error) {
      toast.error(error.message);
    }
  }

  function openGrade(row) {
    const submission = row.submissions?.find((item) => ['submitted', 'graded'].includes(item.status)) || row.submissions?.[0];
    if (!submission) {
      toast.error('No submissions found for this assignment');
      return;
    }
    setGradeForm({ score: submission.score || '', feedback: submission.feedback || '' });
    setGradeModal(submission);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Create class assignments, track submissions, and grade completed work."
        actions={canWrite ? <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" />New</Button> : null}
      />

      <Card>
        <CardHeader title="Assignments" description={`${meta?.total ?? rows.length} records`} />
        <DataTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'class', label: 'Class', render: (row) => row.class?.name },
            { key: 'subject', label: 'Subject', render: (row) => row.subject?.name },
            { key: 'dueDate', label: 'Due', render: (row) => formatDate(row.dueDate) },
            { key: 'submissions', label: 'Submissions', render: (row) => `${row.submissions?.filter((item) => ['submitted', 'graded'].includes(item.status)).length || 0}/${row.submissions?.length || 0}` },
            { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'published' ? 'green' : 'amber'}>{row.status}</Badge> }
          ]}
          rows={rows}
          loading={loading}
          meta={meta}
          onPage={(nextPage) => {
            setPage(nextPage);
            load(nextPage);
          }}
          actions={(row) => (
            <>
              {user.role === 'student' ? (
                <Button variant="secondary" size="sm" onClick={() => submitAssignment(row)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit
                </Button>
              ) : null}
              {canWrite ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => openGrade(row)}>Grade</Button>
                  <Button variant="danger" size="icon" onClick={() => setConfirm(row)} aria-label="Delete assignment">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : null}
            </>
          )}
        />
      </Card>

      <Modal open={modalOpen} title="New Assignment" onClose={() => setModalOpen(false)}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <FormField label="Title"><input className={inputClass()} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></FormField>
          <FormField label="Due date"><input className={inputClass()} type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required /></FormField>
          <div className="sm:col-span-2">
            <FormField label="Description"><textarea className={`${inputClass()} h-auto py-2`} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></FormField>
          </div>
          <FormField label="Class">
            <select className={inputClass()} value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} required>
              <option value="">Select class</option>
              {classes.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
            </select>
          </FormField>
          <FormField label="Subject">
            <select className={inputClass()} value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} required>
              <option value="">Select subject</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </FormField>
          {user.role === 'admin' ? (
            <FormField label="Teacher">
              <select className={inputClass()} value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })} required>
                <option value="">Select teacher</option>
                {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{fullName(teacher.user)}</option>)}
              </select>
            </FormField>
          ) : null}
          <FormField label="Total marks"><input className={inputClass()} type="number" min="1" value={form.totalMarks} onChange={(event) => setForm({ ...form, totalMarks: event.target.value })} /></FormField>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Assignment</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(gradeModal)} title="Grade Submission" onClose={() => setGradeModal(null)}>
        <form className="grid gap-4" onSubmit={gradeSubmission}>
          <FormField label="Score">
            <input className={inputClass()} type="number" min="0" value={gradeForm.score} onChange={(event) => setGradeForm({ ...gradeForm, score: event.target.value })} required />
          </FormField>
          <FormField label="Feedback">
            <textarea className={`${inputClass()} h-auto py-2`} rows={3} value={gradeForm.feedback} onChange={(event) => setGradeForm({ ...gradeForm, feedback: event.target.value })} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setGradeModal(null)}>Cancel</Button>
            <Button type="submit">Save Grade</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        message="Delete this assignment and its submissions?"
        onCancel={() => setConfirm(null)}
        onConfirm={deleteAssignment}
      />
    </div>
  );
}
