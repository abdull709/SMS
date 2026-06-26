import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { fullName } from '../lib/format.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { FormField, inputClass } from '../components/ui/FormField.jsx';
import { Modal } from '../components/ui/Modal.jsx';

export function TeacherAssignmentsPage() {
  const [rows, setRows] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ teacherId: '', classId: '', subjectId: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [assignments, teacherData, classData, subjectData] = await Promise.all([
        api.get('/api/teachers/assignments'),
        api.get('/api/teachers', { limit: 100 }),
        api.get('/api/classes', { limit: 100 }),
        api.get('/api/subjects', { limit: 100 })
      ]);
      setRows(assignments.data || []);
      setTeachers(teacherData.data || []);
      setClasses(classData.data || []);
      setSubjects(subjectData.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(event) {
    event.preventDefault();
    try {
      await api.post(`/api/teachers/${form.teacherId}/assignments`, {
        classId: Number(form.classId),
        subjectId: Number(form.subjectId)
      });
      toast.success('Teacher assigned');
      setModalOpen(false);
      setForm({ teacherId: '', classId: '', subjectId: '' });
      load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function remove() {
    try {
      await api.delete(`/api/teachers/assignments/${confirm.id}`);
      toast.success('Assignment removed');
      setConfirm(null);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Teacher Assignments"
        description="Connect teachers to the classes and subjects they can manage."
        actions={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" />New</Button>}
      />
      <Card>
        <CardHeader title="Assignments" description={`${rows.length} records`} />
        <DataTable
          columns={[
            { key: 'teacher', label: 'Teacher', render: (row) => fullName(row.teacher?.user) },
            { key: 'class', label: 'Class', render: (row) => row.class?.name },
            { key: 'subject', label: 'Subject', render: (row) => row.subject?.name }
          ]}
          rows={rows}
          loading={loading}
          onDelete={setConfirm}
        />
      </Card>

      <Modal open={modalOpen} title="Assign Teacher" onClose={() => setModalOpen(false)}>
        <form className="grid gap-4" onSubmit={save}>
          <FormField label="Teacher">
            <select className={inputClass()} value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })} required>
              <option value="">Select teacher</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{fullName(teacher.user)}</option>)}
            </select>
          </FormField>
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
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Assign</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        message="Remove this teacher assignment?"
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </div>
  );
}
