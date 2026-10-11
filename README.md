# Country codes

## Study programme browser

The site also provides a searchable study programme table using Vite, Papa Parse
and DataTables. All records appear on one page, sorted by programme name by
default; select any column heading to change the sorting.
Empty fields remain blank. CSV values are rendered as text and
study codes retain their leading zeroes.

App source and dependencies live in `web/`; the root CSV files remain the
canonical data source. Generated files are not committed.

Use Node.js 24 LTS:

```sh
cd web
npm ci
npm run dev
```

Open the URL printed by Vite. To test the production build:

```sh
npm run build
npm run preview
```

Edit `angewandte_study_details.csv` in the repository root to update the table.
The browser loads it directly, including during local development. The build
copies all root CSV files into `web/dist/`
under their original names, preserving existing download URLs.

In GitHub **Settings → Pages → Build and deployment**, select **GitHub Actions**
as the source. The workflow builds and deploys on every push to `main`, and
checks the build on pull requests. It can also be run manually. The site is
configured for `/countrycodes/`; change `base` in `web/vite.config.js` if hosted
under another path or on a custom domain.

The table uses native table headers, a caption, labelled search, visible focus
indicators and DataTables' keyboard sorting.
Screen-reader testing of the deployed page is still recommended.

A handy CSV file mapping the arcane Austrian university student registry "country" codes to their corresponding names, linguistic/political region, continent, and their nationals' tuition fee status (specific to Angewandte, see below).

You can use raw download from the following URL: https://hufak.github.io/countrycodes/countries.csv

## Quellen

- Ländercodes
  - [Statistik Austria Staatenliste](https://www.statistik.at/fileadmin/pages/1183/Nation_Stand_2024.pdf) (Stand 2024), [BMBWF Codeliste](https://www.bmf.gv.at/dam/jcr:f8699d94-5ba2-4436-83d2-5991888f9791/Codelisten_AES_CSRD2.pdf) (Stand 2026)
  - [Universits-Studienevidenzverordnung](https://www.ris.bka.gv.at/eli/bgbl/ii/1997/245/ANL6/NOR40035226) (letzte gültige Fassung von 2004)
- Beitragsstatus
  - [DAC-Liste der OECD](https://www.oecd.org/en/topics/sub-issues/oda-eligibility-and-conditions/dac-list-of-oda-recipients.html#oda-recipients-list)
  - [Angewandte Website zu Studium > Finanzielles > Befreiung, Reduktion für ordentliche Studierende](https://www.dieangewandte.at/finanzielles):
    > 'Other low/lower middle/upper middle income country': Ordentliche Studierende mit Staatsangehörigkeit eines 'other low income country' oder eines 'lower middle income country' können gemäß DAC-Liste der OECD einen Antrag auf vollen Beitragserlass/-rückerstattung stellen, ordentliche Studierende mit Staatsangehörigkeit eines 'upper middle income country' einen Antrag auf Erlass/Rückerstattung des halben Studienbeitrags
