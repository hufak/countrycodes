import Papa from 'papaparse';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import './style.css';

const fields = ['name', 'level', 'studienkennzahl', 'language', 'institute', 'admission', 'stv', 'stuko', 'ws2025'];
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

    container.hidden = false;
    new DataTable('#studies', {
      data: parsed.data,
      columns: fields.map((data) => ({
        data,
        ...(data === 'ws2025' ? { type: 'num' } : {}),
        render: DataTable.render.text(),
        defaultContent: '',
      })),
      paging: false,
      searching: false,
      order: [[0, 'asc']],
      language: {
        emptyTable: 'No study programmes available.',
        info: 'Showing _TOTAL_ study programmes',
        infoEmpty: 'Showing 0 study programmes',
      },
    });
    status.textContent = '';
  } catch (error) {
    container.hidden = true;
    status.textContent = 'The study table could not be loaded. Please reload the page or download the CSV above.';
    console.error(error);
  }
}

loadStudies();
