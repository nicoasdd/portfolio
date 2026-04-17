export interface SortableProject {
  entry: {
    data: {
      order: number;
      period: { start: string };
    };
  };
}

export function sortProjects<T extends SortableProject>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const orderDiff = a.entry.data.order - b.entry.data.order;
    if (orderDiff !== 0) return orderDiff;
    return b.entry.data.period.start.localeCompare(a.entry.data.period.start);
  });
}
