namespace AlgorithmCatalog.Tests;

internal static class RepositoryPaths
{
    public static string CatalogRoot { get; } = FindCatalogRoot();

    private static string FindCatalogRoot()
    {
        DirectoryInfo? directory = new(AppContext.BaseDirectory);
        while (directory is not null)
        {
            string candidate = Path.Combine(directory.FullName, "catalog", "catalog.json");
            if (File.Exists(candidate))
            {
                return Path.GetDirectoryName(candidate)!;
            }

            directory = directory.Parent;
        }

        throw new DirectoryNotFoundException("No se encontró catalog/catalog.json desde el proyecto de pruebas.");
    }
}
