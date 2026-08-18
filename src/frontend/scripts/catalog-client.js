(() => {
  "use strict";

  const schemaVersion = "1.0";
  const jsonCache = new Map();

  class CatalogClientError extends Error {
    constructor(message, { code = "network-error", status = 0, retryable = true } = {}) {
      super(message);
      this.name = "CatalogClientError";
      this.code = code;
      this.status = status;
      this.retryable = retryable;
    }
  }

  async function requestUncached(path) {
    let response;
    try {
      response = await fetch(path, {
        headers: {
          Accept: "application/json",
          "X-AlgoInspect-Schema-Version": schemaVersion
        }
      });
    } catch {
      throw new CatalogClientError("No fue posible contactar la API del catálogo.");
    }

    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      const code = problem.code || (response.status === 404 ? "content-not-found" : "request-failed");
      throw new CatalogClientError(problem.detail || "La API del catálogo rechazó la solicitud.", {
        code,
        status: response.status,
        retryable: response.status >= 500 || response.status === 0
      });
    }

    const document = await response.json();
    const responseMajor = String(document.schemaVersion || "").split(".")[0];
    if (responseMajor !== schemaVersion.split(".")[0]) {
      throw new CatalogClientError("La versión del contenido no es compatible con esta web.", {
        code: "schema-version-incompatible",
        status: 409,
        retryable: false
      });
    }

    return document;
  }

  function request(path, { refresh = false } = {}) {
    if (refresh) jsonCache.delete(path);
    if (!jsonCache.has(path)) {
      const pending = requestUncached(path).catch((error) => {
        jsonCache.delete(path);
        throw error;
      });
      jsonCache.set(path, pending);
    }
    return jsonCache.get(path);
  }

  window.AlgoInspectCatalogClient = Object.freeze({
    schemaVersion,
    CatalogClientError,
    getCatalog: (options) => request("/api/catalog", options),
    getAlgorithm: (algorithmId, options) => request(`/api/algorithms/${encodeURIComponent(algorithmId)}`, options),
    getScenarios: (algorithmId, options) => request(`/api/algorithms/${encodeURIComponent(algorithmId)}/scenarios`, options),
    getImplementation: (algorithmId, language, options) => request(
      `/api/algorithms/${encodeURIComponent(algorithmId)}/implementations/${encodeURIComponent(language)}`,
      options),
    clear: () => jsonCache.clear()
  });
})();
