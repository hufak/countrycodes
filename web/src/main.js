import Papa from 'papaparse';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import './style.css';

const studentCountFields = new Set(['ws2025', 'ss2026']);
const fields = ['name', 'level', 'studienkennzahl', 'language', 'institute', 'admission', 'stv', 'stuko', 'ws2025', 'ss2026'];
const status = document.querySelector('#status');
const container = document.querySelector('.table-scroll');

async function loadStudies() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}angewandte_study_details.csv`);
    if (!response.ok) throw new Error(`CSV request failed: ${response.status}`);
    const parsed = Papa.parse(await response.text(), {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
    });
    if (parsed.errors.length || !fields.every((field) => parsed.meta.fields?.includes(field))) {
      throw new Error('The CSV has invalid rows or missing columns.');
    }

    const familyName = (name) => name.split(':', 1)[0].trim();
    const families = new Set(parsed.data.filter((row) => row.name.includes(':')).map((row) => familyName(row.name)));
    const rows = parsed.data.map((row) => ({
      ...row,
      programmeGroup: familyName(row.name),
      child: row.name.includes(':') ? 1 : 0,
    }));
    for (const name of families) {
      let parent = rows.find((row) => row.name === name);
      if (!parent) {
        parent = { ...Object.fromEntries(fields.map((field) => [field, ''])), name, programmeGroup: name, child: 0 };
        rows.push(parent);
      }
      const children = rows.filter((row) => row.child && row.programmeGroup === name);
      for (const field of fields) {
        if (parent[field] !== '' && parent[field] != null) continue;
        const values = children.map((row) => row[field] ?? '');
        // Study codes are identifiers, even when they contain only digits.
        if (studentCountFields.has(field)) {
          const counts = values.filter((value) => String(value).trim() !== '').map(Number);
          if (counts.length && counts.every(Number.isFinite)) {
            parent[field] = String(counts.reduce((total, count) => total + count, 0));
          }
        } else if (values.every((value) => value === values[0])) {
          parent[field] = values[0];
        }
      }
      const sharedFields = fields.filter((field) =>
        field !== 'name' && !studentCountFields.has(field) &&
        children.every((row) => row[field] === parent[field])
      );
      for (const child of children) {
        child.sharedFields = sharedFields;
        child.parent = parent;
      }
    }
    const expanded = new Set();
    const visibleRows = () => rows.filter((row) => !row.child || expanded.has(row.programmeGroup));
    const textRenderer = DataTable.render.text();

    container.hidden = false;
    const table = new DataTable('#studies', {
      data: visibleRows(),
      columns: [...fields.map((data) => ({
        data,
        ...(studentCountFields.has(data) ? { type: 'num' } : {}),
        render(value, type, row) {
          if (type === 'sort' && row.child) return row.parent[data];
          if (type !== 'display') return value;
          if (row.child && row.sharedFields.includes(data)) return '';
          if (data === 'name' && !row.child && families.has(row.name)) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'programme-toggle';
            button.dataset.group = row.name;
            button.setAttribute('aria-expanded', String(expanded.has(row.name)));
            button.textContent = row.name;
            return button;
          }
          return textRenderer.display(value);
        },
        defaultContent: '',
      })), { data: 'programmeGroup', visible: false }, { data: 'child', visible: false }],
      paging: false,
      searching: false,
      order: [[0, 'asc']],
      orderFixed: { post: [[fields.length, 'asc'], [fields.length + 1, 'asc']] },
      createdRow(element, row) {
        if (row.child) element.classList.add('programme-child');
        else if (families.has(row.name)) element.classList.add('programme-parent');
      },
      language: {
        emptyTable: 'No study programmes available.',
        info: 'Showing _TOTAL_ entries',
        infoEmpty: 'Showing 0 entries',
      },
    });
    container.addEventListener('click', (event) => {
      const button = event.target.closest('.programme-toggle');
      if (!button) return;
      const group = button.dataset.group;
      if (expanded.has(group)) expanded.delete(group);
      else expanded.add(group);
      table.clear().rows.add(visibleRows()).draw(false);
      [...container.querySelectorAll('.programme-toggle')]
        .find((toggle) => toggle.dataset.group === group)?.focus();
    });
    status.textContent = '';
  } catch (error) {
    container.hidden = true;
    status.textContent = 'The study table could not be loaded. Please reload the page or download the CSV above.';
    console.error(error);
  }
}

loadStudies();
