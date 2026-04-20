import { describe, expect, it } from 'vitest';
import { sortProjects } from '../../src/lib/sort';
import { shouldIncludeProject } from '../../src/lib/examples';

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

describe('shouldIncludeProject (HIDE_EXAMPLES filter)', () => {
  const realProject = {
    slug: 'cli-toolkit',
    isDraft: false,
    isProd: true,
    hideExamplesEnabled: false,
  };
  const exampleProject = { ...realProject, slug: 'example-personal' };

  it('includes real projects when HIDE_EXAMPLES is off', () => {
    expect(shouldIncludeProject(realProject)).toBe(true);
  });

  it('includes example projects when HIDE_EXAMPLES is off', () => {
    expect(shouldIncludeProject(exampleProject)).toBe(true);
  });

  it('excludes example projects when HIDE_EXAMPLES is on', () => {
    expect(shouldIncludeProject({ ...exampleProject, hideExamplesEnabled: true })).toBe(false);
  });

  it('still includes real projects when HIDE_EXAMPLES is on', () => {
    expect(shouldIncludeProject({ ...realProject, hideExamplesEnabled: true })).toBe(true);
  });

  it('excludes drafts in production regardless of HIDE_EXAMPLES', () => {
    expect(shouldIncludeProject({ ...realProject, isDraft: true })).toBe(false);
    expect(
      shouldIncludeProject({ ...realProject, isDraft: true, hideExamplesEnabled: true }),
    ).toBe(false);
  });

  it('keeps drafts in dev mode (isProd=false) when not an example', () => {
    expect(shouldIncludeProject({ ...realProject, isDraft: true, isProd: false })).toBe(true);
  });

  it('still excludes example drafts when HIDE_EXAMPLES is on, even in dev', () => {
    expect(
      shouldIncludeProject({
        ...exampleProject,
        isDraft: true,
        isProd: false,
        hideExamplesEnabled: true,
      }),
    ).toBe(false);
  });

  it('treats only the leading "example-" prefix as a marker', () => {
    expect(
      shouldIncludeProject({
        ...realProject,
        slug: 'examples-of-foo',
        hideExamplesEnabled: true,
      }),
    ).toBe(true);
    expect(
      shouldIncludeProject({
        ...realProject,
        slug: 'my-example-project',
        hideExamplesEnabled: true,
      }),
    ).toBe(true);
  });
});
