import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { resourceConfigs } from '../lib/resourceConfigs.jsx';
import { fullName } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader } from '../components/ui/Card.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { FormField, inputClass } from '../components/ui/FormField.jsx';
import { Modal } from '../components/ui/Modal.jsx';

const dependencyEndpoints = {
  classes: '/api/classes',
  teachers: '/api/teachers',
  parents: '/api/parents'
};

function optionLabel(type, row) {
  if (type === 'classes') return row.name;
  if (type === 'teachers' || type === 'parents') return fullName(row.user);
  return row.name || row.title || row.id;
}

function initialForm(config) {
  return Object.fromEntries(config.fields.map((field) => {
    if (field.type === 'multiselect') return [field.name, ['all']];
    if (field.type === 'select') return [field.name, field.options?.[0]?.value || ''];
    return [field.name, ''];
  }));
}

function normalizeForm(config, row) {
  const source = config.toForm ? config.toForm(row) : row;
  const form = initialForm(config);
  config.fields.forEach((field) => {
    let value = source[field.name];
    if (field.name === 'password') value = '';
    if (field.type === 'multiselect' && typeof value === 'string') value = value.split(',').map((item) => item.trim());
    if (field.type === 'multiselect' && !value) value = ['all'];
    form[field.name] = value ?? '';
  });
  return form;
}

function ResourceForm({ config, value, dependencies, onChange, onSubmit, onCancel, editing }) {
  const [errors, setErrors] = useState({});

  function setField(name, fieldValue) {
    onChange({ ...value, [name]: fieldValue });
  }

  function validate(event) {
    event.preventDefault();
    const nextErrors = {};
    config.fields.forEach((field) => {
      const isPasswordOnEdit = editing && field.name === 'password';
      if (field.required && !isPasswordOnEdit && !value[field.name]) {
        nextErrors[field.name] = 'Required';
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit();
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={validate}>
      {config.fields.map((field) => {
        const common = {
          id: field.name,
          value: value[field.name] ?? '',
          onChange: (event) => setField(field.name, event.target.value),
          className: inputClass(),
          placeholder: field.placeholder || ''
        };

        let control = <input type={field.type || 'text'} {...common} />;

        if (field.type === 'textarea') {
          control = <textarea {...common} rows={4} className={`${inputClass()} h-auto py-2`} />;
        }

        if (field.type === 'select') {
          const options = field.dependency
            ? (dependencies[field.dependency] || []).map((row) => ({ value: row.id, label: optionLabel(field.dependency, row) }))
            : field.options || [];
          control = (
            <select {...common}>
              <option value="">Select</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          );
        }

        if (field.type === 'multiselect') {
          const current = Array.isArray(value[field.name]) ? value[field.name] : [];
          control = (
            <div className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
              {(field.options || []).map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={current.includes(option.value)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      const next = checked
                        ? [...new Set([...current.filter((item) => item !== 'all'), option.value])]
                        : current.filter((item) => item !== option.value);
                      setField(field.name, next.length ? next : ['all']);
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-school-blue"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          );
        }

        return (
          <div key={field.name} className={field.type === 'textarea' || field.type === 'multiselect' ? 'sm:col-span-2' : ''}>
            <FormField label={field.label} error={errors[field.name]}>
              {control}
            </FormField>
          </div>
        );
      })}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{editing ? 'Save changes' : 'Create record'}</Button>
      </div>
    </form>
  );
}

export function ResourcePage({ type, titleOverride, descriptionOverride, readOnly = false }) {
  const config = resourceConfigs[type];
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => initialForm(config));
  const [confirm, setConfirm] = useState(null);
  const [dependencies, setDependencies] = useState({});

  const canWrite = !readOnly && config.writeRoles?.includes(user.role);
  const dependencyNames = useMemo(() => [...new Set(config.fields.map((field) => field.dependency).filter(Boolean))], [config.fields]);

  async function loadRows(nextPage = page, nextSearch = search) {
    setLoading(true);
    try {
      const data = await api.get(config.endpoint, { page: nextPage, search: nextSearch, limit: 10 });
      setRows(data.data || []);
      setMeta(data.meta);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows(1, search);
  }, [type]);

  useEffect(() => {
    async function loadDependencies() {
      const result = {};
      await Promise.all(dependencyNames.map(async (name) => {
        const data = await api.get(dependencyEndpoints[name], { limit: 100 });
        result[name] = data.data || [];
      }));
      setDependencies(result);
    }
    if (dependencyNames.length) loadDependencies().catch((error) => toast.error(error.message));
  }, [dependencyNames.join(',')]);

  function openCreate() {
    setEditing(null);
    setForm(initialForm(config));
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm(normalizeForm(config, row));
    setModalOpen(true);
  }

  async function save() {
    try {
      const payload = config.transform ? config.transform({ ...form }, Boolean(editing)) : { ...form };
      if (editing) {
        await api.put(`${config.endpoint}/${editing.id}`, payload);
        toast.success('Record updated');
      } else {
        await api.post(config.endpoint, payload);
        toast.success('Record created');
      }
      setModalOpen(false);
      loadRows(page, search);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function remove() {
    try {
      await api.delete(`${config.endpoint}/${confirm.id}`);
      toast.success('Record deleted');
      setConfirm(null);
      loadRows(page, search);
    } catch (error) {
      toast.error(error.message);
    }
  }

  function searchRows(value) {
    setSearch(value);
    setPage(1);
    loadRows(1, value);
  }

  return (
    <div>
      <PageHeader
        title={titleOverride || config.title}
        description={descriptionOverride || config.description}
        actions={canWrite ? (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New
          </Button>
        ) : null}
      />

      <Card>
        <CardHeader title={config.title} description={`${meta?.total ?? rows.length} records`} />
        <DataTable
          columns={config.columns}
          rows={rows}
          loading={loading}
          search={search}
          onSearch={searchRows}
          meta={meta}
          onPage={(nextPage) => {
            setPage(nextPage);
            loadRows(nextPage, search);
          }}
          onEdit={canWrite ? openEdit : null}
          onDelete={canWrite ? setConfirm : null}
        />
      </Card>

      <Modal open={modalOpen} title={editing ? `Edit ${config.title}` : `New ${config.title}`} onClose={() => setModalOpen(false)}>
        <ResourceForm
          config={config}
          value={form}
          dependencies={dependencies}
          onChange={setForm}
          onCancel={() => setModalOpen(false)}
          onSubmit={save}
          editing={Boolean(editing)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        message={`Delete ${config.title.toLowerCase()} record? This cannot be undone.`}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </div>
  );
}
