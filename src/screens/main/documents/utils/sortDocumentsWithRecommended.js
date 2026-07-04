export function sortDocumentsWithRecommended(documents, recommendedIds) {
  const recommendedSet = new Set(recommendedIds);
  const recommended = documents.filter(document => recommendedSet.has(document.id));
  const others = documents.filter(document => !recommendedSet.has(document.id));

  recommended.sort(
    (left, right) => recommendedIds.indexOf(left.id) - recommendedIds.indexOf(right.id),
  );

  return [
    ...recommended.map(document => ({ ...document, recommended: true })),
    ...others.map(document => ({ ...document, recommended: false })),
  ];
}
