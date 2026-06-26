import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { api } from '../lib/api.js';
import { fullName } from '../lib/format.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { FormField, inputClass } from '../components/ui/FormField.jsx';
import { Loader } from '../components/ui/Loader.jsx';
import { Badge } from '../components/ui/Badge.jsx';

const terms = ['First Term', 'Second Term', 'Third Term'];

export function ReportCardsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [term, setTerm] = useState('Third Term');
  const [session, setSession] = useState('2025/2026');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get('/api/students', { limit: 100 });
        setStudents(data.data || []);
        if (data.data?.[0]) setSelectedStudentId(data.data[0].id);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function generate(event) {
    event.preventDefault();
    setReportLoading(true);
    try {
      const data = await api.get(`/api/report-cards/student/${selectedStudentId}`, { term, session });
      setReport(data);
      toast.success('Report card loaded');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setReportLoading(false);
    }
  }

  async function download() {
    try {
      const student = students.find((item) => String(item.id) === String(selectedStudentId));
      await api.download(
        `/api/report-cards/student/${selectedStudentId}/pdf`,
        { term, session },
        `${student?.admissionNumber || 'report-card'}-${term}.pdf`
      );
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) return <Loader label="Loading students" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Report Cards" description="Generate report cards from grades and download PDF copies." />

      <Card>
        <CardHeader title="Report Selection" />
        <form className="grid gap-4 p-5 lg:grid-cols-4" onSubmit={generate}>
          <FormField label="Student">
            <select className={inputClass()} value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)} required>
              <option value="">Select student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{fullName(student.user)} · {student.class?.name}</option>)}
            </select>
          </FormField>
          <FormField label="Term">
            <select className={inputClass()} value={term} onChange={(event) => setTerm(event.target.value)}>
              {terms.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </FormField>
          <FormField label="Session">
            <input className={inputClass()} value={session} onChange={(event) => setSession(event.target.value)} required />
          </FormField>
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={reportLoading}>{reportLoading ? 'Loading' : 'View'}</Button>
            <Button variant="secondary" onClick={download}><Download className="h-4 w-4" />PDF</Button>
          </div>
        </form>
      </Card>

      {report ? (
        <Card>
          <CardHeader
            title={`${report.student.name} · ${report.student.class}`}
            description={`${report.term} · ${report.session} · Average ${report.average}% · Attendance ${report.attendance.percentage}%`}
            action={<Badge tone="green">{report.remarks}</Badge>}
          />
          <DataTable
            columns={[
              { key: 'subject', label: 'Subject' },
              { key: 'assessmentScore', label: 'Assessment' },
              { key: 'examScore', label: 'Exam' },
              { key: 'totalScore', label: 'Total' },
              { key: 'grade', label: 'Grade' },
              { key: 'remarks', label: 'Remarks' }
            ]}
            rows={report.subjects.map((subject, index) => ({ ...subject, id: index + 1 }))}
            loading={false}
          />
        </Card>
      ) : null}
    </div>
  );
}
