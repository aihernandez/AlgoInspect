namespace AlgorithmCatalog.Domain;

public readonly record struct AlgorithmSlug
{
    private AlgorithmSlug(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static bool TryCreate(string? candidate, out AlgorithmSlug slug)
    {
        slug = default;
        if (string.IsNullOrWhiteSpace(candidate))
        {
            return false;
        }

        string normalized = candidate.Trim().ToLowerInvariant();
        bool containsOnlySafeCharacters = normalized.All(
            character => char.IsAsciiLetterOrDigit(character) || character == '-');

        if (!containsOnlySafeCharacters || normalized.StartsWith('-') || normalized.EndsWith('-'))
        {
            return false;
        }

        slug = new AlgorithmSlug(normalized);
        return true;
    }

    public override string ToString() => Value;
}
