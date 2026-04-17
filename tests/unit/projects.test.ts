import { describe, expect, it } from 'vitest';
import { sortProjects } from '../../src/lib/sort';

interface FakeProject {
  slug: string;
  category: 'personal' | 'startup' | 'corporate';
  entry: { data: { order: number; period: { start: string } } };
}

function fakeProject(
  slug: string,
  order: number,
  start: string,
  category: 'personal' | 'startup' | 'corporate' = 'personal',
): FakeProject {
  return {
    slug,
    category,
    entry: { data: { order, period: { start } } },
  };
}

describe('sortProjects', () => {
  it('sorts by order ascending', () => {
    const projects = [
      fakeProject('c', 30, '2020-01'),
      fakeProject('a', 10, '2020-01'),
      fakeProject('b', 20, '2020-01'),
    ];
    const sorted = sortProjects(projects).map((p) => p.slug);
    expect(sorted).toEqual(['a', 'b', 'c']);
  });

  it('breaks ties by period.start descending (newer first)', () => {
    const projects = [
      fakeProject('older', 10, '2020-01'),
      fakeProject('newer', 10, '2024-06'),
      fakeProject('middle', 10, '2022-03'),
    ];
    const sorted = sortProjects(projects).map((p) => p.slug);
    expect(sorted).toEqual(['newer', 'middle', 'older']);
  });

  it('does not mutate the input array', () => {
    const projects = [
      fakeProject('b', 20, '2020-01'),
      fakeProject('a', 10, '2020-01'),
    ];
    const original = projects.map((p) => p.slug);
    sortProjects(projects);
    expect(projects.map((p) => p.slug)).toEqual(original);
  });
});
