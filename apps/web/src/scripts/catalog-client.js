(() => {
  const jsonCache = new Map();

  async function request(path) {
    if (!jsonCache.has(path)) {
      jsonCache.set(path, fetch(path, { headers: { Accept: "application/json" } })
        .then((response) => response.ok ? response.json() : null)
        .catch(() => null));
    }

    return jsonCache.get(path);
  }

  window.AlgoInspectCatalogClient = Object.freeze({
    getCatalog: () => request("/api/catalog"),
    getAlgorithm: (algorithmId) => request(`/api/algorithms/${encodeURIComponent(algorithmId)}`),
    getImplementation: (algorithmId, language) => request(
      `/api/algorithms/${encodeURIComponent(algorithmId)}/implementations/${encodeURIComponent(language)}`),
  });
})();
