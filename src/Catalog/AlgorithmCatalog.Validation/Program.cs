using System.Text.Json;
using AlgorithmCatalog.Application;
using AlgorithmCatalog.Domain;
using AlgorithmCatalog.Infrastructure.FileSystem;

string catalogRoot = args.Length > 0
    ? Path.GetFullPath(args[0])
    : Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, "catalog"));

try
{
    IAlgorithmCatalog catalog = new FileSystemAlgorithmCatalog(
        new FileSystemCatalogOptions(catalogRoot));
    var overview = await catalog.ListAsync(CancellationToken.None);

    foreach (var algorithm in overview.Algorithms)
    {
        if (!AlgorithmSlug.TryCreate(algorithm.Id, out AlgorithmSlug algorithmSlug))
        {
            throw new InvalidDataException($"El catálogo contiene el identificador inválido '{algorithm.Id}'.");
        }

        var document = await catalog.GetAsync(algorithmSlug, CancellationToken.None)
            ?? throw new InvalidDataException($"No se encontró el documento de '{algorithm.Id}'.");

        foreach (var implementation in document.Implementations)
        {
            _ = await catalog.GetImplementationAsync(
                algorithmSlug,
                implementation.Language,
                CancellationToken.None)
                ?? throw new InvalidDataException(
                    $"No se encontró la implementación {algorithm.Id}/{implementation.Language}.");
        }
    }

    Console.WriteLine(
        $"Catálogo válido: {overview.Algorithms.Count} algoritmo(s), " +
        $"{overview.Languages.Count} perfil(es) de lenguaje.");
    return 0;
}
catch (Exception exception) when (
    exception is IOException or JsonException or InvalidDataException)
{
    Console.Error.WriteLine($"Catálogo inválido: {exception.Message}");
    return 1;
}
