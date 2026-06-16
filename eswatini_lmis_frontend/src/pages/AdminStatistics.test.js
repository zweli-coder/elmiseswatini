import { normalizeUploadRow, ESWATINI_REGIONS } from './AdminStatistics';

describe('AdminStatistics upload normalization', () => {
  it('normalizes rows with standard headers', () => {
    const row = {
      year: '2024',
      category: 'Employment income',
      industry: 'Agriculture',
      region: 'Manzini',
      value: '22.5'
    };

    expect(normalizeUploadRow(row)).toEqual({
      year: '2024',
      category: 'Employment income',
      industry: 'Agriculture',
      region: 'Manzini',
      value: 22.5
    });
  });

  it('falls back to positional normalization when headers are invalid', () => {
    const row = {
      __EMPTY: '2024',
      'FIGURE 8: Time related underemployment rate ': 'Employment income',
      __EMPTY_1: 'Agriculture',
      __EMPTY_2: 'Manzini',
      __EMPTY_3: '15.0'
    };

    expect(normalizeUploadRow(row)).toEqual({
      year: '2024',
      category: 'Employment income',
      industry: 'Agriculture',
      region: 'Manzini',
      value: 15.0
    });
  });

  it('normalizes rows with generic column_1 names and 3 columns', () => {
    const row = {
      column_1: '2024',
      column_2: 'Employment income',
      column_3: '22.5'
    };

    expect(normalizeUploadRow(row)).toEqual({
      year: '2024',
      category: 'Employment income',
      industry: '',
      region: '',
      value: 22.5
    });
  });

  it('exports the four Eswatini regions for manual entry', () => {
    expect(ESWATINI_REGIONS).toEqual(['Hhohho', 'Manzini', 'Shiselweni', 'Lubombo']);
  });
});
