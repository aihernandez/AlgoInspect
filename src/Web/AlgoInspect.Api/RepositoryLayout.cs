namespace AlgoInspect.Api;

internal sealed record ContentLayout(string CatalogRoot, string WebRoot);

internal static class RepositoryLayout
{
    public static ContentLayout Find(
        string contentRoot,
        string applicationBaseDirectory,
        string? configuredRepositoryRoot)
    {
        if (!string.IsNullOrWhiteSpace(configuredRepositoryRoot))
        {
            return FromRepositoryRoot(configuredRepositoryRoot);
        }

        ContentLayout? publishedLayout = FromPublishedOutput(applicationBaseDirectory);
        return publishedLayout ?? FindRepositoryLayout(contentRoot);
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
            "No se encontró el catálogo y la aplicación web en el repositorio ni en la salida publicada.");
    }

    private static ContentLayout FromRepositoryRoot(string repositoryRoot) =>
        new(
            Path.Combine(Path.GetFullPath(repositoryRoot), "catalog"),
            Path.Combine(Path.GetFullPath(repositoryRoot), "apps", "web"));

    private static bool HasExpectedContent(string catalogRoot, string webRoot) =>
        File.Exists(Path.Combine(catalogRoot, "catalog.json")) &&
        File.Exists(Path.Combine(webRoot, "index.html"));
}
