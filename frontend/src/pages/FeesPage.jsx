import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { formatDate, fullName, money } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { FormField, inputClass } from '../components/ui/FormField.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Badge } from '../components/ui/Badge.jsx';

const terms = ['First Term', 'Second Term', 'Third Term'];

function feeTone(status) {
  if (status === 'paid') return 'green';
  if (status === 'partial') return 'amber';
  return 'rose';
}

export function FeesPage() {
  const { user } = useAuth();
  const canWrite = user.role === 'admin';
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    term: 'Third Term',
    session: '2025/2026',
    amountDue: '',
    amountPaid: '',
    dueDate: '',
    status: 'unpaid'
  });

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const [fees, studentData] = await Promise.all([
        api.get('/api/fees', { page: nextPage, limit: 10 }),
        canWrite ? api.get('/api/students', { limit: 100 }) : Promise.resolve({ data: [] })
      ]);
      setRows(fees.data || []);
      setMeta(fees.meta);
      setStudents(studentData.data || []);
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
      await api.post('/api/fees', {
        ...form,
        studentId: Number(form.studentId),
        amountDue: Number(form.amountDue),
        amountPaid: Number(form.amountPaid)
      });
      toast.success('Fee status saved');
      setModalOpen(false);
      load(page);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees"
        description="Track fee status by student, term, and session."
        actions={canWrite ? <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" />New</Button> : null}
      />

      <Card>
        <CardHeader title="Fee Records" description={`${meta?.total ?? rows.length} records`} />
        <DataTable
          columns={[
            { key: 'student', label: 'Student', render: (row) => fullName(row.student?.user) },
            { key: 'term', label: 'Term' },
            { key: 'session', label: 'Session' },
            { key: 'amountDue', label: 'Amount Due', render: (row) => money(row.amountDue) },
            { key: 'amountPaid', label: 'Amount Paid', render: (row) => money(row.amountPaid) },
            { key: 'dueDate', label: 'Due', render: (row) => formatDate(row.dueDate) },
            { key: 'status', label: 'Status', render: (row) => <Badge tone={feeTone(row.status)}>{row.status}</Badge> }
          ]}
          rows={rows}
          loading={loading}
          meta={meta}
          onPage={(nextPage) => {
            setPage(nextPage);
            load(nextPage);
          }}
        />
      </Card>

      <Modal open={modalOpen} title="Fee Status" onClose={() => setModalOpen(false)}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
          <FormField label="Student">
            <select className={inputClass()} value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} required>
              <option value="">Select student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{fullName(student.user)}</option>)}
            </select>
          </FormField>
          <FormField label="Term">
            <select className={inputClass()} value={form.term} onChange={(event) => setForm({ ...form, term: event.target.value })}>
              {terms.map((term) => <option key={term} value={term}>{term}</option>)}
            </select>
          </FormField>
          <FormField label="Session"><input className={inputClass()} value={form.session} onChange={(event) => setForm({ ...form, session: event.target.value })} required /></FormField>
          <FormField label="Due date"><input className={inputClass()} type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></FormField>
          <FormField label="Amount due"><input className={inputClass()} type="number" min="0" value={form.amountDue} onChange={(event) => setForm({ ...form, amountDue: event.target.value })} required /></FormField>
          <FormField label="Amount paid"><input className={inputClass()} type="number" min="0" value={form.amountPaid} onChange={(event) => setForm({ ...form, amountPaid: event.target.value })} required /></FormField>
          <FormField label="Status">
            <select className={inputClass()} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="unpaid">unpaid</option>
              <option value="partial">partial</option>
              <option value="paid">paid</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
