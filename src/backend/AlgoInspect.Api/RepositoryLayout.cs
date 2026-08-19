namespace AlgoInspect.Api;

internal sealed record ContentLayout(string CatalogRoot, string WebRoot);

/// <summary>
/// Resuelve dónde viven el catálogo canónico y la aplicación web.
/// </summary>
/// <remarks>
/// Orden de resolución, de más explícito a más inferido:
/// <list type="number">
/// <item>Configuración <c>Content:CatalogRoot</c> y <c>Content:WebRoot</c>. Vía recomendada:
/// reorganizar carpetas se resuelve en configuración, sin recompilar.</item>
/// <item>Configuración <c>RepositoryRoot</c>, que deriva ambas rutas de la raíz del repositorio.</item>
/// <item>Convención de la salida publicada: <c>catalog/</c> y <c>web/</c> junto al ejecutable.</item>
/// <item>Descubrimiento del repositorio recorriendo directorios hacia arriba. Respaldo de
/// conveniencia para desarrollo; es el único camino que depende de la estructura de carpetas.</item>
/// </list>
/// </remarks>
internal static class RepositoryLayout
{
    /// <summary>Rutas del contenido relativas a la raíz del repositorio.</summary>
    /// <remarks>
    /// Único lugar donde la estructura de carpetas del repositorio está codificada.
    /// Al mover <c>catalog/</c> o la aplicación web, actualizar aquí y en la configuración.
    /// </remarks>
    private const string RepositoryCatalogPath = "catalog";

    private static readonly string RepositoryWebPath = Path.Combine("src", "frontend");

    public static ContentLayout Find(
        string contentRoot,
        string applicationBaseDirectory,
        string environmentName,
        string? configuredCatalogRoot,
        string? configuredWebRoot,
        string? configuredRepositoryRoot)
    {
        if (!string.IsNullOrWhiteSpace(configuredCatalogRoot) ||
            !string.IsNullOrWhiteSpace(configuredWebRoot))
        {
            return FromConfiguredPaths(contentRoot, configuredCatalogRoot, configuredWebRoot);
        }

        if (!string.IsNullOrWhiteSpace(configuredRepositoryRoot))
        {
            return FromRepositoryRoot(Resolve(contentRoot, configuredRepositoryRoot));
        }

        // En desarrollo el ejecutable puede estar en bin/Debug mientras la interfaz
        // editable está en el repositorio. Priorizar el repositorio evita servir una
        // copia antigua después de reiniciar sin recompilar.
        if (string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase))
        {
            return FindRepositoryLayout(contentRoot);
        }

        ContentLayout? publishedLayout = FromPublishedOutput(applicationBaseDirectory);
        return publishedLayout ?? FindRepositoryLayout(contentRoot);
    }

    private static ContentLayout FromConfiguredPaths(
        string contentRoot,
        string? configuredCatalogRoot,
        string? configuredWebRoot)
    {
        if (string.IsNullOrWhiteSpace(configuredCatalogRoot) ||
            string.IsNullOrWhiteSpace(configuredWebRoot))
        {
            throw new InvalidOperationException(
                "Content:CatalogRoot y Content:WebRoot deben configurarse juntos. " +
                "Configurar solo una deja la otra ruta sin definir.");
        }

        ContentLayout layout = new(
            Resolve(contentRoot, configuredCatalogRoot),
            Resolve(contentRoot, configuredWebRoot));

        if (!HasExpectedContent(layout.CatalogRoot, layout.WebRoot))
        {
            throw new DirectoryNotFoundException(
                "La configuración Content no apunta a contenido válido. " +
                $"'{layout.CatalogRoot}' debe contener catalog.json y " +
                $"'{layout.WebRoot}' debe contener index.html.");
        }

        return layout;
    }

    private static ContentLayout? FromPublishedOutput(string applicationBaseDirectory)
    {
        string catalogRoot = Path.Combine(applicationBaseDirectory, "catalog");
        string webRoot = Path.Combine(applicationBaseDirectory, "web");
        return HasExpectedContent(catalogRoot, webRoot)
            ? new ContentLayout(catalogRoot, webRoot)
            : null;
    }

    private static ContentLayout FindRepositoryLayout(string startPath)
    {
        DirectoryInfo? directory = new(Path.GetFullPath(startPath));
        while (directory is not null)
        {
            ContentLayout candidate = FromRepositoryRoot(directory.FullName);
            if (HasExpectedContent(candidate.CatalogRoot, candidate.WebRoot))
            {
                return candidate;
            }

            directory = directory.Parent;
        }

        throw new DirectoryNotFoundException(
            "No se encontró el catálogo y la aplicación web en el repositorio ni en la salida " +
            "publicada. Configurar Content:CatalogRoot y Content:WebRoot para indicarlos de " +
            "forma explícita.");
    }

    private static ContentLayout FromRepositoryRoot(string repositoryRoot) =>
        new(
            Path.Combine(Path.GetFullPath(repositoryRoot), RepositoryCatalogPath),
            Path.Combine(Path.GetFullPath(repositoryRoot), RepositoryWebPath));

    /// <summary>Resuelve una ruta configurada, que puede ser absoluta o relativa a <paramref name="basePath"/>.</summary>
    private static string Resolve(string basePath, string configuredPath) =>
        Path.IsPathRooted(configuredPath)
            ? Path.GetFullPath(configuredPath)
            : Path.GetFullPath(Path.Combine(basePath, configuredPath));

    private static bool HasExpectedContent(string catalogRoot, string webRoot) =>
        File.Exists(Path.Combine(catalogRoot, "catalog.json")) &&
        File.Exists(Path.Combine(webRoot, "index.html"));
}
