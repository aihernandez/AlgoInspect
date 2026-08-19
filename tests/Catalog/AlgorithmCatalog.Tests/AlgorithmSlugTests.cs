using AlgorithmCatalog.Domain;

namespace AlgorithmCatalog.Tests;

/// <summary>
/// <see cref="AlgorithmSlug"/> es la frontera entre una ruta recibida por HTTP y el
/// sistema de archivos. Estas pruebas fijan su contrato de lista blanca: solo se
/// aceptan letras y dígitos ASCII más el guion interior, y todo lo demás se rechaza.
/// </summary>
public sealed class AlgorithmSlugTests
{
    [Theory]
    [InlineData("kahn")]
    [InlineData("binary-search")]
    [InlineData("bubble-sort")]
    [InlineData("a")]
    [InlineData("algo1")]
    [InlineData("a-b-c")]
    public void TryCreate_AcceptsCanonicalIdentifiers(string candidate)
    {
        bool wasCreated = AlgorithmSlug.TryCreate(candidate, out AlgorithmSlug slug);

        Assert.True(wasCreated);
        Assert.Equal(candidate, slug.Value);
    }

    [Theory]
    [InlineData("KAHN", "kahn")]
    [InlineData("Binary-Search", "binary-search")]
    [InlineData("  kahn  ", "kahn")]
    [InlineData("\tkahn\n", "kahn")]
    public void TryCreate_NormalizesCaseAndSurroundingWhitespace(string candidate, string expected)
    {
        bool wasCreated = AlgorithmSlug.TryCreate(candidate, out AlgorithmSlug slug);

        Assert.True(wasCreated);
        Assert.Equal(expected, slug.Value);
    }

    [Theory]
    // Recorrido de directorios, directo y codificado.
    [InlineData("../secrets")]
    [InlineData("..")]
    [InlineData("../../etc/passwd")]
    [InlineData("..\\..\\windows\\system32")]
    [InlineData("%2e%2e%2fsecrets")]
    [InlineData("....//secrets")]
    // Separadores de ruta.
    [InlineData("kahn/other")]
    [InlineData("kahn\\other")]
    [InlineData("/kahn")]
    [InlineData("C:/kahn")]
    [InlineData("//servidor/recurso")]
    // Caracteres de control y terminadores.
    [InlineData("kahn\0evil")]
    [InlineData("kahn\nevil")]
    [InlineData("kahn\revil")]
    // Guion en posición inválida.
    [InlineData("-kahn")]
    [InlineData("kahn-")]
    [InlineData("-")]
    // Vacío y espacios.
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    // Símbolos que no aporta la lista blanca.
    [InlineData("kahn.json")]
    [InlineData("kahn_other")]
    [InlineData("kahn other")]
    [InlineData("kahn*")]
    [InlineData("kahn?")]
    [InlineData("kahn:stream")]
    [InlineData("$kahn")]
    // Fuera de ASCII: la lista blanca es deliberadamente estrecha.
    [InlineData("kähn")]
    [InlineData("算法")]
    [InlineData("kahn\u200b")]
    public void TryCreate_RejectsUnsafeIdentifiers(string? candidate)
    {
        bool wasCreated = AlgorithmSlug.TryCreate(candidate, out AlgorithmSlug slug);

        Assert.False(wasCreated);
        Assert.Equal(default(AlgorithmSlug), slug);
    }

    /// <summary>
    /// Los nombres de dispositivo reservados de Windows superan la lista blanca porque
    /// son alfanuméricos. No abren una ruta fuera del catálogo, porque el nombre se
    /// sigue resolviendo dentro de él, pero conviene fijar el comportamiento por escrito.
    /// </summary>
    [Theory]
    [InlineData("con")]
    [InlineData("nul")]
    [InlineData("com1")]
    public void TryCreate_AcceptsReservedDeviceNamesThatRemainInsideTheCatalog(string candidate)
    {
        bool wasCreated = AlgorithmSlug.TryCreate(candidate, out AlgorithmSlug slug);

        Assert.True(wasCreated);
        Assert.Equal(candidate, slug.Value);
    }

    [Fact]
    public void TryCreate_RejectsIdentifierWithSeparatorAfterNormalization()
    {
        // El recorte ocurre antes de validar: un separador interior debe seguir
        // rechazándose aunque los extremos queden limpios.
        bool wasCreated = AlgorithmSlug.TryCreate("  kahn/../secrets  ", out _);

        Assert.False(wasCreated);
    }

    [Fact]
    public void ToString_ReturnsNormalizedValue()
    {
        AlgorithmSlug.TryCreate("Binary-Search", out AlgorithmSlug slug);

        Assert.Equal("binary-search", slug.ToString());
    }
}
