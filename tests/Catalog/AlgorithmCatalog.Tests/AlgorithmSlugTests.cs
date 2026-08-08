using AlgorithmCatalog.Domain;

namespace AlgorithmCatalog.Tests;

public sealed class AlgorithmSlugTests
{
    [Theory]
    [InlineData("../secrets")]
    [InlineData("kahn/other")]
    [InlineData("-kahn")]
    [InlineData("")]
    public void TryCreate_RejectsUnsafeIdentifiers(string candidate)
    {
        bool wasCreated = AlgorithmSlug.TryCreate(candidate, out _);

        Assert.False(wasCreated);
    }
}
