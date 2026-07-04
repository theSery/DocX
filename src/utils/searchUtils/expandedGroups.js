export function createExpandedGroupIds(groups) {
  return new Set(groups.map(group => group.id));
}

export function toggleExpandedGroupId(expandedGroupIds, groupId) {
  const next = new Set(expandedGroupIds);

  if (next.has(groupId)) {
    next.delete(groupId);
  } else {
    next.add(groupId);
  }

  return next;
}
